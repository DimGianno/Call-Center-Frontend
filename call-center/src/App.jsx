import { useState } from 'react'
import mockCalls from './data/calls'
import CallFeed from "./components/CallFeed";
import CallDetails from "./components/CallDetails";

function App() {
  const [calls, setCalls] = useState(mockCalls)
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [theme, setTheme] = useState("dark");
  
  function handleToggleTheme() {
    setTheme((currentTheme) => {
      return currentTheme === "dark" ? "light" : "dark";
    });
  }
  
  function handleSelectCall(callId) {
    setSelectedCallId(callId);
  }

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

  const activeCalls = calls.filter((call) => !call.is_archived);

  
  const selectedCall = calls.find((call) => {
    return call.id === selectedCallId;
  });

  return (
    <div className="app" data-theme={theme}>
      <header className="app-header">
        <h1>Call Center Dashboard</h1>
        <button
          className="theme-toggle"
          onClick={handleToggleTheme}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </header>

      <main className="dashboard">
        <CallFeed 
          calls={activeCalls} 
          onSelectCall={handleSelectCall} 
          onArchiveCall={handleArchiveCall} 
        />
      </main>

      {/* Display the selected call details in a popup bubble */}
      {selectedCall && (
        <CallDetails 
          call={selectedCall} 
          onClose={() => setSelectedCallId(null)} 
        />
      )}
    </div>
  )
}

export default App
