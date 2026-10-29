# AIESEC Azerbaijan Social Media Dashboard

## Frontend setup

This is a Vite + React frontend that preserves the original HTML dashboard
layout and connects it to the existing FastAPI service.

```sh
npm install
npm run dev
```

For local development, leave `VITE_API_BASE_URL` empty: Vite proxies `/api`
requests to `http://127.0.0.1:8000`, avoiding a local browser CORS requirement.
For a deployed frontend, set `VITE_API_BASE_URL` in its build environment to
the backend origin.

```env
VITE_API_BASE_URL=
```

Sign-in redirects to `/api/v2/dashboard/auth/google-login`, which uses the
dashboard-only Google allowlist and JWT. The backend OAuth callback redirects
to the frontend's `/auth/callback` path with the dashboard JWT in the query
string. The frontend loads the current dashboard user from
`GET /api/v2/dashboard/auth/me`.
The frontend stores that token, sends it as `Authorization: Bearer <JWT>` with
dashboard and Content Studio requests, and returns to sign-in after a 401.
For a deployed frontend, the backend must allow the frontend origin in its
CORS configuration; configure that in the backend deployment without changing
the backend API contract.

The original design reference remains in
[`aiesec-azerbaijan-dashboard.html`](./aiesec-azerbaijan-dashboard.html); the
live dashboard is implemented as React components styled with Tailwind CSS.

## Project structure

```text
src/
├── app/                 # App coordinator and dashboard page registry
├── components/
│   ├── forms/           # Reusable record forms
│   ├── shared/          # Dashboard-specific shared primitives
│   └── ui/              # Reusable UI controls and feedback
├── features/            # Dashboard pages grouped by product feature
├── hooks/               # Dashboard state and persistence lifecycle
├── layout/              # Authenticated app shell and navigation
├── pages/               # Sign-in page
├── services/            # FastAPI client, auth token, and persistence
├── main.jsx             # React entry point
└── styles.css           # Tailwind import and global styles
```

Each feature owns its page UI, while shared layout, controls, data loading, and
API access stay in their respective modules. Add new dashboard pages under
`src/features/` and register them in `src/app/dashboardPages.jsx`.

## Dashboard API

The dashboard API is mounted at `/api/v2/dashboard`. Any authenticated
platform user can read and update dashboard resources; replacing the `team`
resource requires an MC admin.

| Resource | Data |
| --- | --- |
| `posts` | Post drafts, publishing status, assignment, approval, and comments |
| `ideas` | Idea text and vote count |
| `events` | Single/range dates and promotion phases |
| `campaigns` | Dates, platforms, status, conditions, and goals |
| `tasks` | Assignment, due date, priority, and workflow status |
| `team` | Team member names, email addresses, and roles |
| `analytics` | Per-platform follower and engagement metrics |
| `analytics_extra` | Additional per-platform KPIs, groups, text, and tables |

The Content Studio's existing deterministic tools are also available as
authenticated endpoints: `POST /api/v2/dashboard/studio/hashtags` accepts
`{"text": "...", "platform": "instagram"}`, `POST
/api/v2/dashboard/studio/cta` accepts `{"goal": "apply"}`, and `POST
/api/v2/dashboard/studio/emojis` accepts `{"text": "..."}`. Each returns a
JSON array of suggestions.

`GET /api/v2/dashboard` returns all resources. `GET
/api/v2/dashboard/{resource}` reads one resource. `PUT
/api/v2/dashboard/{resource}` replaces that resource with a JSON array or
object; deleted client-side items should be omitted from the replacement.
Unknown resources and invalid data are rejected. Missing resources are
returned with empty defaults and are stored on their first successful update.
The frontend refetches the resource before a replacement and merges changes
against the latest server value to reduce accidental overwrites when multiple
people edit the dashboard.

The data is stored in the `dashboard_document` table. Apply the migration with
`alembic upgrade head` before using the endpoints. This backend does not import
data from the old Firebase project; the client or an import script must upload
existing records through the authenticated resource endpoints. The frontend
does not use Firebase Auth or Firestore.

The HTML's AI caption/rewrite/translation/tone actions are placeholders, while
its KPI Tracking and Branding sections are marked “Coming soon”; no backing
behavior or data shape currently exists for those sections.
