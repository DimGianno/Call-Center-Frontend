import { useEffect, useMemo, useState, type CSSProperties } from "react";
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
  requiresCallCards?: boolean;
  hintLabel: string;
  hintTone: "click" | "look" | "type";
  actionHint?: string;
}

interface SpotlightGeometry {
  centerX: number;
  centerY: number;
  height: number;
  left: number;
  radiusX: number;
  radiusY: number;
  top: number;
  width: number;
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
    hintLabel: "Look here",
    hintTone: "look",
  },
  {
    id: "ui-layout",
    topic: "ui",
    targetId: "dashboard-layout",
    title: "Understand the layout",
    body: "The fixed header holds session and account controls. The dashboard body starts with summary stats and then the call feed.",
    hintLabel: "Look here",
    hintTone: "look",
  },
  {
    id: "ui-timer",
    topic: "ui",
    targetId: "session-timer",
    title: "Read the session timer",
    body: "The timer shows how long your server session has left. Refreshing it asks the backend to extend a valid cookie session.",
    hintLabel: "Look here",
    hintTone: "look",
  },
  {
    id: "ui-account",
    topic: "ui",
    targetId: "account-button",
    title: "Open account settings",
    body: "Click Account to open the user drawer. The tutorial will continue after you do.",
    requiredEventId: "account-opened",
    hintLabel: "Click here",
    hintTone: "click",
    actionHint: "Click Account to continue.",
  },
  {
    id: "ui-account-drawer",
    topic: "ui",
    targetId: "account-drawer",
    title: "Use the account drawer",
    body: "The drawer shows who is signed in, lets you switch theme, rerun tutorial sections, and log out.",
    hintLabel: "Look here",
    hintTone: "look",
  },
  {
    id: "ui-close-account-drawer",
    topic: "ui",
    targetId: "account-drawer",
    title: "Close account settings",
    body: "Close the account drawer before continuing so the dashboard controls are visible again.",
    requiredEventId: "account-closed",
    hintLabel: "Close drawer",
    hintTone: "click",
    actionHint: "Close account drawer to continue.",
  },
  {
    id: "ui-stats",
    topic: "ui",
    targetId: "stats-cards",
    title: "Read the stats cards",
    body: "These cards summarize the current view: total calls, inbound and outbound direction, and call outcomes.",
    hintLabel: "Look here",
    hintTone: "look",
  },
  {
    id: "ui-search",
    topic: "ui",
    targetId: "search-control",
    title: "Search calls",
    body: "Type part of a phone number into the search field to narrow the feed.",
    requiredEventId: "search-typed",
    hintLabel: "Type here",
    hintTone: "type",
    actionHint: "Type into the phone number search field to continue.",
  },
  {
    id: "ui-page-size",
    topic: "ui",
    targetId: "page-size-control",
    title: "Change page size",
    body: "Click a page-size option to change how many calls appear per page.",
    requiredEventId: "page-size-changed",
    hintLabel: "Click here",
    hintTone: "click",
    actionHint: "Click 5, 10, 25, or 50 to continue.",
  },
  {
    id: "ui-view-toggle",
    topic: "ui",
    targetId: "view-toggle-button",
    title: "Switch active and archived calls",
    body: "Click the view button to switch between active calls and archived calls.",
    requiredEventId: "archived-view-opened",
    hintLabel: "Click here",
    hintTone: "click",
    actionHint: "Click View Archived or View Active to continue.",
  },
  {
    id: "ui-filters-button",
    topic: "ui",
    targetId: "filters-button",
    title: "Open filters",
    body: "Click Filters to open the filter modal.",
    requiredEventId: "filters-opened",
    hintLabel: "Click here",
    hintTone: "click",
    actionHint: "Click Filters to continue.",
  },
  {
    id: "ui-filters-modal",
    topic: "ui",
    targetId: "filter-modal",
    title: "Filter calls",
    body: "Filters are grouped by call type, direction, date range, and duration. Close or cancel the modal when you are ready to continue.",
    hintLabel: "Look here",
    hintTone: "look",
  },
  {
    id: "ui-bulk-actions",
    topic: "ui",
    targetId: "bulk-action-button",
    title: "Bulk actions",
    body: "Archive all and unarchive all affect every call in the current view. They ask for confirmation before changing data.",
    hintLabel: "Look here",
    hintTone: "look",
  },
  {
    id: "ui-pagination",
    topic: "ui",
    targetId: "pagination-controls",
    title: "Use pagination",
    body: "Pagination controls appear when the current result set spans more than one page.",
    hintLabel: "Look here",
    hintTone: "look",
  },
  {
    id: "ui-reset",
    topic: "ui",
    targetId: "reset-data-button",
    title: "Reset sample data",
    body: "Reset Data restores sample calls. Because it changes data, the tutorial explains it without requiring a click.",
    hintLabel: "Look here",
    hintTone: "look",
  },
  {
    id: "call-feed",
    topic: "call-feed",
    targetId: "call-feed",
    title: "Read the call feed",
    body: "The feed groups calls by date. Each group contains call cards with direction, type, route, time, duration, and an archive action.",
    hintLabel: "Look here",
    hintTone: "look",
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
    hintLabel: "Click here",
    hintTone: "click",
    actionHint: "Click a call card to continue.",
  },
  {
    id: "call-details",
    topic: "call-item",
    targetId: "call-details",
    title: "Review and update a call",
    body: "The details panel shows direction, route, type, duration, date, and notes. You can add notes, archive, unarchive, or delete, but the tutorial will not force those data-changing actions.",
    emptyBody:
      "After you seed calls and open one, the details panel will show direction, route, type, duration, date, and notes. Notes, archive, and delete are available there, but they change data.",
    requiresCallCards: true,
    hintLabel: "Look here",
    hintTone: "look",
  },
  {
    id: "call-note",
    topic: "call-item",
    targetId: "note-field",
    title: "Practice typing a note",
    body: "Type a short note in the note field. You do not need to submit it for this tutorial step.",
    emptyBody:
      "After you seed calls and open one, you can type notes in the details panel without submitting until you are ready.",
    requiredEventId: "note-typed",
    requiresCallCards: true,
    hintLabel: "Type here",
    hintTone: "type",
    actionHint: "Type a short note to continue.",
  },
];

