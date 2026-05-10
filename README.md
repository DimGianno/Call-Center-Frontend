# DevReady-Week-2-Task
-----------------------------------------------------------------------------
src/
  App.jsx
  main.jsx
  index.ccs
  data/
    calls.js
  components/
    CallFeed.jsx
    CallItem.jsx
    CallDetails.jsx
-----------------------------------------------------------------------------
App
 ├── CallFeed
 │    └── CallItem
 └── CallDetails
 ----------------------------------------------------------------------------

App.jsx is responsible for:
  calls state
  selectedCallId state
  handleSelectCall
  handleArchiveCall
  finding selectedCall
  filtering activeCalls

CallFeed.jsx is responsible for:
  Activity Feed title
  empty state message
  mapping activeCalls into CallItem components

CallItem.jsx is responsible for:
  one call details row 
  click to select
  archive button

CallDetails.jsx is responsible for:
  centered modal
  details table
  notes display
  close button
