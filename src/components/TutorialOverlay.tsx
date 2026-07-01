import { useEffect, useMemo, useState } from "react";
import type { TutorialEventId, TutorialTargetId, TutorialTopicId } from "../types";

interface TutorialWelcomeDialogProps {
  onStart: () => void;
  onSkip: () => void | Promise<void>;
}

interface TutorialOverlayProps {
  activeFlow: TutorialTopicId;
  completedEvents: Record<TutorialEventId, boolean>;
  hasCallCards: boolean;
  onActiveTargetChange: (targetId: TutorialTargetId | null) => void;
  onComplete: () => void | Promise<void>;
  onSkip: () => void | Promise<void>;
}

interface TutorialStep {
  id: string;
  topic: Exclude<TutorialTopicId, "full">;
  targetId: TutorialTargetId;
  title: string;
  body: string;
  emptyBody?: string;
  requiredEventId?: TutorialEventId;
  actionHint?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "seeding",
    topic: "seeding",
    targetId: "seed-calls",
    title: "Start with sample calls",
    body: "New accounts can seed sample calls from this empty state. Seeding changes your data, so the tutorial explains it without pressing the button for you.",
    emptyBody:
      "This is where new accounts seed sample calls. Use it after the tour when you want demo calls to explore.",
  },
  {
    id: "stats",
    topic: "stats",
    targetId: "stats-cards",
    title: "Read the stats cards",
    body: "These cards summarize the calls currently visible in the selected view: total active or archived calls, direction, and call outcome.",
  },
  {
    id: "layout",
    topic: "layout",
    targetId: "dashboard-layout",
    title: "Understand the layout",
    body: "The fixed header holds session and account controls. The dashboard body starts with summary stats and then the call feed.",
  },
  {
    id: "feed",
    topic: "layout",
    targetId: "call-feed",
    title: "Use the call feed",
    body: "The feed lets you search by phone number, change page size, switch active and archived views, filter calls, and reset sample data.",
  },
  {
    id: "open-call",
    topic: "call-details",
    targetId: "call-card",
    title: "Open call details",
    body: "Click any call card to open the details panel, then the tutorial will continue.",
    emptyBody:
      "Call cards appear here after you have calls. Once sample calls exist, clicking a card opens its details panel.",
    requiredEventId: "call-details-opened",
    actionHint: "Click a call card to continue.",
  },
  {
    id: "call-details",
    topic: "call-details",
    targetId: "call-details",
    title: "Review and update a call",
    body: "The details panel shows direction, route, type, duration, date, and notes. You can add notes, archive, unarchive, or delete, but the tutorial will not force those data-changing actions.",
    emptyBody:
      "After you seed calls and open one, the details panel will show direction, route, type, duration, date, and notes. Notes, archive, and delete are available there, but they change data.",
  },
  {
    id: "open-filters",
    topic: "filters",
    targetId: "filters-button",
    title: "Open filters",
    body: "Click the Filters button to open the filter modal, then the tutorial will continue.",
    requiredEventId: "filters-opened",
    actionHint: "Click Filters to continue.",
  },
  {
    id: "filters",
    topic: "filters",
    targetId: "filter-modal",
    title: "Filter calls precisely",
    body: "Filters are grouped by call type, direction, date range, and duration. Expand a section, choose values, then confirm when you want the feed to update.",
  },
  {
    id: "session-timer",
    topic: "session-timer",
    targetId: "session-timer",
    title: "Watch the session timer",
    body: "The timer shows how long your server session has left. Refreshing it asks the backend to extend a valid cookie session.",
  },
  {
    id: "open-account",
    topic: "account-settings",
    targetId: "account-button",
    title: "Open account settings",
    body: "Click Account to open your user drawer, then the tutorial will continue.",
    requiredEventId: "account-opened",
    actionHint: "Click Account to continue.",
  },
  {
    id: "account-settings",
    topic: "account-settings",
    targetId: "account-drawer",
    title: "Use the account drawer",
    body: "The account drawer shows who is signed in, lets you switch theme, rerun tutorial sections, and log out.",
  },
];

