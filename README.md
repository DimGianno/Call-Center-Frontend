# Call Center Dashboard

A teaching-friendly React frontend for managing call-center records.

The app supports signup, login, email verification, backend-owned HttpOnly cookie sessions, server
session refresh, active and archived call feeds, call details, notes, archive/unarchive/delete
actions, seeded sample data, reset sample data, search, filtering, pagination, light/dark themes,
confirmation dialogs, toast feedback, same-account realtime call sync, and a guided tutorial for new
users.

This README is intentionally detailed. It is meant to help someone open the project, understand the
moving pieces, and trace how a user action travels through routes, hooks, API modules, utilities,
and UI components.

## Project Documentation

- [Project updates](PROJECT_UPDATES.md)
- [Project roadmap](PROJECT_ROADMAP.md)

---

## Table Of Contents

- [Tech Stack](#tech-stack)
- [Project Setup](#project-setup)
- [Deployment Domains And Env](#deployment-domains-and-env)
- [Scripts](#scripts)
- [Current Feature Set](#current-feature-set)
- [How The App Starts](#how-the-app-starts)
- [Route And Session Flow](#route-and-session-flow)
- [API Layer](#api-layer)
- [Call Data Flow](#call-data-flow)
- [Tutorial Flow](#tutorial-flow)
- [Project Structure](#project-structure)
- [File Responsibilities](#file-responsibilities)
- [State Ownership](#state-ownership)
- [Utilities](#utilities)
- [Styling System](#styling-system)
- [Testing And Quality](#testing-and-quality)
- [Error Handling](#error-handling)
- [Future Improvements](#future-improvements)

---

## Tech Stack

| Tool                  | Current role                                                               |
| --------------------- | -------------------------------------------------------------------------- |
| React 19              | Component rendering and stateful UI.                                       |
| React DOM 19          | Mounts the React app into `index.html`.                                    |
| React Router 7        | Browser routing, protected routes, and public-only routes.                 |
| TypeScript 6          | Static typing for components, hooks, API responses, and utility contracts. |
| Vite 8                | Development server, asset pipeline, and production build.                  |
| Vitest 4              | Unit and integration test runner.                                          |
| React Testing Library | Tests user-visible behavior instead of implementation details.             |
| jest-dom              | Adds DOM-specific matchers for tests.                                      |
| jsdom                 | Provides a browser-like test environment.                                  |
| ESLint 10             | Static linting.                                                            |
| Prettier 3            | Formatting.                                                                |
| react-datepicker 9    | Inline date-range calendar in the filter modal.                            |

There are no global state libraries, CSS frameworks, or icon packages. State is kept local with
React hooks, shared behavior is extracted into custom hooks, and all styling is plain CSS split by
purpose under `src/styles/`.

---

## Project Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000
```

During local development, `VITE_API_URL` can point directly at the backend, for example
`http://localhost:3000`.

In production builds the app calls `/api/*` on the current Vercel origin. `vercel.json` rewrites
those requests to the backend through `BACKEND_PROXY_URL`, which keeps browser requests
same-origin and lets mobile browsers keep sending the HttpOnly session cookie reliably.

Start the development server:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Preview the production bundle locally:

```bash
npm run preview
```

Run the full quality gate:

```bash
npm run check
```

The app expects the backend API to support cookie-based auth and the call/tutorial endpoints listed
below. Frontend requests that depend on authentication send cookies with `credentials: "include"`.

---

## Deployment Domains And Env

Live deployments use these custom domains:

| Environment | Frontend                                  | Backend                                       |
| ----------- | ----------------------------------------- | --------------------------------------------- |
| Production  | https://call-center.dimgianno.com         | https://api.call-center.dimgianno.com         |
| Staging     | https://call-center-staging.dimgianno.com | https://api-staging.call-center.dimgianno.com |

Vercel should proxy frontend `/api/*` requests to the matching backend with
`BACKEND_PROXY_URL`.

Production Vercel environment:

```env
BACKEND_PROXY_URL=https://api.call-center.dimgianno.com
```

Staging or preview Vercel environment:

```env
BACKEND_PROXY_URL=https://api-staging.call-center.dimgianno.com
```

Do not include `/api` or a trailing slash in `BACKEND_PROXY_URL`. The Vercel rewrite removes the
frontend-facing `/api` prefix before forwarding the request. After changing Vercel environment
variables, redeploy the affected environment so `vercel.json` uses the new value.

Deployed production builds always call `/api/*` on the current frontend origin. `VITE_API_URL` is
only needed for local development, and `VITE_API_BASE_URL` is not used by this app.

---

## Scripts

| Script                 | What it does                                                     |
| ---------------------- | ---------------------------------------------------------------- |
| `npm run dev`          | Starts the Vite dev server.                                      |
| `npm run build`        | Runs a production build into `dist/`.                            |
| `npm run preview`      | Serves the production build locally.                             |
| `npm test`             | Runs the Vitest suite once.                                      |
| `npm run test:watch`   | Runs Vitest in watch mode.                                       |
| `npm run typecheck`    | Runs `tsc --noEmit`.                                             |
| `npm run lint`         | Runs ESLint.                                                     |
| `npm run format`       | Formats project files with Prettier.                             |
| `npm run format:check` | Checks formatting without rewriting files.                       |
| `npm run check`        | Runs format check, typecheck, lint, tests, and production build. |

`npm run check` is the main "is this safe to ship?" command.

---

## Current Feature Set

### Authentication And Sessions

- Users can sign up and log in from the auth screens.
- Login and signup submit to the backend, which sets an HttpOnly `session` cookie.
- Signup sends an email verification link, while allowing a 7-day grace period.
- Unverified dashboard sessions show a verification banner with a resend action.
- `/verify-email?token=...` verifies email tokens and shows success or expired-link states.
- The frontend does not store or depend on an access token in `localStorage`.
- Auth responses still include `accessToken` for temporary backend compatibility, but frontend state
  is built from `user` and `sessionExpiresAt`.
- The session timer is display-only. It counts down from the backend-provided `sessionExpiresAt`.
- Refreshing the timer calls `POST /auth/refresh`, which asks the backend to extend a valid session.
- Logging out calls `POST /auth/logout`, then clears frontend session state.
- If a protected API request returns `401`, the frontend clears auth state and treats the session as
  expired.
- Email and password fields validate inline while the user types.
- Auth buttons show rotating loading copy for slow wakeups, such as a sleeping backend.

### Dashboard

- The fixed header shows the dashboard title, session timer, and account button.
- Stats cards summarize active calls, inbound calls, outbound calls, answered calls, missed calls,
  and voicemail calls for the current loaded data set.
- The account drawer shows the signed-in user, theme toggle, tutorials, and logout.
- The dashboard supports dark and light themes through CSS variables.

### Calls

- Calls are fetched from the backend after the user reaches the dashboard.
- The app loads active and archived calls so the UI can switch views without losing local context.
- Other open tabs and devices for the same account refresh automatically when calls change.
- Active and archived views share the same feed controls.
- A call can be opened to show details.
- Notes can be added from the call details modal.
- Active calls can be archived.
- Archived calls can be unarchived.
- Calls can be deleted after confirmation.
- Active calls can be archived in bulk.
- Archived calls can be unarchived in bulk.
- Empty accounts show a seeded empty state with a `Seed sample calls` action.
- Existing call data can be restored to the sample set with `Reset Data`.

### Search, Filters, Sorting, And Pagination

- Search matches phone numbers by normalizing away non-digits.
- Calls can be filtered by call type, direction, date range, and duration.
- Filter sections fold and unfold to keep the modal compact.
- Date range filtering uses `react-datepicker` as an inline calendar.
- Calendar dates without calls are disabled.
- Date comparisons use `YYYY-MM-DD` strings, which keeps the filter compatible with the backend data
  shape and avoids unnecessary date libraries.
- Calls are sorted newest-first.
- Calls are grouped by date headings.
- Page size can be changed between `5`, `10`, `25`, and `50`.
- Pagination appears above and below the call list.

### Guided Tutorial

- First-time users see a welcome dialog after reaching the authenticated dashboard.
- Tutorial state is stored by the backend per user.
- The account drawer exposes a foldable Tutorials section.
- Tutorial categories are:
  - Full tutorial
  - Seeding calls
  - UI
  - Call feed
  - Call item
- Tutorial rows show whether a category is new, completed, or not started.
- The Tutorials header can show a green completed badge or blue new badge.
- The tutorial highlights real dashboard elements with a direct breathing highlight.
- Safe steps can require real clicks, such as opening filters or account settings.
- Data-changing actions are described but not forced, such as reset, archive, delete, and note
  changes.
- The seed slide is skipped when the user already has calls.

---

## How The App Starts

The boot path is:

```text
index.html
  -> src/main.tsx
    -> src/App.tsx
      -> AppRoutes
        -> route guard
          -> page
            -> hooks
              -> API modules
                -> backend
```

### `index.html`

`index.html` provides the root DOM element:

```html
<div id="root"></div>
```

It also loads the app entry:

```html
<script type="module" src="/src/main.tsx"></script>
```

Vite transforms this module during development and bundles it during production builds.

### `src/main.tsx`

`main.tsx` creates the React root and renders the app:

```tsx
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

The important parts are:

- `document.getElementById("root")` finds the DOM node from `index.html`.
- `createRoot(...)` tells React where to mount.
- `<StrictMode>` enables extra development checks.
- `<App />` is the top-level app component.

### `src/App.tsx`

`App.tsx` sets up browser routing, theme state, auth session state, and route protection.

The route tree is:

| Path            | Route behavior                                                          |
| --------------- | ----------------------------------------------------------------------- |
| `/`             | Home page.                                                              |
| `/login`        | Public-only login page. Redirects authenticated users to `/dashboard`.  |
| `/signup`       | Public-only signup page. Redirects authenticated users to `/dashboard`. |
| `/verify-email` | Public email verification result page.                                  |
| `/dashboard`    | Protected dashboard. Redirects unauthenticated users to `/login`.       |
| `*`             | Redirects unknown routes to `/`.                                        |

`AppRoutes` owns the current theme and uses `useAuthSession()` to get the current auth state and auth
handlers. It passes the minimum required props down into pages.

---

## Route And Session Flow

### Route Guards

`ProtectedRoute.tsx` prevents unauthenticated access to the dashboard.

It needs two pieces of information:

- `isAuthReady`: whether the startup session check has finished.
- `session`: whether the frontend currently has a valid session state.

While auth is still being checked, protected content should not make a premature decision. After the
check finishes, no session means redirect to `/login`.

`PublicOnlyRoute.tsx` does the opposite. It keeps logged-in users away from login and signup screens
by redirecting them to `/dashboard`.

### Session Source Of Truth

The real source of truth is the backend session cookie. The cookie is HttpOnly, which means the
frontend cannot read it with JavaScript. That is good: it reduces the damage from malicious
JavaScript because the session secret is not available through `localStorage` or regular script
access.

The frontend keeps only display state:

```ts
interface AuthSession {
  user: AuthUser;
  name: string;
  email: string;
  emailVerification: EmailVerificationStatus;
  sessionExpiresAt: string;
}
```

`sessionExpiresAt` drives the visible countdown, but the backend enforces whether a session is
actually valid.

### Startup Refresh

When the app loads, `useAuthSession()` calls `getCurrentSession()`, which calls
`POST /auth/refresh`.

That request has two jobs:

1. Ask the backend whether the cookie session is still valid.
2. Receive the current user and a fresh `sessionExpiresAt` if it is valid.

If refresh returns `401`, the frontend clears local auth state and behaves as logged out.

### Timer Behavior

The session timer is calculated from:

```text
sessionExpiresAt - Date.now()
```

That means the timer can recover when a tab sleeps, the browser throttles intervals, or the window is
minimized. The UI recalculates against an absolute expiry timestamp instead of trusting that an
interval fired every second.

Refreshing the timer calls the backend. The frontend does not extend the session by itself.

---

## API Layer

API modules use the shared base URL from `src/api/apiBaseUrl.ts`:

```ts
export const API_BASE_URL = import.meta.env.PROD ? "/api" : import.meta.env.VITE_API_URL || "/api";
```

This means:

- local development can call a direct backend URL from `VITE_API_URL`
- production calls `/api/*` on the Vercel frontend origin
- Vercel rewrites `/api/*` to the backend through `BACKEND_PROXY_URL`

Authenticated requests include:

```ts
credentials: "include";
```

That option tells `fetch` to send cookies to the backend and accept cookie updates from auth
responses, assuming the backend CORS policy allows the current origin.

The same-origin Vercel proxy is important for mobile and tablet browsers. It avoids a cross-origin
cookie flow while still keeping the backend address configurable per Vercel environment.

### Auth Endpoints

Implemented in `src/api/authApi.ts`.

| Frontend function           | HTTP request                     | Purpose                                           |
| --------------------------- | -------------------------------- | ------------------------------------------------- |
| `loginUser(credentials)`    | `POST /auth/login`               | Logs in and receives user/session expiry.         |
| `signupUser(credentials)`   | `POST /auth/signup`              | Creates account and receives user/session expiry. |
| `refreshSession()`          | `POST /auth/refresh`             | Refreshes a valid cookie session.                 |
| `getCurrentSession()`       | `POST /auth/refresh`             | Startup helper that returns `null` on `401`.      |
| `resendVerificationEmail()` | `POST /auth/resend-verification` | Requests another verification email.              |
| `verifyEmailToken(token)`   | `POST /auth/verify-email`        | Verifies a link token from `/verify-email`.       |
| `logoutUser()`              | `POST /auth/logout`              | Clears the backend session and frontend state.    |

Auth responses are parsed and validated before they become frontend session state.

### Calls Endpoints

Implemented in `src/api/callsApi.ts`.

| Frontend function                             | HTTP request                           | Purpose                                    |
| --------------------------------------------- | -------------------------------------- | ------------------------------------------ |
| `fetchCallsPage({ isArchived, page, limit })` | `GET /calls?is_archived=&page=&limit=` | Fetches one page of calls.                 |
| `fetchCallsByArchiveStatus(isArchived)`       | repeated `GET /calls`                  | Fetches every page for one archive status. |
| `fetchAllCalls()`                             | active + archived fetches in parallel  | Gives the dashboard both views.            |
| `fetchCall(callId)`                           | `GET /calls/:callId`                   | Loads a single call's freshest details.    |
| `addCallNote(callId, content)`                | `POST /calls/:callId/notes`            | Adds a note and returns the updated call.  |
| `archiveCall(callId)`                         | `PATCH /calls/:callId/archive`         | Archives one call.                         |
| `unarchiveCall(callId)`                       | `PATCH /calls/:callId/unarchive`       | Restores one call to active.               |
| `deleteCall(callId)`                          | `DELETE /calls/:callId`                | Deletes one call.                          |
| `archiveAllCalls()`                           | `PATCH /calls/archive-all`             | Archives all active calls.                 |
| `unarchiveAllCalls()`                         | `PATCH /calls/unarchive-all`           | Unarchives all archived calls.             |
| `resetCalls()`                                | `POST /calls/reset`                    | Seeds or restores sample calls.            |

`apiRequest()` is the shared calls request helper. It adds JSON headers, includes cookies, retries
server errors a limited number of times, parses JSON responses, and announces session expiry on
`401`.

### Realtime Call Events

Implemented in `src/api/callEventsApi.ts`.

`subscribeToCallChanges(onChange)` opens:

```ts
new EventSource(`${API_BASE_URL}/events/calls`, { withCredentials: true });
```

The backend emits `calls:changed` events after successful call mutations. The frontend treats those
events as invalidation signals and calls `fetchAllCalls()` again instead of trying to patch local
state from the event payload.

The event payload is:

```ts
{
  version: 1;
  action: "archive" | "unarchive" | "delete" | "add_note" | "archive_all" | "unarchive_all" | "reset";
  callId?: string;
}
```

### Tutorial Endpoints

Implemented in `src/api/tutorialApi.ts`.

| Frontend function             | HTTP request               | Purpose                                            |
| ----------------------------- | -------------------------- | -------------------------------------------------- |
| `fetchTutorialState()`        | `GET /users/me/tutorial`   | Loads tutorial progress for the current user.      |
| `updateTutorialState(update)` | `PATCH /users/me/tutorial` | Saves skip, completion, and completed topic state. |

The expected tutorial state shape is:

```ts
interface TutorialState {
  version: number;
  hasSeenWelcome: boolean;
  completedAt: string | null;
  skippedAt: string | null;
  completedTopics: string[];
}
```

Tutorial API failures should not block the dashboard. A failed save shows a toast only when the user
explicitly tries to save tutorial progress.

---

## Call Data Flow

The dashboard call path is:

```text
DashboardPage
  -> useCalls
    -> callsApi
    -> callEventsApi
      -> backend
    -> local calls state
  -> StatsCards
  -> CallFeed
    -> callUtils
    -> FilterModal
    -> CallItem
  -> CallDetails
```

### Loading Calls

`useCalls()` calls `fetchAllCalls()` on mount. `fetchAllCalls()` loads active and archived calls so
the dashboard can switch views using local state.

`useCalls()` also subscribes to `calls:changed` events while the dashboard is mounted. When another
tab or device changes calls for the same account, the hook silently refetches all calls without
showing the main loading state.

The hook stores:

- `calls`: all loaded calls.
- `callView`: active or archived view.
- `selectedCall`: the call currently open in the details modal.
- `isLoading`: whether calls are being fetched.
- `errorMessage`: the latest call-related error message.

### Visible Calls

`useCalls()` derives `visibleCalls` from `calls` and `callView`.

If `callView` is `active`, only non-archived calls are passed to `CallFeed`.

If `callView` is `archived`, only archived calls are passed to `CallFeed`.

### Feed Transformations

Inside `CallFeed.tsx`, the visible list goes through this pipeline:

```text
visible calls
  -> searchCallsByPhoneNumber
  -> filterCalls
  -> sortCallsNewestFirst
  -> paginateCalls
  -> groupCallsByDate
  -> render date groups and call cards
```

`useMemo()` is used for searched calls and available calendar dates so large lists avoid unnecessary
recalculation when unrelated state changes.

### Optimistic Updates

Some actions update the UI before the backend confirms:

- Archive one call.
- Unarchive one call.
- Add a note.
- Delete one call.

The hook saves the previous state first. If the backend fails, it rolls back to the previous state
and shows the error.

Bulk actions and reset reload from the backend after the action finishes because they affect many
records.

### Realtime Refresh Behavior

Realtime refreshes preserve dashboard context. The active/archived view, search text, filters, page
size, and current page live outside the refreshed call array, so they remain in place while fresh
call data arrives.

The selected call details modal stays open when the selected call still exists after a refresh. If
another tab or device deletes the selected call, or reset removes it, the modal closes and the app
shows a subtle toast: `Selected call was removed in another tab.`

Note drafts are owned by the call details form, so a realtime refresh does not clear typed note
text. The draft is cleared only when the user's own note submit succeeds.

### Empty States

The call feed distinguishes three cases:

| Situation                             | Message or action                                  |
| ------------------------------------- | -------------------------------------------------- |
| Account has no calls                  | Shows seeded empty state with `Seed sample calls`. |
| Active view has no active calls       | `No active calls available.`                       |
| Archived view has no archived calls   | `No archived calls available.`                     |
| Search/filter hides all current calls | `No calls match the current search or filters.`    |

---

## Tutorial Flow

The tutorial path is:

```text
DashboardPage
  -> useTutorial
    -> tutorialApi
      -> backend tutorial state
  -> TutorialWelcomeDialog
  -> TutorialOverlay
  -> active tutorial target props
  -> highlighted dashboard elements
```

### First Visit

`useTutorial()` fetches tutorial state from the backend after the dashboard is ready.

The welcome dialog appears only when the backend state says the user has not seen, skipped, or
completed the current tutorial version.

The current tutorial version is:

```ts
export const TUTORIAL_VERSION = 1;
```

Changing this number in the future can make the tutorial feel new again for users who completed an
older version.

### Tutorial Categories

The account drawer tutorial section exposes five launch buttons:

| Topic         | What it covers                                                              |
| ------------- | --------------------------------------------------------------------------- |
| Full tutorial | Every tutorial category.                                                    |
| Seeding calls | How new accounts get sample data.                                           |
| UI            | Timer, account drawer, stats, controls, filters, pagination, and reset.     |
| Call feed     | Date groups, routes, types, durations, and list layout.                     |
| Call item     | Opening details, reading call fields, notes, archive/unarchive, and delete. |

The section folds under the Tutorials header. Each row has a status badge.

### Click-Along Steps

Some steps wait for real user events:

- Opening account settings.
- Closing account settings.
- Opening filters.
- Closing filters.
- Opening call details.

The dashboard reports those actions through tutorial event callbacks. When the required event is
recorded, the tutorial auto-advances.

Steps that would change data are presented but not required. That keeps the tutorial educational
without forcing destructive or noisy actions.

### Highlighting

The tutorial passes an `activeTutorialTarget` down into dashboard components. Components place
`data-tutorial-active="true"` on the active target. `src/styles/tutorial.css` turns that marker into
the blue breathing highlight.

This keeps the tutorial package-free and avoids a third-party walkthrough dependency.

---

## Project Structure

```text
.
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── vercel.json
├── src
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types.ts
│   ├── api
│   │   ├── apiBaseUrl.ts
│   │   ├── authApi.ts
│   │   ├── callEventsApi.ts
│   │   ├── callsApi.ts
│   │   └── tutorialApi.ts
│   ├── components
│   │   ├── AccountDrawer.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── CallDetails.tsx
│   │   ├── CallFeed.tsx
│   │   ├── CallItem.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── FilterModal.tsx
│   │   ├── PaginationControls.tsx
│   │   ├── StatsCards.tsx
│   │   ├── Toast.tsx
│   │   └── TutorialOverlay.tsx
│   ├── hooks
│   │   ├── useAuthSession.ts
│   │   ├── useCalls.ts
│   │   ├── useConfirmDialog.ts
│   │   ├── useToast.ts
│   │   └── useTutorial.ts
│   ├── pages
│   │   ├── AuthPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── HomePage.tsx
│   │   └── VerifyEmailPage.tsx
│   ├── routes
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicOnlyRoute.tsx
│   ├── styles
│   │   ├── account-drawer.css
│   │   ├── app-shell.css
│   │   ├── auth.css
│   │   ├── base.css
│   │   ├── calls.css
│   │   ├── dashboard.css
│   │   ├── feedback.css
│   │   ├── feed.css
│   │   ├── home.css
│   │   ├── modals.css
│   │   ├── responsive.css
│   │   ├── tokens.css
│   │   └── tutorial.css
│   ├── test
│   │   ├── App.integration.test.tsx
│   │   ├── authApi.test.ts
│   │   ├── authStorage.test.ts
│   │   ├── callsApi.test.ts
│   │   ├── callUtils.test.ts
│   │   ├── components.snapshot.test.tsx
│   │   ├── setup.ts
│   │   ├── tutorialApi.test.ts
│   │   └── __snapshots__
│   └── utils
│       ├── authStorage.ts
│       ├── callUtils.ts
│       └── formatters.ts
```

---

## File Responsibilities

### Entry Files

| File            | Responsibility                                                                          |
| --------------- | --------------------------------------------------------------------------------------- |
| `index.html`    | HTML shell and React mount point.                                                       |
| `src/main.tsx`  | Creates the React root and renders `<App />`.                                           |
| `src/App.tsx`   | Routes, top-level theme state, session hook, route guards, and session time formatting. |
| `src/index.css` | Central stylesheet entry that imports `react-datepicker` CSS and local style modules.   |
| `src/types.ts`  | Shared TypeScript types for auth, calls, filters, tutorial state, toasts, and dialogs.  |

### Pages

| File                  | Responsibility                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `HomePage.tsx`        | Public landing/home screen with navigation to auth or dashboard depending on session state.                 |
| `AuthPage.tsx`        | Chooses login or signup mode and renders `AuthScreen`.                                                      |
| `DashboardPage.tsx`   | Composes dashboard hooks and UI: stats, feed, details, account drawer, tutorial, toasts, and confirmations. |
| `VerifyEmailPage.tsx` | Verifies email tokens from links and shows success or invalid/expired states.                               |

### Routes

| File                  | Responsibility                                                              |
| --------------------- | --------------------------------------------------------------------------- |
| `ProtectedRoute.tsx`  | Waits for auth readiness, then allows dashboard access only with a session. |
| `PublicOnlyRoute.tsx` | Keeps authenticated users out of login/signup routes.                       |

### API Modules

| File               | Responsibility                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| `apiBaseUrl.ts`    | Chooses direct local API URL or production same-origin `/api` proxy base.                               |
| `authApi.ts`       | Login, signup, refresh, logout, auth response parsing, and frontend session creation.                   |
| `callEventsApi.ts` | Authenticated EventSource subscription for same-account realtime call refreshes.                        |
| `callsApi.ts`      | All call-related backend requests, retry handling, JSON parsing, and `401` session expiry notification. |
| `tutorialApi.ts`   | Fetches and updates backend-backed tutorial progress.                                                   |

### Hooks

| File                  | Responsibility                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `useAuthSession.ts`   | Owns auth session state, startup refresh, login, signup, logout, timer refresh, and expiry behavior.                    |
| `useCalls.ts`         | Owns loaded calls, selected call, active/archived view, realtime refreshes, optimistic call actions, reset, and errors. |
| `useTutorial.ts`      | Owns tutorial state, welcome dialog visibility, active flow, completed click events, skip, and completion saves.        |
| `useConfirmDialog.ts` | Stores the active confirmation dialog config.                                                                           |
| `useToast.ts`         | Stores transient success/error toast messages and removes them after a delay.                                           |

### Components

| File                          | Responsibility                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `AuthScreen.tsx`              | Login/signup form, inline email/password validation, loading messages, and submit handling.                        |
| `EmailVerificationBanner.tsx` | Dashboard notice for unverified users with verification deadline and resend action.                                |
| `AccountDrawer.tsx`           | User drawer, theme toggle, foldable tutorial section, tutorial status badges, and logout.                          |
| `StatsCards.tsx`              | Summary cards derived from the current call data.                                                                  |
| `CallFeed.tsx`                | Search, filters, view toggle, bulk actions, pagination, empty states, seed/reset actions, and call list rendering. |
| `CallItem.tsx`                | One call row/card with route, type, time, duration, and archive/unarchive action.                                  |
| `CallDetails.tsx`             | Details modal, notes list, note form, archive/unarchive, and delete.                                               |
| `FilterModal.tsx`             | Foldable filter groups, date-range calendar, duration sliders, reset/cancel/confirm buttons.                       |
| `PaginationControls.tsx`      | Previous/next controls and page count text.                                                                        |
| `ConfirmDialog.tsx`           | Reusable confirmation modal for data-changing actions.                                                             |
| `Toast.tsx`                   | Toast message presentation.                                                                                        |
| `TutorialOverlay.tsx`         | Welcome dialog, tutorial step panel, click requirements, progress dots, and active target selection.               |

---

## State Ownership

| State                      | Owner                        | Why it lives there                                        |
| -------------------------- | ---------------------------- | --------------------------------------------------------- |
| Theme                      | `AppRoutes`                  | Needed across home, auth, and dashboard pages.            |
| Auth session               | `useAuthSession`             | Shared by route guards and pages.                         |
| Remaining session seconds  | `useAuthSession`             | Derived from backend `sessionExpiresAt`.                  |
| Calls                      | `useCalls`                   | Shared by stats, feed, details, and actions.              |
| Selected call              | `useCalls`                   | Details modal depends on it, and actions can clear it.    |
| Active/archived view       | `useCalls`                   | Determines which calls the feed receives.                 |
| Search term                | `CallFeed`                   | Only affects feed display.                                |
| Applied filters            | `CallFeed`                   | Only affects feed display after confirmation.             |
| Draft filters              | `CallFeed` and `FilterModal` | Lets users edit filters before confirming.                |
| Current page and page size | `CallFeed`                   | Only affects feed pagination.                             |
| Confirmation dialog        | `useConfirmDialog`           | Shared by reset, delete, archive all, and unarchive all.  |
| Toasts                     | `useToast`                   | Shared success/error feedback.                            |
| Tutorial progress          | Backend and `useTutorial`    | Persisted per user, displayed and updated in dashboard.   |
| Active tutorial target     | `DashboardPage`              | Passed down to whichever component may need highlighting. |

This layout keeps state close to where it is used. App-wide state is high in the tree; feed-only
state stays inside the feed.

---

## Utilities

### `src/utils/authStorage.ts`

Despite its historical name, this file no longer stores the active auth session in `localStorage`.
It now provides auth-related helpers:

- `clearActiveSession()` removes the legacy localStorage key for cleanup.
- `buildSession(authResponse)` validates backend auth response data and returns `AuthSession`.
- `getEmailValidationMessage(value)` returns the first inline email validation guide.
- `isValidEmail(value)` delegates to the shared validation message helper.
- `getPasswordValidationMessage(value)` enforces the password length guide.
- `AUTH_SESSION_EXPIRED_EVENT` and `notifyAuthSessionExpired()` provide a browser event used when
  protected API calls receive `401`.

Email validation is practical public-internet validation. It supports common ASCII addresses,
including dots, underscores, apostrophes, plus tags, and multi-label domains. It deliberately avoids
quoted local parts, IP-literal domains, and SMTPUTF8 addresses.

### `src/utils/callUtils.ts`

This file contains the pure call-list transformations:

- `defaultFilters`
- `getActiveFilterCount(filters)`
- `filterCalls(calls, filters)`
- `sortCallsNewestFirst(calls)`
- `paginateCalls(calls, currentPage, pageSize)`
- `groupCallsByDate(calls)`
- `getAvailableCallDates(calls)`
- `dateKeyToLocalDate(dateKey)`
- `localDateToDateKey(date)`
- `searchCallsByPhoneNumber(calls, searchTerm)`

These functions are easy to test because they do not touch React state or the DOM.

### `src/utils/formatters.ts`

Formatting helpers keep UI copy consistent. For example, call date group headings are formatted in
one place instead of each component inventing its own date display.

---

## Styling System

`src/index.css` is now an import hub rather than a single huge stylesheet.

It imports third-party datepicker styles first, then local files:

```css
@import "react-datepicker/dist/react-datepicker.css";
@import "./styles/tokens.css";
@import "./styles/base.css";
@import "./styles/app-shell.css";
@import "./styles/account-drawer.css";
@import "./styles/auth.css";
@import "./styles/home.css";
@import "./styles/dashboard.css";
@import "./styles/calls.css";
@import "./styles/feedback.css";
@import "./styles/feed.css";
@import "./styles/modals.css";
@import "./styles/tutorial.css";
@import "./styles/responsive.css";
```

### CSS Modules By Purpose

| File                 | Purpose                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| `tokens.css`         | Theme variables, colors, shadows, and shared design tokens.               |
| `base.css`           | Global resets and base element styling.                                   |
| `app-shell.css`      | App wrapper, header, fixed layout, and session timer.                     |
| `home.css`           | Home page styles.                                                         |
| `auth.css`           | Login/signup layout, fields, validation messages, and loading states.     |
| `dashboard.css`      | Dashboard layout and stats area.                                          |
| `feed.css`           | Feed header controls, search, page size, empty states, and reset area.    |
| `calls.css`          | Call cards, date groups, call details, and call-related presentation.     |
| `modals.css`         | Filter modal, datepicker overrides, confirmation modal, and modal layers. |
| `account-drawer.css` | Account drawer, theme control, tutorial section, and badges.              |
| `feedback.css`       | Toast and alert feedback styles.                                          |
| `tutorial.css`       | Tutorial welcome dialog, tutorial panel, and element highlighting.        |
| `responsive.css`     | Mobile and narrow viewport adjustments.                                   |

### Theme Switching

The top-level app wrapper receives:

```tsx
<div className="app" data-theme={theme}>
```

CSS variables change based on `[data-theme="dark"]` or `[data-theme="light"]`. Components use those
variables instead of hard-coded theme-specific colors.

### Datepicker Styling

`react-datepicker` ships with default CSS. The app imports that CSS first, then overrides classes in
`modals.css` so the calendar matches the dashboard theme and keeps selected start/end dates visible
in both light and dark modes.

### Tutorial Highlighting

Tutorial-aware elements receive:

```tsx
data-tutorial-active={activeTutorialTarget === "some-target" ? "true" : undefined}
```

The CSS targets `[data-tutorial-active="true"]` to apply the highlight. This keeps tutorial styling
centralized and avoids special wrapper components around every UI element.

---

## Testing And Quality

The test suite covers API behavior, pure utilities, component snapshots, and integrated user flows.

| Test file                               | What it proves                                                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/test/authApi.test.ts`              | Auth requests include credentials, parse session data, handle logout, and clear state on expiry.               |
| `src/test/callsApi.test.ts`             | Call requests include credentials, build correct URLs, retry server errors, parse responses, and report `401`. |
| `src/test/tutorialApi.test.ts`          | Tutorial requests include credentials, validate state, update progress, and surface errors.                    |
| `src/test/authStorage.test.ts`          | Email validation, password validation, auth response validation, and legacy session cleanup helpers.           |
| `src/test/callUtils.test.ts`            | Filtering, sorting, pagination, grouping, available dates, and date conversion helpers.                        |
| `src/test/App.integration.test.tsx`     | User-facing flows across auth, dashboard, filters, calls, realtime refreshes, tutorial, and routing.           |
| `src/test/components.snapshot.test.tsx` | Snapshot coverage for stable presentational output.                                                            |
| `src/test/setup.ts`                     | Shared Vitest and Testing Library setup.                                                                       |

### Full Check Pipeline

```bash
npm run check
```

Runs:

```text
prettier --check
tsc --noEmit
eslint
vitest run
vite build
```

That gives coverage for formatting, types, lint rules, behavior, and production build validity.

---

## Error Handling

### Auth Errors

Login and signup validation errors appear inline when they are about the email or password field.
Backend auth failures appear in the existing top-level auth alert.

If an auth request returns `401`, the app treats the user as logged out.

### Protected Request Expiry

Calls and tutorial APIs notify the app when they receive `401`. `useAuthSession()` listens for the
session-expired event and clears frontend auth state.

This keeps each API module simple while still giving the app one shared response to expired
sessions.

### Calls Errors

`useCalls()` stores call-related errors in `errorMessage`. Failed optimistic updates roll back to
the previous call state.

### Tutorial Errors

Fetching tutorial state should never block dashboard use. Failed tutorial saves show a toast only
when the user explicitly tries to skip or complete tutorial progress.

### Confirmation Dialogs

Dangerous or wide-impact actions ask for confirmation:

- Delete one call.
- Archive all active calls.
- Unarchive all archived calls.
- Reset or seed sample data.
