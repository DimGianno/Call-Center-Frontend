# Project Roadmap

## Current Status

- **Project maturity:** Production-ready
- **Actively developed:** Yes
- **Last reviewed:** 2026-07-22

## Known Limitations

### Forgot-password feedback reveals registered accounts

- **Area:** Security
- **Severity:** Medium
- **User impact:** Anyone can distinguish registered from unregistered email addresses through the recovery form.
- **Technical impact:** The frontend displays the backend's explicit `404` response for unknown accounts to provide actionable feedback.
- **Current workaround:** The backend avoids generating reset tokens or sending email for unknown accounts and applies a resend cooldown to known accounts.
- **Suggested resolution:** Reassess generic responses if account privacy becomes the priority, or add backend abuse controls such as route-sensitive rate limiting.
- **Status:** Known

### Large call histories are loaded into browser memory

- **Area:** Performance
- **Severity:** High
- **User impact:** Initial loading and feed interactions may become slower as an account's active and archived call history grows.
- **Technical impact:** The frontend fetches every backend page for both archive states, then performs search, filtering, sorting, grouping, and visible-page pagination in the browser.
- **Current workaround:** Backend requests are fetched in pages of 50 and independent pages are requested concurrently.
- **Suggested resolution:** Move supported search, filters, sorting, and pagination to backend queries and retain only the current result window in client state.
- **Status:** Known

### Existing notes cannot be edited

- **Area:** Frontend
- **Severity:** Medium
- **User impact:** Users can add and delete notes but cannot correct an existing note in place.
- **Technical impact:** The note integration supports creation and deletion but does not expose an update operation.
- **Current workaround:** Delete the incorrect note and add a corrected replacement.
- **Suggested resolution:** Add a validated note-editing flow once the backend exposes an ownership-protected update endpoint.
- **Status:** Known

### Tutorial and datepicker accessibility has not received a dedicated audit

- **Area:** Accessibility
- **Severity:** Medium
- **User impact:** Keyboard-only or assistive-technology users may encounter issues that are not covered by the existing interaction and responsive tests.
- **Technical impact:** Components use semantic controls and ARIA attributes, but the repository does not include a dedicated automated or documented manual accessibility audit.
- **Current workaround:** Existing keyboard behavior, ARIA labeling, component tests, and responsive browser tests cover common interactions.
- **Suggested resolution:** Add automated accessibility checks and a documented keyboard and screen-reader test matrix for tutorials, dialogs, drawers, filters, and the datepicker.
- **Status:** Known

### Tutorial version migrations are not documented

- **Area:** Documentation
- **Severity:** Low
- **User impact:** Returning users may receive unclear or inconsistent onboarding behavior when tutorial content changes between versions.
- **Technical impact:** Tutorial completion is tied to a version number, but the repository has no migration policy describing when to reset, preserve, or transform saved progress.
- **Current workaround:** Increment the tutorial version when updated content should be presented as new.
- **Suggested resolution:** Document version-change rules and add tests for returning users with older tutorial state.
- **Status:** Known

## Next Features

### Server-driven call search, filtering, and sorting

- **Priority:** High
- **Status:** Idea
- **Value:** Keeps the dashboard responsive and reduces data transfer for users with large call histories.
- **Scope:** Send search, filter, sort, page-size, and cursor inputs to the backend and render one result window at a time.
- **Dependencies:** Backend query support, stable pagination metadata, and agreed filter semantics
- **Complexity:** Large
- **Portfolio relevance:** Demonstrates scalable data fetching, URL/query-state design, caching decisions, and coordinated frontend-backend contracts.

### Edit individual notes

- **Priority:** High
- **Status:** Idea
- **Value:** Lets users correct call notes without deleting and recreating them.
- **Scope:** Add an edit action, modal or inline form, optimistic update and rollback behavior, realtime refresh handling, and automated coverage.
- **Dependencies:** A backend note-update endpoint and documented audit behavior
- **Complexity:** Medium
- **Portfolio relevance:** Extends the optimistic state model with precise embedded-record mutations and conflict-aware user feedback.

### Richer user profile settings

- **Priority:** Medium
- **Status:** Idea
- **Value:** Gives users a central place to manage account preferences beyond theme, tutorials, password changes, and logout.
- **Scope:** Add profile fields and settings supported by the backend, with validation, loading, success, and failure states.
- **Dependencies:** Backend profile APIs and a defined editable profile schema
- **Complexity:** Medium
- **Portfolio relevance:** Demonstrates form architecture, authenticated data mutations, validation, and settings-oriented user experience design.

## Technical Improvements

### Replace full-history loading with server-driven queries

- **Priority:** High
- **Reason:** `fetchAllCalls()` loads every page for active and archived records before the feed performs client-side transformations.
- **Expected outcome:** Faster initial rendering, lower memory use, and predictable request sizes for large accounts.
- **Affected area:** `src/api/callsApi.ts`, `src/hooks/useCalls.ts`, `src/components/CallFeed.tsx`, call utilities, API tests, and integration tests
- **Status:** Idea

### Add automated accessibility checks

- **Priority:** High
- **Reason:** The project has accessible markup and interaction tests but no dedicated accessibility audit in its quality gate.
- **Expected outcome:** Repeatable detection of common accessibility regressions across core pages and complex overlays.
- **Affected area:** Authentication pages, dashboard, tutorial, modal, drawer, filter, datepicker, Playwright tests, and CI
- **Status:** Idea

### Expand browser tests beyond responsive overlays

- **Priority:** Medium
- **Reason:** Current Playwright coverage focuses on responsive behavior while most end-to-end user flows are exercised in jsdom integration tests.
- **Expected outcome:** Browser-level confidence for authentication routing, call mutations, realtime refreshes, and tutorial interactions.
- **Affected area:** `e2e/`, API mocks, Playwright configuration, and CI
- **Status:** Idea

### Define a tutorial migration policy

- **Priority:** Low
- **Reason:** Tutorial progress is versioned, but the expected behavior for older saved versions is not documented.
- **Expected outcome:** Predictable onboarding behavior and regression coverage whenever tutorial content changes.
- **Affected area:** `src/hooks/useTutorial.ts`, tutorial API contracts, README documentation, and tutorial tests
- **Status:** Idea

## Suggested Next Milestones

1. **Scalable call-feed queries**
   - Goal: Keep dashboard loading and interactions predictable for large call histories.
   - Included work: Server-driven search, filters, sorting, and cursor pagination; query-state handling; loading and empty states; and automated tests.
   - Completion criteria: The frontend requests only the visible result window, preserves feed controls across refreshes, and passes the full quality gate.

2. **Complete note and account settings workflows**
   - Goal: Let users edit notes and manage richer account preferences safely.
   - Included work: Note editing, optimistic rollback, realtime handling, supported profile settings, validation, and integration tests.
   - Completion criteria: Users can add, edit, or delete notes and update supported profile fields with clear success and failure feedback.

3. **Accessibility and browser regression coverage**
   - Goal: Verify core workflows across keyboard, assistive-technology, responsive, and real-browser scenarios.
   - Included work: Automated accessibility checks, a manual audit checklist, expanded Playwright flows, and tutorial migration tests.
   - Completion criteria: Core pages have no high-impact automated accessibility findings, documented keyboard checks pass, and critical user journeys pass in Chromium CI.