function getStepsForFlow(activeFlow: TutorialTopicId) {
  if (activeFlow === "full") {
    return tutorialSteps;
  }

  return tutorialSteps.filter((step) => step.topic === activeFlow);
}

function TutorialWelcomeDialog({ onStart, onSkip }: TutorialWelcomeDialogProps) {
  return (
    <div className="tutorial-welcome-layer">
      <section
        className="tutorial-welcome-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-welcome-title"
      >
        <p className="tutorial-kicker">First visit</p>
        <h2 id="tutorial-welcome-title">Welcome to your call center dashboard</h2>
        <p>
          A short guided tutorial can show you how to seed sample calls, read the dashboard, open
          call details, filter calls, manage your session, and use the account drawer.
        </p>

        <div className="tutorial-actions">
          <button className="secondary-button" type="button" onClick={onSkip}>
            Not now
          </button>
          <button className="primary-button" type="button" onClick={onStart}>
            Start tutorial
          </button>
        </div>
      </section>
    </div>
  );
}

function TutorialOverlay({
  activeFlow,
  completedEvents,
  hasCallCards,
  onActiveTargetChange,
  onComplete,
  onSkip,
}: TutorialOverlayProps) {
  const steps = useMemo(() => getStepsForFlow(activeFlow), [activeFlow]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isCallClickOptional =
    currentStep?.requiredEventId === "call-details-opened" && !hasCallCards;
  const isWaitingForRequiredClick =
    Boolean(currentStep?.requiredEventId) &&
    !isCallClickOptional &&
    !completedEvents[currentStep.requiredEventId as TutorialEventId];

  useEffect(() => {
    setCurrentStepIndex(0);
  }, [activeFlow]);

  useEffect(() => {
    onActiveTargetChange(currentStep?.targetId ?? null);

    return () => {
      onActiveTargetChange(null);
    };
  }, [currentStep?.targetId, onActiveTargetChange]);

  if (!currentStep) {
    return null;
  }

  const body = !hasCallCards && currentStep.emptyBody ? currentStep.emptyBody : currentStep.body;

  function handlePreviousStep() {
    setCurrentStepIndex((index) => Math.max(index - 1, 0));
  }

  function handleNextStep() {
    if (isLastStep) {
      onComplete();
      return;
    }

    setCurrentStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  return (
    <section
      className="tutorial-panel"
      role="dialog"
      aria-labelledby="tutorial-step-title"
      aria-describedby="tutorial-step-description"
    >
      <div className="tutorial-panel-header">
        <p className="tutorial-kicker">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
        <button
          className="tutorial-close-button"
          type="button"
          aria-label="Skip tutorial"
          onClick={onSkip}
        >
          x
        </button>
      </div>

      <h2 id="tutorial-step-title">{currentStep.title}</h2>
      <p id="tutorial-step-description">{body}</p>

      {isWaitingForRequiredClick && currentStep.actionHint && (
        <p className="tutorial-action-hint" role="status">
          {currentStep.actionHint}
        </p>
      )}

      <div className="tutorial-progress" aria-hidden="true">
        {steps.map((step, index) => {
          return (
            <span
              className={index === currentStepIndex ? "tutorial-dot is-active" : "tutorial-dot"}
              key={step.id}
            />
          );
        })}
      </div>

      <div className="tutorial-actions">
        <button
          className="secondary-button"
          type="button"
          disabled={currentStepIndex === 0}
          onClick={handlePreviousStep}
        >
          Back
        </button>
        <button className="secondary-button" type="button" onClick={onSkip}>
          Skip
        </button>
        <button
          className="primary-button"
          type="button"
          disabled={isWaitingForRequiredClick}
          onClick={handleNextStep}
        >
          {isLastStep ? "Finish" : "Next"}
        </button>
      </div>
    </section>
  );
}

export { TutorialOverlay, TutorialWelcomeDialog };
