# DevReady Week 2 Task - Call Center Dashboard

A frontend call management dashboard built with **React**, **JavaScript**, and a deployed backend API.

The app displays a call activity feed where users can view active and archived calls, inspect call details, add notes, archive or unarchive calls, delete calls, filter/search calls, group calls by date, paginate large call lists, and receive success/error feedback for API-backed actions.

Live frontend:

```txt
https://call-center-frontend-fawn.vercel.app/
```

---

## Backend API

The frontend connects to the deployed backend through a Vite environment variable:

```env
VITE_API_URL=https://call-center-backend-7z8r.onrender.com
```

API documentation:

```txt
https://call-center-backend-7z8r.onrender.com/api-docs/
```

Backend GitHub project:

[DimGianno/Call-Center-BackEnd](https://github.com/DimGianno/Call-Center-BackEnd)

The frontend API service is centralized in:

```txt
src/api/callsApi.js
```

It handles:

- API base URL configuration through `VITE_API_URL`
- Fetching active and archived calls
- Fetching a single selected call
- Adding notes
- Archiving and unarchiving calls
- Deleting calls
- Bulk archive and unarchive actions
- Retry logic for network failures and server errors
- Clear API error messages for the UI

---

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=https://call-center-backend-7z8r.onrender.com
```

Run the development server:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Check formatting:

```bash
npm run format:check
```

Format files:

```bash
npm run format
```

---

## Current Features

### Call Feed

- Fetch calls from the backend API
- View active calls in a call activity feed
- View archived calls using the active/archived feed toggle
- View compact statistics cards for the current active or archived feed view
- Group calls by date
- Sort calls newest first
- Display call rows with:
  - direction
  - call type
  - from number
  - to number
  - time
  - duration
  - archive/unarchive action

### Statistics Cards

- Show 6 compact cards above the call feed
- Count only the current feed view:
  - active calls when viewing Active
  - archived calls when viewing Archived
- Display:
  - current view total
  - inbound calls
  - outbound calls
  - answered calls
  - missed calls
  - voicemail calls
- Match the direction and call-type colors used in the feed
- Stay independent from phone search, filters, sorting, and pagination

### Call Details

- View full call details in a centered modal
- Fetch the selected call from the backend so details can include notes
- Display call details in a table layout
- Display notes when a call has notes
- Show a fallback message when no notes exist
- Add a note to the selected call
- Archive an active call from the details modal
- Unarchive an archived call from the details modal
- Delete the selected call from the details modal

### Archive / Unarchive / Delete

- Archive a single active call
- Unarchive a single archived call
- Archive all active calls
- Unarchive all archived calls
- Delete a single call
- Confirm destructive or bulk actions using an in-app confirmation dialog
- Show toast notifications after successful actions

### Notes

- Add a note from the call details modal
- Submit note content to the backend
- Display the updated note list after the backend confirms the change
- Use optimistic UI updates so the note appears immediately while the request is pending

### Filtering

- Filter calls using a modal with confirmation
- Filter by call type:
  - answered
  - missed
  - voicemail
- Filter by direction:
  - inbound
  - outbound
- Filter by date range using native date inputs
- Filter by duration using a double slider from `0 sec` to `500+ sec`
- Reset filters inside the filter modal
- Cancel filter changes without affecting the feed
- Show active filter count on the filter button
- Date and duration filtering are handled on the frontend after calls are fetched

### Search

- Search calls by phone number
- Search checks both `from` and `to` numbers
- Search works together with filters, pagination, and active/archived views
- Phone search ignores spaces and symbols, so searches like `612`, `+33 6 12`, and `33 612` can match the same number
- Phone search is handled on the frontend after calls are fetched

### Pagination

- Paginate large call lists in the UI
- Choose how many calls to show per page:
  - 5
  - 10
  - 25
  - 50
- The page-size selector is capped at 50 to match the backend API limit
- Show pagination controls at the top and bottom of the feed
- Reset to page 1 when filters, search, page size, or feed view change

### UI / UX

- Toggle between light and dark mode
- Compact icon-style feed controls
- Expanding icon buttons on hover
- Hover titles and `aria-label`s for clearer button meaning
- Loading indicator while calls are being fetched
- Empty states for:
  - no active calls
  - no archived calls
  - no calls matching search or filters
- Graceful error messages when API requests fail
- In-app confirmation dialog for reload, bulk actions, and delete
- Toast notifications for successful actions

### Bonus Features

- Centralized API service in `src/api/callsApi.js`
- API base URL stored in `VITE_API_URL`
- Retry logic for network failures and server errors
- Toast notifications for action success messages
- Optimistic updates for:
  - archive single call
  - unarchive single call
  - delete single call
  - add note

---

## Project Structure

```txt
src/
  App.jsx
  main.jsx
  index.css

  api/
    callsApi.js

  components/
    CallFeed.jsx
    CallItem.jsx
    CallDetails.jsx
    ConfirmDialog.jsx
    FilterModal.jsx
    PaginationControls.jsx
    StatsCards.jsx
    Toast.jsx

  utils/
    callUtils.js
    formatters.js

  test/
    App.integration.test.jsx
    callsApi.test.js
    setup.js

.github/
  workflows/
    ci.yml
```

---

## Component Tree

```txt
App
  |-- StatsCards
  |-- CallFeed
  |   |-- FilterModal
  |   |-- PaginationControls
  |   `-- CallItem
  |-- CallDetails
  |-- ConfirmDialog
  `-- Toast
```

---

## File Responsibilities

### `App.jsx`

`App.jsx` is the main container of the application.

It is responsible for:

- Loading calls from the backend API
- Storing the full calls state
- Storing the selected call ID
- Storing the current call view:
  - active calls
  - archived calls
- Storing the current theme:
  - light
  - dark
- Storing loading and error state
- Storing confirmation dialog state
- Storing toast notification state
- Selecting a call and fetching its full details
- Finding the selected call
- Archiving a single call
- Unarchiving a single call
- Deleting a single call
- Adding a note to a call
- Archiving all active calls
- Unarchiving all archived calls
- Running optimistic updates for single-call actions
- Rolling back optimistic updates when API requests fail
- Filtering calls by current view before passing them to `CallFeed`
- Passing current-view calls to `StatsCards`

Main state values:

```jsx
const [calls, setCalls] = useState([]);
const [selectedCallId, setSelectedCallId] = useState(null);
const [callView, setCallView] = useState("active");
const [theme, setTheme] = useState("dark");
const [isLoading, setIsLoading] = useState(true);
const [errorMessage, setErrorMessage] = useState("");
const [confirmDialog, setConfirmDialog] = useState(null);
const [toast, setToast] = useState(null);
```

---

### `callsApi.js`

`callsApi.js` is the centralized API service for backend communication.

It is responsible for:

- Reading `VITE_API_URL`
- Building API requests
- Parsing JSON responses safely
- Retrying network and server failures
- Returning backend data to the UI
- Throwing readable errors for failed requests

Backend actions include:

```txt
GET    /calls
GET    /calls/:callId
POST   /calls/:callId/notes
PATCH  /calls/:callId/archive
PATCH  /calls/:callId/unarchive
DELETE /calls/:callId
PATCH  /calls/archive-all
PATCH  /calls/unarchive-all
```

---

### `CallFeed.jsx`

`CallFeed.jsx` displays the current call feed.

It is responsible for:

- Showing the current feed title:
  - Active Calls
  - Archived Calls
- Showing the current visible range of calls
- Searching calls by phone number
- Opening and closing the filter modal
- Storing applied filters
- Storing draft filters while the filter modal is open
- Applying confirmed filters to the feed
- Showing active filter count
- Sorting calls newest first
- Paginating calls
- Grouping the current page of calls by date
- Rendering top and bottom pagination controls
- Showing the correct row action:
  - Archive
  - Unarchive
- Showing the correct bulk action:
  - Archive All
  - Unarchive All
- Rendering the reload button in the feed footer
- Passing each call to `CallItem`

The calls it receives from `App.jsx` are already filtered by view:

```txt
Active view    -> non-archived calls
Archived view  -> archived calls
```

---

### `StatsCards.jsx`

`StatsCards.jsx` displays compact summary cards above the feed.

It is responsible for:

- Counting calls from the current active or archived view
- Showing the current view total:
  - Active Calls
  - Archived Calls
- Counting inbound and outbound calls
- Counting answered, missed, and voicemail calls
- Rendering direction and type accents that match the feed colors
- Staying unaffected by search, filters, sorting, and pagination

---

### `CallItem.jsx`

`CallItem.jsx` displays one call row inside the feed.

It is responsible for:

- Displaying the call direction
- Displaying the call type
- Displaying the from and to numbers
- Displaying the call time
- Displaying the call duration
- Opening the call details modal when clicked
- Running the current row action:
  - Archive
  - Unarchive

`CallItem` does not decide whether it archives or unarchives a call.

Instead, it receives:

```jsx
actionLabel;
onAction;
```

This makes it reusable for both active and archived calls.

---

### `CallDetails.jsx`

`CallDetails.jsx` displays the selected call inside a centered modal.

It is responsible for:

- Showing a modal overlay
- Displaying the selected call details in a table
- Showing:
  - Direction
  - From
  - To
  - Type
  - Duration
  - Date
  - Notes
- Displaying a fallback message when no notes exist
- Adding a note
- Archiving an active selected call
- Unarchiving an archived selected call
- Deleting the selected call
- Closing the modal

---

### `ConfirmDialog.jsx`

`ConfirmDialog.jsx` displays the reusable confirmation modal.

It is responsible for:

- Showing a title and message
- Providing a cancel action
- Providing a confirm action
- Supporting danger styling for destructive actions
- Disabling actions while the confirmed request is processing

---

### `Toast.jsx`

`Toast.jsx` displays short success notifications.

It is responsible for:

- Showing a toast message
- Supporting success and error styles
- Providing a dismiss button
- Working with the auto-dismiss timer in `App.jsx`

---

### `FilterModal.jsx`

`FilterModal.jsx` displays the filtering interface inside a centered modal.

It is responsible for:

- Displaying call type filter checkboxes
- Displaying direction filter checkboxes
- Displaying date range inputs
- Displaying the duration double slider
- Updating draft filter values
- Resetting draft filters
- Cancelling without applying changes
- Confirming filters and applying them to the feed

The modal edits `draftFilters`.

The feed only changes when the user confirms the filters.

---

### `PaginationControls.jsx`

`PaginationControls.jsx` displays reusable pagination controls.

It is responsible for:

- Showing the current page
- Showing total pages
- Moving to the previous page
- Moving to the next page
- Disabling previous/next buttons when needed

It is rendered twice in the feed:

```txt
Top of feed
Bottom of feed
```

---

## Utility Files

### `callUtils.js`

`callUtils.js` contains reusable call-data logic.

It is responsible for:

- Default filter settings
- Counting active filters
- Searching calls by phone number
- Filtering calls by type, direction, date range, and duration range
- Sorting calls newest first
- Paginating calls
- Grouping calls by date

This keeps the main feed component cleaner.

---

### `formatters.js`

`formatters.js` contains reusable formatting helpers.

It is responsible for:

- Formatting date group headers
- Formatting call row times
- Formatting full call date/time values for the details modal

Example formatting responsibilities:

```txt
2025-04-10              -> Thursday, 10 April 2025
2025-04-10T14:32:00Z    -> 17:32
2025-04-10T14:32:00Z    -> 10/04/2025, 17:32
```

---

## Testing

The project uses **Vitest**, **React Testing Library**, **jest-dom**, and **jsdom**.

Run the full test suite:

```bash
npm test
```

The current suite includes:

- Integration tests for API-backed user flows in `App`
- API service tests for pagination, retry behavior, request methods, request bodies, and missing API configuration

The integration tests cover:

- Initial call loading
- API error states
- Selecting call details
- Adding notes
- Optimistic note rollback on failure
- Archiving and unarchiving calls
- Optimistic archive rollback on failure
- Bulk archive and unarchive confirmations
- Reload confirmation
- Delete confirmation
- Search, filters, pagination, empty states, and theme toggling

Test files live in:

```txt
src/test/
```

---

## Code Quality

The project uses **ESLint** for linting and **Prettier** for formatting.

Run linting:

```bash
npm run lint
```

Check formatting without changing files:

```bash
npm run format:check
```

Apply formatting:

```bash
npm run format
```

Prettier is configured with:

```txt
.prettierrc
.prettierignore
```

---

## Continuous Integration / Deployment

GitHub Actions is configured in:

```txt
.github/workflows/ci.yml
```

The CI workflow runs automatically on:

- Pushes
- Pull requests

The pipeline:

- Installs dependencies with `npm ci`
- Checks formatting with `npm run format:check`
- Runs linting with `npm run lint`
- Runs tests with `npm test`
- Builds the project with `npm run build`

Continuous deployment is handled by **Vercel**:

```txt
https://call-center-frontend-fawn.vercel.app/
```

Vercel is connected to the frontend repository and deploys the Vite app automatically when changes are pushed to the production branch.

Branch protection is also configured so protected merges require CI to pass before code is merged into `main`.

---

## Main Data Flow

### Initial calls state

```txt
Backend GET /calls?is_archived=false
Backend GET /calls?is_archived=true
  |
App.jsx state
  |
CallFeed
```

When the app loads:

```txt
App requests active calls and archived calls
  |
API service combines the results
  |
App stores calls in React state
```

---

### Feed data flow

```txt
all calls in App.jsx
  |
filter by active/archived view
  |
StatsCards
  |
CallFeed
  |
search by phone number
  |
filter by modal filters
  |
sort newest first
  |
paginate
  |
group current page by date
  |
render CallItem rows
```

Phone search, date filtering, duration filtering, sorting, grouping, and UI pagination run on the frontend after calls are fetched.

Statistics cards are calculated from the active/archived view before search, filtering, sorting, or pagination are applied.

---

### Call details flow

```txt
User clicks CallItem
  |
App requests GET /calls/:callId
  |
selectedCallId is updated
  |
App finds selectedCall
  |
CallDetails modal opens
```

---

### Archive flow

```txt
User clicks Archive
  |
App optimistically marks the call as archived
  |
PATCH /calls/:callId/archive
  |
Backend response confirms the call state
  |
Toast confirms success
```

If the request fails:

```txt
Previous calls state is restored
  |
Error message is displayed
```

---

### Unarchive flow

```txt
User clicks Unarchive
  |
App optimistically marks the call as active
  |
PATCH /calls/:callId/unarchive
  |
Backend response confirms the call state
  |
Toast confirms success
```

If the request fails:

```txt
Previous calls state is restored
  |
Error message is displayed
```

---

### Delete flow

```txt
User clicks Delete call
  |
ConfirmDialog asks for confirmation
  |
App optimistically removes the call
  |
DELETE /calls/:callId
  |
Toast confirms success
```

If the request fails:

```txt
Previous calls state is restored
  |
Selected call is restored
  |
Error message is displayed
```

---

### Add note flow

```txt
User writes a note
  |
App optimistically adds a temporary note
  |
POST /calls/:callId/notes
  |
Backend response replaces the call with the confirmed version
  |
Toast confirms success
```

If the request fails:

```txt
Previous calls state is restored
  |
Error message is displayed
```

---

### Bulk action flow

```txt
User clicks Archive All or Unarchive All
  |
ConfirmDialog asks for confirmation
  |
Backend bulk endpoint runs
  |
App reloads calls from the backend
  |
Toast confirms success
```

Bulk actions reload backend data after completion to avoid mismatches if many records change at once.

---

### Filter flow

```txt
User opens FilterModal
  |
draftFilters are edited
  |
Cancel closes modal without applying changes
  |
Confirm copies draftFilters into appliedFilters
  |
CallFeed recalculates visible calls
```

---

## Styling

The app uses plain CSS in:

```txt
src/index.css
```

The CSS is organized around variables for easier future changes.

Examples:

```css
--color-page-bg
--color-surface
--color-header-bg
--color-text-main
--color-border
--color-button-bg
```

The app supports a manual light/dark mode toggle by changing the `data-theme` value on the main `.app` element.

The feed controls use compact icon-style buttons that expand on hover.

The modal and toast styles are shared across:

- call details
- filters
- confirmation dialogs
- success notifications

---

## Error Handling

The app handles API failures gracefully.

Examples:

- Initial call loading failures show an inline error state
- Failed single-call optimistic updates roll back to the previous state
- Failed note creation removes the temporary note
- Failed delete restores the deleted call
- Failed API requests surface readable error messages
- Server/network failures are retried before the final error is shown

---

## Future Improvements

Possible future improvements:

- Search inside notes
- Backend-supported phone search
- Backend-supported date range filtering
- Add more focused unit tests for utility edge cases
