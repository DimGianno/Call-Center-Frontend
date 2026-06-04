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
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";

function App() {
  const [calls, setCalls] = useState([]);
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [callView, setCallView] = useState("active");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [isConfirmProcessing, setIsConfirmProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadCalls();
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(timeoutId);
  }, [toast]);

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

  function showToast(message, type = "success") {
    setToast({
      id: Date.now(),
      message,
      type,
    });
  }

  function openConfirmDialog(dialogConfig) {
    setConfirmDialog(dialogConfig);
  }

  function closeConfirmDialog() {
    if (!isConfirmProcessing) {
      setConfirmDialog(null);
    }
  }

  async function handleConfirmAction() {
    if (!confirmDialog) {
      return;
    }

    setIsConfirmProcessing(true);

    try {
      await confirmDialog.onConfirm();
      setConfirmDialog(null);
    } finally {
      setIsConfirmProcessing(false);
    }
  }

  function handleResetMockData() {
    openConfirmDialog({
      title: "Reload calls?",
      message: "This will refresh the list from the backend and close any selected call.",
      confirmLabel: "Reload calls",
      onConfirm: async () => {
        setSelectedCallId(null);
        await loadCalls();
      },
    });
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
      showToast("Call archived successfully.");
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
      showToast("Note added successfully.");
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    }
  }

  function handleDeleteCall(callId) {
    openConfirmDialog({
      title: "Delete this call?",
      message: "This call will be permanently removed from the dashboard.",
      confirmLabel: "Delete call",
      isDanger: true,
      onConfirm: async () => {
        setErrorMessage("");

        try {
          await deleteCall(callId);
          setCalls((currentCalls) => {
            return currentCalls.filter((call) => call.id !== callId);
          });
          setSelectedCallId(null);
          showToast("Call deleted successfully.");
        } catch (error) {
          setErrorMessage(error.message);
        }
      },
    });

    return false;
  }

  function handleArchiveAll() {
    openConfirmDialog({
      title: "Archive all active calls?",
      message: `This will archive ${activeCallCount} active calls.`,
      confirmLabel: "Archive all",
      onConfirm: async () => {
        setErrorMessage("");

        try {
          await archiveAllCalls();
          setSelectedCallId(null);
          await loadCalls();
          showToast("All active calls archived successfully.");
        } catch (error) {
          setErrorMessage(error.message);
        }
      },
    });
  }

  async function handleUnarchiveCall(callId) {
    setErrorMessage("");

    try {
      const unarchivedCall = await unarchiveCall(callId);
      updateCallInState(unarchivedCall);
      showToast("Call unarchived successfully.");
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    }
  }

  function handleUnarchiveAll() {
    openConfirmDialog({
      title: "Unarchive all archived calls?",
      message: `This will move ${archivedCallCount} archived calls back to active calls.`,
      confirmLabel: "Unarchive all",
      onConfirm: async () => {
        setErrorMessage("");

        try {
          await unarchiveAllCalls();
          setSelectedCallId(null);
          await loadCalls();
          showToast("All archived calls unarchived successfully.");
        } catch (error) {
          setErrorMessage(error.message);
        }
      },
    });
  }

  const activeCallCount = calls.filter((call) => {
    return !call.is_archived;
  }).length;

  const archivedCallCount = calls.filter((call) => {
    return call.is_archived;
  }).length;

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

      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          isDanger={confirmDialog.isDanger}
          isProcessing={isConfirmProcessing}
          onCancel={closeConfirmDialog}
          onConfirm={handleConfirmAction}
        />
      )}

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default App
