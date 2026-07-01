import { useEffect, useState } from "react";
import type { AuthSession, Theme, TutorialTargetId, TutorialTopicId } from "../types";
import AccountDrawer from "../components/AccountDrawer";
import CallDetails from "../components/CallDetails";
import CallFeed from "../components/CallFeed";
import ConfirmDialog from "../components/ConfirmDialog";
import StatsCards from "../components/StatsCards";
import Toast from "../components/Toast";
import { TutorialOverlay, TutorialWelcomeDialog } from "../components/TutorialOverlay";
import useCalls from "../hooks/useCalls";
import useConfirmDialog from "../hooks/useConfirmDialog";
import useTutorial from "../hooks/useTutorial";
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
  const [activeTutorialTarget, setActiveTutorialTarget] = useState<TutorialTargetId | null>(null);
  const { toast, showToast, dismissToast } = useToast();
  const {
    closeConfirmDialog,
    confirmDialog,
    handleConfirmAction,
    isConfirmProcessing,
    openConfirmDialog,
  } = useConfirmDialog();
  const calls = useCalls({ showToast, openConfirmDialog });
  const tutorial = useTutorial({ showToast });
  const { recordTutorialEvent } = tutorial;

  useEffect(() => {
    if (calls.selectedCall) {
      recordTutorialEvent("call-details-opened");
    }
  }, [calls.selectedCall, recordTutorialEvent]);

  useEffect(() => {
    if (!activeTutorialTarget) {
      return undefined;
    }

    const scrollTimer = window.setTimeout(() => {
      const activeElement = document.querySelector<HTMLElement>('[data-tutorial-active="true"]');

      activeElement?.scrollIntoView?.({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }, 0);

    return () => window.clearTimeout(scrollTimer);
  }, [activeTutorialTarget]);

  function handleOpenAccountDrawer() {
    setIsAccountDrawerOpen(true);
    recordTutorialEvent("account-opened");
  }

  function handleCloseAccountDrawer() {
    setIsAccountDrawerOpen(false);
    recordTutorialEvent("account-closed");
  }

  function handleStartTutorial(topicId: TutorialTopicId) {
    setIsAccountDrawerOpen(false);
    tutorial.startTutorial(topicId);
  }

  return (
    <>
      <header className="app-header">
        <h1>Call Center Dashboard</h1>

        <div
          className="session-control"
          role="timer"
          aria-label="Session time remaining"
          data-tutorial-active={activeTutorialTarget === "session-timer" ? "true" : undefined}
        >
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
            data-tutorial-active={activeTutorialTarget === "account-button" ? "true" : undefined}
            onClick={handleOpenAccountDrawer}
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
        onClose={handleCloseAccountDrawer}
        onLogout={onLogout}
        onStartTutorial={handleStartTutorial}
        onToggleTheme={onToggleTheme}
        activeTutorialTarget={activeTutorialTarget}
        session={session}
        theme={theme}
        tutorialState={tutorial.tutorialState}
      />

      <main
        className="dashboard"
        data-tutorial-active={activeTutorialTarget === "dashboard-layout" ? "true" : undefined}
      >
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
            <StatsCards
              calls={calls.visibleCalls}
              callView={calls.callView}
              isTutorialActive={activeTutorialTarget === "stats-cards"}
            />
            <CallFeed
              calls={calls.visibleCalls}
              callView={calls.callView}
              showSeedGuidance={!calls.errorMessage && !calls.hasAnyCalls}
              activeTutorialTarget={activeTutorialTarget}
              onArchiveAll={calls.handleArchiveAll}
              onArchiveCall={calls.handleArchiveCall}
              onCallViewChange={calls.setCallView}
              onTutorialEvent={tutorial.recordTutorialEvent}
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
          isTutorialActionsActive={activeTutorialTarget === "call-update-actions"}
          isTutorialSummaryActive={activeTutorialTarget === "call-details-summary"}
          onTutorialNoteTyped={() => recordTutorialEvent("note-typed")}
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

      {tutorial.isWelcomeOpen && (
        <TutorialWelcomeDialog
          onStart={() => tutorial.startTutorial("full")}
          onSkip={tutorial.skipTutorial}
        />
      )}

      {tutorial.activeFlow && (
        <TutorialOverlay
          activeFlow={tutorial.activeFlow}
          completedEvents={tutorial.completedEvents}
          hasAnyCalls={calls.hasAnyCalls}
          hasCallCards={calls.visibleCalls.length > 0}
          onActiveTargetChange={setActiveTutorialTarget}
          onComplete={tutorial.completeTutorial}
          onSkip={tutorial.skipTutorial}
        />
      )}
    </>
  );
}

export default DashboardPage;
