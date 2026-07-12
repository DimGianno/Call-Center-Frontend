import { useEffect, useState } from "react";
import { TUTORIAL_VERSION } from "../hooks/useTutorial";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import type {
  AuthSession,
  Theme,
  TutorialState,
  TutorialTargetId,
  TutorialTopicId,
} from "../types";

interface AccountDrawerProps {
  activeTutorialTarget: TutorialTargetId | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void | Promise<void>;
  onStartTutorial: (topicId: TutorialTopicId) => void;
  onToggleTheme: () => void;
  session: AuthSession;
  theme: Theme;
  tutorialState: TutorialState | null;
}

const tutorialOptions: Array<{ description: string; label: string; topicId: TutorialTopicId }> = [
  { description: "Complete every tutorial category.", label: "Full tutorial", topicId: "full" },
  { description: "Add the first sample data set.", label: "Seeding calls", topicId: "seeding" },
  {
    description: "Timer, account, stats, controls, filters, pagination, reset.",
    label: "UI",
    topicId: "ui",
  },
  {
    description: "Dates, routes, types, duration, and list layout.",
    label: "Call feed",
    topicId: "call-feed",
  },
  {
    description: "Open details, notes, archive, delete, and item fields.",
    label: "Call item",
    topicId: "call-item",
  },
];

const tutorialCategoryIds: Array<Exclude<TutorialTopicId, "full">> = [
  "seeding",
  "ui",
  "call-feed",
  "call-item",
];
const legacyCompletedTopicMap: Record<Exclude<TutorialTopicId, "full">, string[]> = {
  "call-feed": ["layout"],
  "call-item": ["call-details"],
  seeding: [],
  ui: ["account-settings", "filters", "session-timer", "stats"],
};

function getTutorialStatus(
  topicId: TutorialTopicId,
  tutorialState: TutorialState | null,
): "completed" | "new" | "not-started" {
  if (topicId === "full") {
    if (tutorialState?.version !== undefined && tutorialState.version !== TUTORIAL_VERSION) {
      return "new";
    }

    if (areAllTutorialCategoriesComplete(tutorialState)) {
      return "completed";
    }

    return isFirstRunTutorialState(tutorialState) ? "new" : "not-started";
  }

  if (tutorialState?.version !== undefined && tutorialState.version !== TUTORIAL_VERSION) {
    return "new";
  }

  if (isTutorialTopicComplete(topicId, tutorialState)) {
    return "completed";
  }

  return isFirstRunTutorialState(tutorialState) ? "new" : "not-started";
}

function isTutorialTopicComplete(
  topicId: Exclude<TutorialTopicId, "full">,
  tutorialState: TutorialState | null,
) {
  if (!tutorialState) {
    return false;
  }

  const completedTopics = tutorialState.completedTopics;
  const legacyTopicIds = legacyCompletedTopicMap[topicId];

  return (
    completedTopics.includes(topicId) ||
    legacyTopicIds.some((legacyTopicId) => completedTopics.includes(legacyTopicId))
  );
}

function areAllTutorialCategoriesComplete(tutorialState: TutorialState | null) {
  return tutorialCategoryIds.every((topicId) => isTutorialTopicComplete(topicId, tutorialState));
}

function getTutorialHeaderStatus(tutorialState: TutorialState | null): "completed" | "new" | null {
  if (tutorialState?.version !== undefined && tutorialState.version !== TUTORIAL_VERSION) {
    return "new";
  }

  if (isFirstRunTutorialState(tutorialState)) {
    return "new";
  }

  if (areAllTutorialCategoriesComplete(tutorialState)) {
    return "completed";
  }

  return null;
}

function isFirstRunTutorialState(tutorialState: TutorialState | null) {
  return (
    tutorialState !== null &&
    !tutorialState.hasSeenWelcome &&
    !tutorialState.completedAt &&
    !tutorialState.skippedAt
  );
}

function getTutorialStatusLabel(status: "completed" | "new" | "not-started") {
  if (status === "completed") {
    return "Completed";
  }

  if (status === "new") {
    return "New";
  }

  return "Not started";
}

function AccountDrawer({
  activeTutorialTarget,
  isOpen,
  onClose,
  onLogout,
  onStartTutorial,
  onToggleTheme,
  session,
  theme,
  tutorialState,
}: AccountDrawerProps) {
  const [isTutorialSectionOpen, setIsTutorialSectionOpen] = useState(false);
  const tutorialHeaderStatus = getTutorialHeaderStatus(tutorialState);
  useBodyScrollLock(isOpen);

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
            data-tutorial-active={
              activeTutorialTarget === "account-close-button" ? "true" : undefined
            }
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
          <h3>
            <button
              className="drawer-section-toggle"
              type="button"
              aria-label={
                tutorialHeaderStatus
                  ? `Tutorials ${getTutorialStatusLabel(tutorialHeaderStatus)}`
                  : "Tutorials"
              }
              aria-expanded={isTutorialSectionOpen}
              aria-controls="drawer-tutorial-list"
              onClick={() => setIsTutorialSectionOpen((isOpen) => !isOpen)}
            >
              <span className="drawer-section-title">
                <span>Tutorials</span>
                {tutorialHeaderStatus && (
                  <span className={`drawer-tutorial-status is-${tutorialHeaderStatus}`}>
                    {getTutorialStatusLabel(tutorialHeaderStatus)}
                  </span>
                )}
              </span>
              <span aria-hidden="true" className="drawer-section-chevron">
                {isTutorialSectionOpen ? "-" : "+"}
              </span>
            </button>
          </h3>
          <div
            id="drawer-tutorial-list"
            className={
              isTutorialSectionOpen
                ? "drawer-tutorial-list is-open"
                : "drawer-tutorial-list is-collapsed"
            }
            hidden={!isTutorialSectionOpen}
          >
            {tutorialOptions.map((tutorialOption) => {
              const status = getTutorialStatus(tutorialOption.topicId, tutorialState);
              const statusLabel = getTutorialStatusLabel(status);

              return (
                <button
                  className="drawer-tutorial-button"
                  type="button"
                  key={tutorialOption.topicId}
                  aria-label={`${tutorialOption.label} ${statusLabel}`}
                  onClick={() => onStartTutorial(tutorialOption.topicId)}
                >
                  <span className="drawer-tutorial-copy">
                    <span>{tutorialOption.label}</span>
                    {tutorialOption.description && <small>{tutorialOption.description}</small>}
                  </span>
                  <span className={`drawer-tutorial-status is-${status}`}>{statusLabel}</span>
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
