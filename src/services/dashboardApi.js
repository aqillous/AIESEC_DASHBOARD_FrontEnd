const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const TOKEN_KEY = 'aiesec_dashboard_access_token';
const resources = [
  'posts',
  'ideas',
  'events',
  'campaigns',
  'tasks',
  'team',
  'analytics',
  'analytics_extra'
];

let baseline = {};
const saveQueues = new Map();

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function addAnalyticsRowIds(value) {
  const extra = clone(value || {});
  for (const [platform, metrics] of Object.entries(extra)) {
    if (!metrics || typeof metrics !== 'object') continue;
    for (const [key, rows] of Object.entries(metrics)) {
      if (!Array.isArray(rows)) continue;
      rows.forEach((row, index) => {
        if (row && typeof row === 'object' && row.id === undefined) {
          row.id = `legacy-${platform}-${key}-${index}`;
        }
      });
    }
  }
  return extra;
}

function normalizeResource(resource, value) {
  return resource === 'analytics_extra' ? addAnalyticsRowIds(value) : clone(value);
}

function tokenFromUrl() {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('token');
  if(token){
    localStorage.setItem(TOKEN_KEY, token);
    url.searchParams.delete('token');
    window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
  }
}

export function getToken() {
  tokenFromUrl();
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function decodeUser(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const role = payload.role || payload.user_role || '';
    return {
      email: payload.email || payload.preferred_username || '',
      displayName: payload.name || payload.full_name || payload.email || 'AIESEC user',
      is_admin: payload.is_admin === true || payload.isAdmin === true || String(role).toLowerCase() === 'admin',
      role,
      ...payload
    };
  } catch {
    return { email: '', displayName: 'AIESEC user', is_admin: false };
  }
}

export function getUser() {
  const token = getToken();
  return token ? decodeUser(token) : null;
}

export function startGoogleLogin() {
  window.location.href = `${API_BASE_URL}/api/v2/dashboard/auth/google-login`;
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error('You are signed out. Sign in with Google to continue.');
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers
      }
    });
  } catch (error) {
    const apiOrigin = API_BASE_URL || 'the configured local API proxy';
    throw new Error(`Could not reach ${apiOrigin}. Check your connection and backend CORS settings.`);
  }

  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new CustomEvent('dashboard-auth-expired'));
    throw new Error('Your sign-in expired. Please sign in with Google again.');
  }

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const detail = payload && typeof payload === 'object'
      ? payload.detail || payload.message || payload.error
      : payload;
    const message = typeof detail === 'string'
      ? detail
      : JSON.stringify(detail ?? response.statusText ?? 'Request failed.');
    throw new Error(`API error (${response.status}): ${message}`);
  }
  return payload;
}

export async function loadDashboard() {
  const dashboard = await apiRequest('/api/v2/dashboard');
  baseline = Object.fromEntries(resources.map((resource) => [
    resource,
    normalizeResource(
      resource,
      dashboard?.[resource] ?? (resource === 'analytics' || resource === 'analytics_extra' ? {} : [])
    )
  ]));
  return Object.fromEntries(resources.map((resource) => [resource, clone(baseline[resource])]));
}

export function loadCurrentDashboardUser() {
  return apiRequest('/api/v2/dashboard/auth/me');
}

function equal(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function mergeArrays(original, desired, latest) {
  if (![original, desired, latest].every(Array.isArray)) return clone(desired);
  const getId = (item) => item && typeof item === 'object' ? item.id : undefined;
  if ([...original, ...desired, ...latest].some((item) => getId(item) === undefined)) {
    return mergeIndexedArrays(original, desired, latest);
  }

  const result = latest.map(clone);
  for (const before of original) {
    const desiredIndex = desired.findIndex((item) => getId(item) === getId(before));
    const latestIndex = result.findIndex((item) => getId(item) === getId(before));
    if (desiredIndex === -1) {
      if (latestIndex !== -1 && equal(result[latestIndex], before)) result.splice(latestIndex, 1);
    } else if (!equal(desired[desiredIndex], before) && latestIndex !== -1) {
      result[latestIndex] = mergeConcurrent(before, desired[desiredIndex], result[latestIndex]);
    }
  }
  for (const item of desired) {
    if (!original.some((before) => getId(before) === getId(item))) result.push(clone(item));
  }
  return result;
}

function mergeIndexedArrays(original, desired, latest) {
  const merged = latest.map(clone);
  for (let index = 0; index < original.length; index += 1) {
    if (index >= desired.length) {
      if (index < merged.length && equal(merged[index], original[index])) merged.splice(index, 1);
    } else if (!equal(original[index], desired[index])) {
      merged[index] = mergeConcurrent(original[index], desired[index], merged[index]);
    }
  }
  for (let index = original.length; index < desired.length; index += 1) {
    merged.push(clone(desired[index]));
  }
  return merged;
}

function mergeConcurrent(original, desired, latest) {
  if (equal(original, desired)) return clone(latest);
  if (Array.isArray(original) || Array.isArray(desired) || Array.isArray(latest)) {
    return mergeArrays(original, desired, latest);
  }
  if (
    original && desired && latest &&
    typeof original === 'object' && typeof desired === 'object' && typeof latest === 'object'
  ) {
    const result = clone(latest);
    for (const key of new Set([...Object.keys(original), ...Object.keys(desired)])) {
      if (!(key in desired)) {
        if (equal(latest[key], original[key])) delete result[key];
      } else if (!(key in original)) {
        result[key] = clone(desired[key]);
      } else if (!equal(original[key], desired[key])) {
        result[key] = mergeConcurrent(original[key], desired[key], latest[key]);
      }
    }
    return result;
  }
  return clone(desired);
}

export function replaceResource(resource, desired) {
  const previous = saveQueues.get(resource) || Promise.resolve();
  const save = previous.catch(() => {}).then(async () => {
    const latest = normalizeResource(resource, await apiRequest(`/api/v2/dashboard/${resource}`));
    const original = baseline[resource] ?? clone(latest);
    const merged = mergeConcurrent(original, desired, latest);
    baseline[resource] = clone(latest);
    await apiRequest(`/api/v2/dashboard/${resource}`, {
      method: 'PUT',
      body: JSON.stringify(merged)
    });
    const current = normalizeResource(resource, await apiRequest(`/api/v2/dashboard/${resource}`));
    baseline[resource] = clone(current ?? merged);
    return clone(baseline[resource]);
  });
  saveQueues.set(resource, save);
  return save;
}

export function getResourceBaseline(resource) {
  return clone(baseline[resource]);
}

export async function studioRequest(tool, body) {
  return apiRequest(`/api/v2/dashboard/studio/${tool}`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