function getStepsForFlow(activeFlow: TutorialTopicId) {
  if (activeFlow === "full") {
    return tutorialSteps;
  }

  return tutorialSteps.filter((step) => step.topic === activeFlow);
}

function getSpotlightGeometry(element: HTMLElement): SpotlightGeometry {
  const targetPadding = 18;
  const rect = element.getBoundingClientRect();
  const left = Math.max(rect.left - targetPadding, 10);
  const top = Math.max(rect.top - targetPadding, 10);
  const width = Math.min(rect.width + targetPadding * 2, window.innerWidth - left - 10);
  const height = Math.min(rect.height + targetPadding * 2, window.innerHeight - top - 10);

  return {
    centerX: left + width / 2,
    centerY: top + height / 2,
    height,
    left,
    radiusX: Math.max(width / 2, 42),
    radiusY: Math.max(height / 2, 42),
    top,
    width,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTutorialPanelStyle(spotlightGeometry: SpotlightGeometry | null): CSSProperties {
  if (!spotlightGeometry) {
    return {};
  }

  const margin = 18;
  const gap = 24;
  const panelWidth = Math.min(430, window.innerWidth - margin * 2);
  const estimatedPanelHeight = 300;
  const maxLeft = window.innerWidth - panelWidth - margin;
  const maxTop = window.innerHeight - estimatedPanelHeight - margin;
  const centeredTop = clamp(
    spotlightGeometry.centerY - estimatedPanelHeight / 2,
    margin,
    Math.max(margin, maxTop),
  );

  if (window.innerWidth - (spotlightGeometry.left + spotlightGeometry.width) >= panelWidth + gap) {
    return {
      left: spotlightGeometry.left + spotlightGeometry.width + gap,
      top: centeredTop,
      width: panelWidth,
    };
  }

  if (spotlightGeometry.left >= panelWidth + gap) {
    return {
      left: spotlightGeometry.left - panelWidth - gap,
      top: centeredTop,
      width: panelWidth,
    };
  }

  const centeredLeft = clamp(
    spotlightGeometry.centerX - panelWidth / 2,
    margin,
    Math.max(margin, maxLeft),
  );

  if (
    window.innerHeight - (spotlightGeometry.top + spotlightGeometry.height) >=
    estimatedPanelHeight + gap
  ) {
    return {
      left: centeredLeft,
      top: spotlightGeometry.top + spotlightGeometry.height + gap,
      width: panelWidth,
    };
  }

  return {
    left: centeredLeft,
    top: Math.max(margin, spotlightGeometry.top - estimatedPanelHeight - gap),
    width: panelWidth,
  };
}

function getSpotlightHintStyle(spotlightGeometry: SpotlightGeometry): CSSProperties {
  const hintWidth = 116;

  return {
    left: clamp(spotlightGeometry.centerX - hintWidth / 2, 16, window.innerWidth - hintWidth - 16),
    top: Math.max(12, spotlightGeometry.top - 44),
  };
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
  const [spotlightGeometry, setSpotlightGeometry] = useState<SpotlightGeometry | null>(null);
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
    onActiveTargetChange(currentStep?.targetId ?? null);

    return () => {
      onActiveTargetChange(null);
    };
  }, [currentStep?.targetId, onActiveTargetChange]);

  useEffect(() => {
    if (!currentStep) {
      setSpotlightGeometry(null);
      return undefined;
    }

    let animationFrameId = 0;

    function updateSpotlightGeometry() {
      animationFrameId = window.requestAnimationFrame(() => {
        const activeElement = document.querySelector<HTMLElement>('[data-tutorial-active="true"]');

        setSpotlightGeometry(activeElement ? getSpotlightGeometry(activeElement) : null);
      });
    }

    const measureTimer = window.setTimeout(updateSpotlightGeometry, 0);

    window.addEventListener("resize", updateSpotlightGeometry);
    window.addEventListener("scroll", updateSpotlightGeometry, true);

    return () => {
      window.clearTimeout(measureTimer);
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updateSpotlightGeometry);
      window.removeEventListener("scroll", updateSpotlightGeometry, true);
    };
  }, [currentStep]);

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
    <>
      {spotlightGeometry && (
        <div className="tutorial-spotlight-layer" aria-hidden="true">
          <svg className="tutorial-spotlight-svg">
            <defs>
              <mask id="tutorial-spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <ellipse
                  cx={spotlightGeometry.centerX}
                  cy={spotlightGeometry.centerY}
                  rx={spotlightGeometry.radiusX}
                  ry={spotlightGeometry.radiusY}
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(15, 23, 42, 0.62)"
              mask="url(#tutorial-spotlight-mask)"
            />
            <ellipse
              className={`tutorial-spotlight-ring is-${currentStep.hintTone}`}
              cx={spotlightGeometry.centerX}
              cy={spotlightGeometry.centerY}
              rx={spotlightGeometry.radiusX}
              ry={spotlightGeometry.radiusY}
            />
          </svg>
          <div
            className={`tutorial-spotlight-hint is-${currentStep.hintTone}`}
            style={getSpotlightHintStyle(spotlightGeometry)}
          >
            {currentStep.hintLabel}
          </div>
        </div>
      )}

      <section
        className="tutorial-panel"
        role="dialog"
        aria-labelledby="tutorial-step-title"
        aria-describedby="tutorial-step-description"
        style={{
          ...getTutorialPanelStyle(spotlightGeometry),
          bottom: spotlightGeometry ? "auto" : undefined,
          right: spotlightGeometry ? "auto" : undefined,
        }}
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
    </>
  );
}

export { TutorialOverlay, TutorialWelcomeDialog };
