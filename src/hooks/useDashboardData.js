import { useCallback, useEffect, useState } from 'react';
import {
  clearToken,
  createDashboardUser,
  deleteDashboardUser,
  getResourceBaseline,
  getToken,
  getUser,
  loadCurrentDashboardUser,
  loadDashboard,
  replaceResource,
  updateDashboardUser
} from '../services/dashboardApi.js';

const emptyData = {
  posts: [],
  ideas: [],
  events: [],
  campaigns: [],
  tasks: [],
  team: [],
  analytics: {},
  analytics_extra: {}
};

export function useDashboardData(notify) {
  const [user, setUser] = useState(() => getUser());
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) return undefined;
    let active = true;
    setLoading(true);
    Promise.all([loadDashboard(), loadCurrentDashboardUser()])
      .then(([result, currentUser]) => {
        if (!active) return;
        setData(result);
        setUser(currentUser);
        setError('');
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    function handleAuthExpired() {
      setUser(null);
      setData(emptyData);
      setError('Your sign-in expired or is no longer valid. Please sign in with Google again.');
    }
    window.addEventListener('dashboard-auth-expired', handleAuthExpired);
    return () => window.removeEventListener('dashboard-auth-expired', handleAuthExpired);
  }, []);

  const save = useCallback(async (resource, desired) => {
    setData((current) => ({ ...current, [resource]: desired }));
    try {
      const saved = await replaceResource(resource, desired);
      setData((current) => ({ ...current, [resource]: saved }));
      setError('');
      return saved;
    } catch (requestError) {
      const baseline = getResourceBaseline(resource);
      if (baseline !== undefined) setData((current) => ({ ...current, [resource]: baseline }));
      notify(requestError.message);
      throw requestError;
    }
  }, [notify]);

  const createMember = useCallback(async (newMember) => {
    try {
      const member = await createDashboardUser(newMember);
      setData((current) => ({ ...current, team: [...current.team, member] }));
      setError('');
      return member;
    } catch (requestError) {
      notify(requestError.message);
      throw requestError;
    }
  }, [notify]);

  const updateMember = useCallback(async (userId, updates) => {
    try {
      const member = await updateDashboardUser(userId, updates);
      setData((current) => ({
        ...current,
        team: current.team.map((item) => item.id === member.id ? member : item)
      }));
      setError('');
      return member;
    } catch (requestError) {
      notify(requestError.message);
      throw requestError;
    }
  }, [notify]);

  const deleteMember = useCallback(async (userId) => {
    try {
      await deleteDashboardUser(userId);
      setData((current) => ({
        ...current,
        team: current.team.filter((item) => item.id !== userId)
      }));
      setError('');
    } catch (requestError) {
      notify(requestError.message);
      throw requestError;
    }
  }, [notify]);

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
    setData(emptyData);
    setError('');
  }, []);

  return {
    user,
    data,
    loading,
    error,
    setError,
    save,
    createMember,
    updateMember,
    deleteMember,
    signOut
  };
}
