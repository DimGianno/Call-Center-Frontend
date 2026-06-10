import CallDetails from "../components/CallDetails";
import CallFeed from "../components/CallFeed";
import ConfirmDialog from "../components/ConfirmDialog";
import StatsCards from "../components/StatsCards";
import Toast from "../components/Toast";
import useCalls from "../hooks/useCalls";
import useConfirmDialog from "../hooks/useConfirmDialog";
import useToast from "../hooks/useToast";

function DashboardPage({
  formattedRemainingSessionTime,
  onLogout,
  onRefreshSessionTimer,
  onToggleTheme,
  session,
  theme,
}) {
  const { toast, showToast, dismissToast } = useToast();
  const {
    closeConfirmDialog,
    confirmDialog,
    handleConfirmAction,
    isConfirmProcessing,
    openConfirmDialog,
  } = useConfirmDialog();
  const calls = useCalls({ showToast, openConfirmDialog });

  return (
    <>
      <header className="app-header">
        <h1>Call Center Dashboard</h1>

        <div className="session-control" role="timer" aria-label="Session time remaining">
          <span className="session-time">{formattedRemainingSessionTime}</span>
          <button
            className="header-button"
            type="button"
            title="Refresh session timer"
            aria-label="Refresh session timer"
            onClick={onRefreshSessionTimer}
          >
            Refresh
          </button>
        </div>

        <div className="header-actions">
          <span className="signed-in-user">Signed in as {session.name}</span>
          <button className="header-button" type="button" onClick={() => onLogout()}>
            Logout
          </button>
          <button
            className="header-button"
            type="button"
            title="Toggle light/dark theme"
            aria-label="Toggle light/dark theme"
            onClick={onToggleTheme}
          >
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
      </header>

      <main className="dashboard">
        {calls.errorMessage && (
          <div className="empty-state">
            <p>{calls.errorMessage}</p>
          </div>
        )}

        {calls.isLoading ? (
          <div className="empty-state">
            <p>Loading calls...</p>
          </div>
        ) : (
          <>
            <StatsCards calls={calls.visibleCalls} callView={calls.callView} />
            <CallFeed
              calls={calls.visibleCalls}
              callView={calls.callView}
              onArchiveAll={calls.handleArchiveAll}
              onArchiveCall={calls.handleArchiveCall}
              onCallViewChange={calls.setCallView}
              onResetCalls={calls.handleResetCalls}
              onSelectCall={calls.handleSelectCall}
              onUnarchiveAll={calls.handleUnarchiveAll}
              onUnarchiveCall={calls.handleUnarchiveCall}
            />
          </>
        )}
      </main>

      {calls.selectedCall && (
        <CallDetails
          call={calls.selectedCall}
          onAddNote={calls.handleAddNote}
          onArchiveCall={calls.handleArchiveCall}
          onClose={calls.clearSelectedCall}
          onDeleteCall={calls.handleDeleteCall}
          onUnarchiveCall={calls.handleUnarchiveCall}
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
        <Toast key={toast.id} message={toast.message} type={toast.type} onDismiss={dismissToast} />
      )}
    </>
  );
}

export default DashboardPage;
