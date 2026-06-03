import { useEffect, useState } from 'react'
import {
  addCallNote,
  archiveAllCalls,
  archiveCall,
  deleteCall,
  fetchAllCalls,
  fetchCall,
  unarchiveAllCalls,
  unarchiveCall,
} from "./api/callsApi";
import CallFeed from "./components/CallFeed";
import CallDetails from "./components/CallDetails";

function App() {
  const [calls, setCalls] = useState([]);
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [callView, setCallView] = useState("active");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadCalls();
  }, []);

  async function loadCalls() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const apiCalls = await fetchAllCalls();
      setCalls(apiCalls);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function updateCallInState(updatedCall) {
    setCalls((currentCalls) => {
      return currentCalls.map((call) => {
        if (call.id === updatedCall.id) {
          return updatedCall;
        }

        return call;
      });
    });
  }

  async function handleResetMockData() {
    const confirmed = window.confirm(
      "Are you sure you want to reload calls from the backend?"
    );

    if (!confirmed) {
      return;
    }

    setSelectedCallId(null);
    await loadCalls();
  }
  
  function handleToggleTheme() {
    setTheme((currentTheme) => {
      return currentTheme === "dark" ? "light" : "dark";
    });
  }
  
  async function handleSelectCall(callId) {
    setErrorMessage("");

    try {
      const call = await fetchCall(callId);
      updateCallInState(call);
      setSelectedCallId(callId);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleArchiveCall(callId) {
    setErrorMessage("");

    try {
      const archivedCall = await archiveCall(callId);
      updateCallInState(archivedCall);
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    }

    if (selectedCallId === callId) {
      setSelectedCallId(null);
    } 

    return true;
  }

  async function handleAddNote(callId, content) {
    setErrorMessage("");

    try {
      const updatedCall = await addCallNote(callId, content);
      updateCallInState(updatedCall);
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    }
  }

  async function handleDeleteCall(callId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this call?"
    );

    if (!confirmed) {
      return false;
    }

    setErrorMessage("");

    try {
      await deleteCall(callId);
      setCalls((currentCalls) => {
        return currentCalls.filter((call) => call.id !== callId);
      });
      setSelectedCallId(null);
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    }
  }

  async function handleArchiveAll() {
    const confirmed = window.confirm(
      "Are you sure you want to archive all active calls?"
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");

    try {
      await archiveAllCalls();
      setSelectedCallId(null);
      await loadCalls();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleUnarchiveCall(callId) {
    setErrorMessage("");

    try {
      const unarchivedCall = await unarchiveCall(callId);
      updateCallInState(unarchivedCall);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleUnarchiveAll() {
    const confirmed = window.confirm(
      "Are you sure you want to unarchive all archived calls?"
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");

    try {
      await unarchiveAllCalls();
      setSelectedCallId(null);
      await loadCalls();
    } catch (error) {
      setErrorMessage(error.message);
    }
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
          className="icon-action-button"
          title="Toggle light/dark theme"
          aria-label="Toggle light/dark theme"
          onClick={handleToggleTheme}
        >
          <span className="icon-action-emoji">{theme === "light" ? "🌙" : "☀️"}</span>
          <span className="icon-action-label">
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </span>
        </button>
      </header>

      <main className="dashboard">
        {errorMessage && (
          <div className="empty-state">
            <p>{errorMessage}</p>
          </div>
        )}

        {isLoading ? (
          <div className="empty-state">
            <p>Loading calls...</p>
          </div>
        ) : (
          <CallFeed 
            calls={visibleCalls} 
            callView={callView}
            onCallViewChange={setCallView}
            onSelectCall={handleSelectCall} 
            onArchiveCall={handleArchiveCall}
            onUnarchiveCall={handleUnarchiveCall} 
            onArchiveAll={handleArchiveAll}
            onUnarchiveAll={handleUnarchiveAll}
            onResetMockData={handleResetMockData}
          />
        )}
      </main>

      {/* Display the selected call details in a popup bubble */}
      {selectedCall && (
        <CallDetails 
          call={selectedCall} 
          onClose={() => setSelectedCallId(null)} 
          onAddNote={handleAddNote}
          onArchiveCall={handleArchiveCall}
          onDeleteCall={handleDeleteCall}
        />
      )}
    </div>
  )
}

export default App
