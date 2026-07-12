import { useEffect, useMemo, useState } from "react";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import type { TutorialEventId, TutorialTargetId, TutorialTopicId } from "../types";

interface TutorialWelcomeDialogProps {
  onStart: () => void;
  onSkip: () => void | Promise<void>;
}

interface TutorialOverlayProps {
  activeFlow: TutorialTopicId;
  completedEvents: Record<TutorialEventId, boolean>;
  hasAnyCalls: boolean;
  hasCallCards: boolean;
  onActiveTargetChange: (targetId: TutorialTargetId | null) => void;
  onComplete: () => void | Promise<void>;
  onSkip: () => void | Promise<void>;
}

interface TutorialStep {
  id: string;
  topic: Exclude<TutorialTopicId, "full">;
  targetId?: TutorialTargetId;
  title: string;
  body: string;
  emptyBody?: string;
  requiredEventId?: TutorialEventId;
  requiresCallCards?: boolean;
  actionHint?: string;
}

const AUTO_ADVANCE_DELAY_MS = 180;

const tutorialSteps: TutorialStep[] = [
  {
    id: "seeding",
    topic: "seeding",
    targetId: "seed-calls",
    title: "Seed sample calls",
    body: "This control restores sample call data. It changes your calls, so this tutorial points it out without requiring you to click it.",
    emptyBody:
      "New accounts start here. Select Seed sample calls and confirm when you want demo calls to explore.",
  },
  {
    id: "ui-layout",
    topic: "ui",
    title: "Understand the layout",
    body: "The fixed header holds session and account controls. The dashboard body starts with summary stats and then the call feed.",
  },
  {
    id: "ui-timer",
    topic: "ui",
    targetId: "session-timer",
    title: "Read the session timer",
    body: "The timer shows how long your server session has left. Refreshing it asks the backend to extend a valid cookie session.",
  },
  {
    id: "ui-account",
    topic: "ui",
    targetId: "account-button",
    title: "Open account settings",
    body: "Click Account to open the user drawer. The tutorial will continue after you do.",
    requiredEventId: "account-opened",
    actionHint: "Click Account to continue.",
  },
  {
    id: "ui-account-drawer",
    topic: "ui",
    targetId: "account-drawer",
    title: "Use the account drawer",
    body: "The drawer shows who is signed in, lets you switch theme, rerun tutorial sections, and log out.",
  },
  {
    id: "ui-close-account-drawer",
    topic: "ui",
    targetId: "account-close-button",
    title: "Close account settings",
    body: "Close the account drawer before continuing so the dashboard controls are visible again.",
    requiredEventId: "account-closed",
    actionHint: "Close account drawer to continue.",
  },
  {
    id: "ui-stats",
    topic: "ui",
    targetId: "stats-cards",
    title: "Read the stats cards",
    body: "These cards summarize the current view: total calls, inbound and outbound direction, and call outcomes.",
  },
  {
    id: "ui-search",
    topic: "ui",
    targetId: "search-control",
    title: "Search calls",
    body: "Use this field when you want to narrow the feed by phone number. The tutorial only points it out, so your current results stay unchanged.",
  },
  {
    id: "ui-page-size",
    topic: "ui",
    targetId: "page-size-control",
    title: "Change page size",
    body: "These controls change how many calls appear per page. They are useful when the feed becomes long.",
  },
  {
    id: "ui-view-toggle",
    topic: "ui",
    targetId: "view-toggle-button",
    title: "Switch active and archived calls",
    body: "This button switches between active calls and archived calls. The tutorial does not switch views for you.",
  },
  {
    id: "ui-filters-button",
    topic: "ui",
    targetId: "filters-button",
    title: "Open filters",
    body: "Click Filters to open the filter modal.",
    requiredEventId: "filters-opened",
    actionHint: "Click Filters to continue.",
  },
  {
    id: "ui-filters-modal",
    topic: "ui",
    targetId: "filter-modal",
    title: "Filter calls",
    body: "Filters are grouped by call type, direction, date range, and duration. Each group unfolds when you select its header.",
  },
  {
    id: "ui-close-filters-modal",
    topic: "ui",
    targetId: "filter-close-button",
    title: "Close filters",
    body: "Close the filter modal before continuing so the rest of the dashboard controls are visible again.",
    requiredEventId: "filters-closed",
    actionHint: "Close the filter modal to continue.",
  },
  {
    id: "ui-bulk-actions",
    topic: "ui",
    targetId: "bulk-action-button",
    title: "Bulk actions",
    body: "Archive all and unarchive all affect every call in the current view. They ask for confirmation before changing data.",
  },
  {
    id: "ui-pagination",
    topic: "ui",
    targetId: "pagination-controls",
    title: "Use pagination",
    body: "Pagination controls appear when the current result set spans more than one page.",
  },
  {
    id: "ui-reset",
    topic: "ui",
    targetId: "reset-data-button",
    title: "Reset sample data",
    body: "Reset Data restores sample calls. Because it changes data, the tutorial explains it without requiring a click.",
  },
  {
    id: "call-feed",
    topic: "call-feed",
    targetId: "call-date-groups",
    title: "Read the call feed",
    body: "The feed groups calls by date. Each group contains call cards with direction, type, route, time, duration, and an archive action.",
  },
  {
    id: "open-call",
    topic: "call-item",
    targetId: "call-card",
    title: "Open call details",
    body: "Click any call card to open the details panel, then the tutorial will continue.",
    emptyBody:
      "Call cards appear here after you have calls. Once sample calls exist, clicking a card opens its details panel.",
    requiredEventId: "call-details-opened",
    requiresCallCards: true,
    actionHint: "Click a call card to continue.",
  },
  {
    id: "call-details",
    topic: "call-item",
    targetId: "call-details-summary",
    title: "Review a call",
    body: "This section shows the call direction, route, type, duration, date, and existing notes.",
    emptyBody:
      "After you seed calls and open one, the details panel will show direction, route, type, duration, date, and notes.",
    requiresCallCards: true,
  },
  {
    id: "call-update-actions",
    topic: "call-item",
    targetId: "call-update-actions",
    title: "Update a call",
    body: "The bottom section lets you add a note, archive or unarchive the call, and delete it. These actions change data, so the tutorial only presents them.",
    emptyBody:
      "After you seed calls and open one, the bottom section lets you add notes, archive, unarchive, or delete.",
    requiresCallCards: true,
  },
];

