import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import mockCalls from './data/calls'
import CallItem from './components/CallItem'


function App() {
  const [calls, setCalls] = useState(mockCalls)
  const [selectedCallId, setSelectedCallId] = useState(null);
  
  function handleSelectCall(callId) {
    setSelectedCallId(callId);
  }

  const selectedCall = calls.find((call) => {
    return call.id === selectedCallId;
  });

  return (
    <>
      <div>
        <h1>Call Center Dashboard</h1>
        <h2>Selected Call ID: {selectedCallId}</h2>
      </div>
      <div>
        {calls
          .filter((call) => call.is_archived === false)
          .map((call) => {
            return (
              <CallItem 
                key={call.id} 
                call={call} 
                onSelectCall={handleSelectCall} 
              />
            );
          })}

        //Display the selected call details in a popup bubble
        {selectedCall && (
          <div className="popup-bubble">
            <button onClick={() => setSelectedCallId(null)}>Close</button>
            <p>Selected Call Info:</p>
            <p>Direction: {selectedCall.direction}</p>
            <p>From: {selectedCall.from}</p>
            <p>To: {selectedCall.to}</p>
            <p>Type: {selectedCall.call_type}</p>
            <p>Duration: {selectedCall.duration} seconds</p>
            <p>Date: {new Date(selectedCall.created_at).toLocaleString()}</p>
            <p>Notes:</p>
            {selectedCall.notes && selectedCall.notes.length > 0 ? (
              <ul>
                {selectedCall.notes.map((note) => (
                  <li key={note.id}>{note.content}</li>
                ))}
              </ul>
            ) : (
              <p>No notes available for this call.</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default App
