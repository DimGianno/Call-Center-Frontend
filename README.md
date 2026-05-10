# DevReady Week 2 Task — Call Center Dashboard

A frontend call management dashboard built with React and mock data.

The app displays a call activity feed where users can view active calls, inspect call details, archive calls, view archived calls, restore archived calls and filter all calls.

---

## Current Features

- View active calls in a call activity feed
- View archived calls using the feed toggle
- View full call details in a centered modal
- Archive a single active call
- Unarchive a single archived call
- Archive all active calls
- Unarchive all archived calls
- Display notes when a call has notes
- Show empty states when there are no active or archived calls
- Toggle between light and dark mode
- Uses local React state with mock data
- Filter calls using a modal with confirmation
- Filter by call type:
  - answered
  - missed
  - voicemail
- Filter by direction:
  - inbound
  - outbound
- Filter by date range using native date inputs
- Reset filters before confirming
- Cancel filter changes without affecting the feed

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