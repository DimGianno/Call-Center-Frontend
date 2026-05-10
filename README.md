# DevReady Week 2 Task — Call Center Dashboard

A frontend call management dashboard built with React and mock data.

The app displays a call activity feed where users can view active calls, inspect call details, archive calls, view archived calls, and restore archived calls.

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
