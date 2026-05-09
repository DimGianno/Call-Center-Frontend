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

  const activeCalls = calls.filter((call) => !call.is_archived);

  function handleArchiveCall(callId) {
    setCalls((currentCalls) => {
      return currentCalls.map((call) => {
        if (call.id === callId) {
          return { 
            ...call, 
            is_archived: true 
          };
        }
        return call;
      });
    }); 

    if (selectedCallId === callId) {
      setSelectedCallId(null);
    } 
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Call Center Dashboard</h1>
      </header>

      <main className="dashboard">
        <section className="call-feed">
          <h2>Call Feed</h2>
          {activeCalls.length > 0 ? (
            activeCalls.map((call) => {
              return (
                <CallItem 
                  key={call.id} 
                  call={call} 
                  onSelectCall={handleSelectCall} 
                  onArchiveCall={handleArchiveCall}
                />
              );
            })
          ) : (
            <p>No active calls to display.</p>
          )}
        </section>
      </main>

      {/* Display the selected call details in a popup bubble */}
      {selectedCall && (
        <div className="modal-overlay">
          <div className="call-details-modal">
            <div className="modal-header">
              <h2>Selected Call Info:</h2>
              <button 
                className="close-button"
                onClick={() => setSelectedCallId(null)}
              >
                Close
              </button>
            </div>
            <table className="details-table">
              <tbody>
                <tr>
                  <th><strong>Direction:</strong></th>
                  <td>{selectedCall.direction}</td>
                </tr>
                <tr>
                  <th><strong>From:</strong></th>
                  <td>{selectedCall.from}</td>
                </tr>
                <tr>
                  <th><strong>To:</strong></th>
                  <td>{selectedCall.to}</td>
                </tr>
                <tr>
                  <th><strong>Type:</strong></th>
                  <td>{selectedCall.call_type}</td>
                </tr>
                <tr>
                  <th><strong>Duration:</strong></th>
                  <td>{selectedCall.duration} seconds</td>
                </tr>
                <tr>
                  <th><strong>Date:</strong></th>
                  <td>{new Date(selectedCall.created_at).toLocaleString()}</td>
                </tr>
                <tr>
                  <th><strong>Notes:</strong></th>
                  <td>
                    {selectedCall.notes && selectedCall.notes.length > 0 ? (
                    <ul className="details-notes">
                      {selectedCall.notes.map((note) => (
                        <li key={note.id}>{note.content}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>No notes available for this call.</span>
                  )}
                  </td>
                </tr>
              </tbody>
            </table>
 
          </div>
        </div>
      )}
    </div>
  )
}

export default App
