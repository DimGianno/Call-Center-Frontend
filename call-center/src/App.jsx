import { useState } from 'react'
import mockCalls from './data/calls'
import CallFeed from "./components/CallFeed";
import CallDetails from "./components/CallDetails";

function App() {
  const [calls, setCalls] = useState(mockCalls)
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [callView, setCallView] = useState("active");
  
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

  function handleArchiveAll() {
    const confirmed = window.confirm(
      "Are you sure you want to archive all active calls?"
    );

    if (!confirmed) {
      return;
    }

    setCalls((currentCalls) => {
      return currentCalls.map((call) => {
        if (!call.is_archived) {
          return {
            ...call,
            is_archived: true,
          };
        }

        return call;
      });
    });

    setSelectedCallId(null);
  }

  function handleUnarchiveCall(callId) {
    setCalls((currentCalls) => {
      return currentCalls.map((call) => {
        if (call.id === callId) {
          return {
            ...call,
            is_archived: false
          };
        }

        return call;
      });
    });
  }

  function handleUnarchiveAll() {
    const confirmed = window.confirm(
      "Are you sure you want to unarchive all archived calls?"
    );

    if (!confirmed) {
      return;
    }

    setCalls((currentCalls) => {
      return currentCalls.map((call) => {
        if (call.is_archived) {
          return {
            ...call,
            is_archived: false,
          };
        }

        return call;
      });
    });

    setSelectedCallId(null);
  }


  const visibleCalls  = calls.filter((call) => {
    if (callView === "active") {
      return !call.is_archived;
    }
    return call.is_archived;
  });

  const selectedCall = calls.find((call) => {
    return call.id === selectedCallId;
  });

  return (
    <div className="app" data-theme={theme}>
      <header className="app-header">
        <h1>Call Center Dashboard</h1>
        <button
          className="theme-toggle"
          title="Toggle light/dark theme"
          aria-label="Toggle light/dark theme"
          onClick={handleToggleTheme}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </header>

      <main className="dashboard">
        <CallFeed 
          calls={visibleCalls} 
          callView={callView}
          onCallViewChange={setCallView}
          onSelectCall={handleSelectCall} 
          onArchiveCall={handleArchiveCall}
          onUnarchiveCall={handleUnarchiveCall} 
          onArchiveAll={handleArchiveAll}
          onUnarchiveAll={handleUnarchiveAll}
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
