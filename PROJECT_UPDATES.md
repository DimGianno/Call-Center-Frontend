# Project Updates

## Latest Stable State

- **Last updated:** 2026-07-14
- **Current version:** Not versioned
- **Current status:** Active
- **Primary branch:** `main`
- **Production URL:** https://call-center.dimgianno.com
- **Staging URL:** https://call-center-staging.dimgianno.com

## Current Project Summary

Call Center Dashboard is a React and TypeScript frontend for authenticated users to review and manage call-center records from a responsive web interface. It combines cookie-based sessions, call search and filtering, optimistic mutations, realtime account-scoped refreshes, email verification, password recovery, and a guided onboarding flow. The application is tested with Vitest, React Testing Library, and Playwright, built with Vite, and deployed through Vercel with a same-origin backend proxy.

## Latest Updates

### 2026-07-13 — Password recovery and password-change flows

- **Type:** Feature
- **Status:** Completed
- **Summary:** Added forgot-password and reset-password pages plus an authenticated change-password dialog.
- **User impact:** Users can request a recovery link, set a new password, or change their password from the account drawer.
- **Technical impact:** Added public routes, authenticated API integration, form validation, success and error states, session cleanup after password changes, and unit and integration coverage.
- **Related area:** Authentication

### 2026-07-13 — Individual note deletion and tutorial v2

- **Type:** Feature
- **Status:** Completed
- **Summary:** Added individual note deletion and tutorial version 2 to `main`.
- **User impact:** Users can confirm and delete individual notes while keeping call details open, and returning users can receive updated tutorial content.
- **Technical impact:** Added note deletion API handling, optimistic state updates, failure recovery, realtime `delete_note` handling, tutorial versioning changes, responsive coverage, and integration tests.
- **Related area:** Frontend

### 2026-07-12 — Responsive modal architecture and browser coverage

- **Type:** Refactor
- **Status:** Completed
- **Summary:** Consolidated overlay behavior and improved modal, drawer, tutorial, datepicker, and mobile layouts.
- **User impact:** Dialogs and overlays behave more consistently across desktop, tablet, and mobile viewport sizes.
- **Technical impact:** Added a shared modal component, body-scroll locking, responsive style updates, Playwright browser tests, and CI execution for Chromium checks.
- **Related area:** Testing

### 2026-07-12 — Production routing and performance visibility

- **Type:** Infrastructure
- **Status:** Completed
- **Summary:** Standardized Vercel API proxy routing and added Vercel Speed Insights.
- **User impact:** Deployed clients use same-origin API requests for more reliable cookie sessions and provide production performance telemetry.
- **Technical impact:** Updated `vercel.json` environment-based rewrites, centralized deployment URL behavior, and integrated the Speed Insights component.
- **Related area:** Deployment

### 2026-07-08 — Email verification experience

- **Type:** Feature
- **Status:** Completed
- **Summary:** Added verification status handling, a dashboard reminder banner, resend support, and a public verification-result page.
- **User impact:** New users can verify their email from a link and receive clear success, expiry, and resend feedback.
- **Technical impact:** Extended authentication types and API calls, added route and session integration, and covered the flow with API and application tests.
- **Related area:** Authentication

### 2026-07-07 — Realtime call synchronization

- **Type:** Feature
- **Status:** Completed
- **Summary:** Added authenticated Server-Sent Events handling for same-account call changes.
- **User impact:** Calls refresh across open tabs or devices while preserving the selected feed, search, filters, and typed note drafts.
- **Technical impact:** Added a centralized EventSource client, event-driven call reloads, selected-call refresh behavior, session-expiry handling, and integration tests.
- **Related area:** Frontend

## Current Capabilities

- Present a public landing page and protected authenticated dashboard.
- Sign up, log in, refresh cookie sessions, and log out without storing active tokens in browser storage.
- Verify email addresses, resend verification messages, and display verification status.
- Request password recovery, reset a forgotten password, and change an authenticated password.
- Display active and archived call feeds with statistics and call details.
- Search phone numbers and filter calls by type, direction, date range, and duration.
- Sort, group, and paginate call records with configurable page sizes.
- Archive, unarchive, bulk-move, reset, seed, and delete calls.
- Add and delete individual notes on calls.
- Apply optimistic updates with rollback and toast feedback for failed call mutations.
- Refresh same-account call data through authenticated Server-Sent Events.
- Persist guided tutorial progress per user and highlight real interface controls.
- Support light and dark themes plus responsive dashboard and overlay layouts.
- Proxy deployed API requests through the current Vercel origin.
- Validate behavior with unit, integration, snapshot, responsive component, and Playwright browser tests.

## Portfolio Highlights

- React architecture built from focused components, API modules, utilities, and custom hooks without a global state library.
- Security-conscious browser authentication using backend-owned HttpOnly cookies and no active access token in `localStorage`.
- Optimistic call mutations and authenticated realtime synchronization that preserve user context and unsaved note drafts.
- Responsive, accessible modal and drawer patterns backed by component and Chromium viewport tests.
- Automated quality gate covering formatting, TypeScript, ESLint, Vitest, production builds, and Playwright.
- Vercel production and staging deployments using same-origin API proxying and Speed Insights telemetry.
