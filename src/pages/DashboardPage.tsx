import { useState } from "react";
import type { AuthSession, Theme } from "../types";
import AccountDrawer from "../components/AccountDrawer";
import CallDetails from "../components/CallDetails";
import CallFeed from "../components/CallFeed";
import ConfirmDialog from "../components/ConfirmDialog";
import StatsCards from "../components/StatsCards";
import Toast from "../components/Toast";
import useCalls from "../hooks/useCalls";
import useConfirmDialog from "../hooks/useConfirmDialog";
import useToast from "../hooks/useToast";

interface DashboardPageProps {
  formattedRemainingSessionTime: string;
  onLogout: (message?: string) => void | Promise<void>;
  onRefreshSessionTimer: () => void | Promise<void>;
  onToggleTheme: () => void;
  session: AuthSession;
  theme: Theme;
}

function DashboardPage({
  formattedRemainingSessionTime,
  onLogout,
  onRefreshSessionTimer,
  onToggleTheme,
  session,
  theme,
}: DashboardPageProps) {
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);
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
            className="session-refresh-button"
            type="button"
            title="Refresh session timer"
            aria-label="Refresh session timer"
            onClick={onRefreshSessionTimer}
          >
            <span aria-hidden="true">↻</span>
          </button>
        </div>

        <div className="header-actions">
          <button
            className="account-menu-button"
            type="button"
            aria-label="Open account settings"
            aria-expanded={isAccountDrawerOpen}
            onClick={() => setIsAccountDrawerOpen(true)}
          >
            <span className="account-menu-avatar" aria-hidden="true">
              {session.name.charAt(0).toUpperCase()}
            </span>
            <span className="account-menu-label">Account</span>
          </button>
        </div>
      </header>

      <AccountDrawer
        isOpen={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        onLogout={onLogout}
        onToggleTheme={onToggleTheme}
        session={session}
        theme={theme}
      />

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
