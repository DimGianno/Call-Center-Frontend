# DevReady Week 2 Task — Call Center Dashboard

A frontend call management dashboard built with **React**, **JavaScript**, and **mock call data**.

The app displays a call activity feed where users can view active calls, inspect call details, archive and unarchive calls, filter/search calls, group calls by date, paginate large call lists, and persist call state locally.

---

## Current Features

### Call Feed

- View active calls in a call activity feed
- View archived calls using the active/archived feed toggle
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

### Call Details

- View full call details in a centered modal
- Display call details in a table layout
- Display notes when a call has notes
- Show a fallback message when no notes exist

### Archive / Unarchive

- Archive a single active call
- Unarchive a single archived call
- Archive all active calls
- Unarchive all archived calls
- Ask for confirmation before bulk archive/unarchive actions

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
- Reset filters inside the filter modal
- Cancel filter changes without affecting the feed
- Show active filter count on the filter button

### Search

- Search calls by phone number
- Search checks both `from` and `to` numbers
- Search works together with filters, pagination, and active/archived views
- Phone search ignores spaces and symbols, so searches like `612`, `+33 6 12`, and `33 612` can match the same number

### Pagination

- Paginate large call lists
- Choose how many calls to show per page:
  - 5
  - 10
  - 25
  - 50
  - 100
- Show pagination controls at the top and bottom of the feed
- Reset to page 1 when filters, search, page size, or feed view change

### UI / UX

- Toggle between light and dark mode
- Compact icon-style feed controls
- Expanding icon buttons on hover
- Hover titles and `aria-label`s for clearer button meaning
- Empty states for:
  - no active calls
  - no archived calls
  - no calls matching search or filters
- Reset mock data from the feed footer

### State / Persistence

- Uses React state for all interactive data
- Uses `localStorage` so archive/unarchive changes survive page refresh
- Provides a reset action to restore the original mock data

---

## Project Structure

```txt
src/
  App.jsx
  main.jsx
  index.css

  data/
    calls.js

  components/
    CallFeed.jsx
    CallItem.jsx
    CallDetails.jsx
    FilterModal.jsx
    PaginationControls.jsx

  utils/
    callUtils.js
    formatters.js
```

---

## Component Tree

```txt
App
 ├── CallFeed
 │    ├── FilterModal
 │    ├── PaginationControls
 │    └── CallItem
 └── CallDetails
```

---

## File Responsibilities

### `App.jsx`

`App.jsx` is the main container of the application.

It is responsible for:

- Storing the full calls state
- Loading calls from `localStorage` when available
- Saving calls to `localStorage` when call state changes
- Storing the selected call ID
- Storing the current call view:
  - active calls
  - archived calls
- Storing the current theme:
  - light
  - dark
- Selecting a call
- Finding the selected call
- Archiving a single call
- Unarchiving a single call
- Archiving all active calls
- Unarchiving all archived calls
- Asking for confirmation before bulk archive/unarchive actions
- Resetting the app back to the original mock data
- Filtering calls by current view before passing them to `CallFeed`

Main state values:

```jsx
const [calls, setCalls] = useState(...);
const [selectedCallId, setSelectedCallId] = useState(null);
const [callView, setCallView] = useState("active");
const [theme, setTheme] = useState("light");
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
- Rendering the reset mock data button in the feed footer
- Passing each call to `CallItem`

The calls it receives from `App.jsx` are already filtered by view:

```txt
Active view    → non-archived calls
Archived view  → archived calls
```

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
actionLabel
onAction
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
  - Archived status
  - Notes
- Displaying a fallback message when no notes exist
- Closing the modal

---

### `FilterModal.jsx`

`FilterModal.jsx` displays the filtering interface inside a centered modal.

It is responsible for:

- Displaying call type filter checkboxes
- Displaying direction filter checkboxes
- Displaying date range inputs
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

### `calls.js`

`calls.js` contains the mock call data used by the app.

Each call object can include:

```js
{
  id: "1",
  direction: "inbound",
  from: "+33 6 12 34 56 78",
  to: "+33 1 23 45 67 89",
  call_type: "answered",
  duration: 120,
  is_archived: false,
  created_at: "2025-04-10T14:32:00Z",
  notes: [
    {
      id: "note-1",
      content: "Customer left a message about their invoice."
    }
  ]
}
```

The `notes` property is optional.

The app safely checks whether notes exist before displaying them.

---

## Utility Files

### `callUtils.js`

`callUtils.js` contains reusable call-data logic.

It is responsible for:

- Default filter settings
- Counting active filters
- Searching calls by phone number
- Filtering calls by type, direction, and date range
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
2025-04-10              → Thursday, 10 April 2025
2025-04-10T14:32:00Z    → 17:32
2025-04-10T14:32:00Z    → 10/04/2025, 17:32
```

---

## Main Data Flow

### Initial calls state

```txt
calls.js mock data
  ↓
App.jsx state
  ↓
localStorage persistence
```

When the app loads:

```txt
If saved calls exist in localStorage:
  use saved calls

Otherwise:
  use calls.js mock data
```

---

### Feed data flow

```txt
all calls in App.jsx
  ↓
filter by active/archived view
  ↓
CallFeed
  ↓
search by phone number
  ↓
filter by modal filters
  ↓
sort newest first
  ↓
paginate
  ↓
group current page by date
  ↓
render CallItem rows
```

---

### Call details flow

```txt
User clicks CallItem
  ↓
selectedCallId is updated
  ↓
App finds selectedCall
  ↓
CallDetails modal opens
```

---

### Archive flow

```txt
User clicks Archive
  ↓
CallItem calls onAction(call.id)
  ↓
App updates calls state
  ↓
Call disappears from Active Calls
  ↓
Call appears in Archived Calls
  ↓
Updated calls are saved to localStorage
```

---

### Unarchive flow

```txt
User clicks Unarchive
  ↓
CallItem calls onAction(call.id)
  ↓
App updates calls state
  ↓
Call disappears from Archived Calls
  ↓
Call appears in Active Calls
  ↓
Updated calls are saved to localStorage
```

---

### Filter flow

```txt
User opens FilterModal
  ↓
draftFilters are edited
  ↓
Cancel closes modal without applying changes
  ↓
Confirm copies draftFilters into appliedFilters
  ↓
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

---

## Notes About `localStorage`

Because the app uses `localStorage`, changes to archive/unarchive state remain after a browser refresh.

If the mock data in `calls.js` is changed later, the app may still load the saved `localStorage` version first.

To reload the original mock data:

```txt
Use the Reset Data button in the feed footer.
```

---

## Future Improvements

Possible future improvements:

- Better mobile/responsive polish
- Custom confirmation modal instead of `window.confirm`
- Better keyboard accessibility for clickable call rows
- Search inside notes
- Filter by duration
- Add statistics cards:
  - total calls
  - active calls
  - archived calls
  - missed calls
  - voicemail calls
- Add unit tests for utility functions
