import { useEffect } from "react";
import type { AuthSession, Theme, TutorialTargetId, TutorialTopicId } from "../types";

interface AccountDrawerProps {
  activeTutorialTarget: TutorialTargetId | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void | Promise<void>;
  onStartTutorial: (topicId: TutorialTopicId) => void;
  onToggleTheme: () => void;
  session: AuthSession;
  theme: Theme;
}

const tutorialOptions: Array<{ label: string; topicId: TutorialTopicId }> = [
  { label: "Full tutorial", topicId: "full" },
  { label: "Seeding calls", topicId: "seeding" },
  { label: "Stats cards", topicId: "stats" },
  { label: "Layout and call list", topicId: "layout" },
  { label: "Call details and notes", topicId: "call-details" },
  { label: "Filters", topicId: "filters" },
  { label: "Session timer", topicId: "session-timer" },
  { label: "Account settings", topicId: "account-settings" },
];

function AccountDrawer({
  activeTutorialTarget,
  isOpen,
  onClose,
  onLogout,
  onStartTutorial,
  onToggleTheme,
  session,
  theme,
}: AccountDrawerProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="account-drawer-layer">
      <button
        className="account-drawer-overlay"
        type="button"
        aria-label="Dismiss account settings"
        onClick={onClose}
      />

      <aside
        className="account-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-drawer-title"
        data-tutorial-active={activeTutorialTarget === "account-drawer" ? "true" : undefined}
      >
        <div className="account-drawer-header">
          <div>
            <p className="account-drawer-kicker">Signed in</p>
            <h2 id="account-drawer-title">{session.name}</h2>
          </div>
          <button
            className="account-drawer-close"
            type="button"
            aria-label="Close account settings"
            onClick={onClose}
          >
            x
          </button>
        </div>

        {session.email && <p className="account-drawer-email">{session.email}</p>}

        <div className="account-drawer-section">
          <h3>Preferences</h3>
          <button
            className="theme-toggle-button drawer-theme-toggle"
            type="button"
            title="Toggle light/dark theme"
            aria-label="Toggle light/dark theme"
            onClick={onToggleTheme}
          >
            <span className="theme-toggle-icon" aria-hidden="true">
              {theme === "light" ? "🌙" : "☀️"}
            </span>
            <span className="theme-toggle-label">
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </span>
          </button>
        </div>

        <div className="account-drawer-section">
          <h3>Tutorials</h3>
          <div className="drawer-tutorial-list">
            {tutorialOptions.map((tutorialOption) => {
              return (
                <button
                  className="drawer-tutorial-button"
                  type="button"
                  key={tutorialOption.topicId}
                  onClick={() => onStartTutorial(tutorialOption.topicId)}
                >
                  {tutorialOption.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="account-drawer-section">
          <h3>Session</h3>
          <button className="drawer-logout-button" type="button" onClick={() => onLogout()}>
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
}

export default AccountDrawer;