function getStepsForFlow(activeFlow: TutorialTopicId, hasAnyCalls: boolean) {
  const steps =
    activeFlow === "full"
      ? tutorialSteps
      : tutorialSteps.filter((step) => step.topic === activeFlow);

  return steps.filter((step) => !(step.id === "seeding" && hasAnyCalls));
}

function TutorialWelcomeDialog({ onStart, onSkip }: TutorialWelcomeDialogProps) {
  useBodyScrollLock();

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
  hasAnyCalls,
  hasCallCards,
  onActiveTargetChange,
  onComplete,
  onSkip,
}: TutorialOverlayProps) {
  const steps = useMemo(() => getStepsForFlow(activeFlow, hasAnyCalls), [activeFlow, hasAnyCalls]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isActionOptional = Boolean(currentStep?.requiresCallCards) && !hasCallCards;
  const isWaitingForRequiredClick =
    Boolean(currentStep?.requiredEventId) &&
    !isActionOptional &&
    !completedEvents[currentStep.requiredEventId as TutorialEventId];

  useEffect(() => {
    setCurrentStepIndex(0);
  }, [activeFlow]);

  useEffect(() => {
    if (steps.length === 0) {
      onComplete();
    }
  }, [onComplete, steps.length]);

  useEffect(() => {
    onActiveTargetChange(currentStep?.targetId ?? null);

    return () => {
      onActiveTargetChange(null);
    };
  }, [currentStep?.targetId, onActiveTargetChange]);

  useEffect(() => {
    if (
      !currentStep?.requiredEventId ||
      isActionOptional ||
      !completedEvents[currentStep.requiredEventId]
    ) {
      return undefined;
    }

    const advanceTimer = window.setTimeout(() => {
      if (isLastStep) {
        onComplete();
        return;
      }

      setCurrentStepIndex((index) => Math.min(index + 1, steps.length - 1));
    }, AUTO_ADVANCE_DELAY_MS);

    return () => window.clearTimeout(advanceTimer);
  }, [completedEvents, currentStep, isActionOptional, isLastStep, onComplete, steps.length]);

  if (!currentStep) {
    return null;
  }

  const body = !hasCallCards && currentStep.emptyBody ? currentStep.emptyBody : currentStep.body;
  const shouldDockPanelLeft =
    currentStep.targetId === "account-button" ||
    currentStep.targetId === "account-drawer" ||
    currentStep.targetId === "account-close-button";
  const shouldDockPanelTop = currentStep.targetId === "reset-data-button";
  const panelClassName = [
    "tutorial-panel",
    shouldDockPanelLeft ? "is-docked-left" : "",
    shouldDockPanelTop ? "is-docked-top" : "",
  ]
    .filter(Boolean)
    .join(" ");

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
      className={panelClassName}
      role="dialog"
      aria-labelledby="tutorial-step-title"
      aria-describedby="tutorial-step-description"
    >
      <div className="tutorial-panel-header">
        <p className="tutorial-kicker">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
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
