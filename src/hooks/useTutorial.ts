import { useCallback, useEffect, useState } from "react";
import { fetchTutorialState, updateTutorialState } from "../api/tutorialApi";
import type { ShowToast, TutorialEventId, TutorialState, TutorialTopicId } from "../types";

export const TUTORIAL_VERSION = 2;

type TutorialFlowId = TutorialTopicId;
type TutorialEventState = Record<TutorialEventId, boolean>;

const emptyTutorialEvents: TutorialEventState = {
  "account-closed": false,
  "account-opened": false,
  "archived-view-opened": false,
  "call-details-opened": false,
  "filters-closed": false,
  "filters-opened": false,
  "note-typed": false,
  "page-size-changed": false,
  "search-typed": false,
};

function shouldShowFirstRunWelcome(tutorialState: TutorialState) {
  return !tutorialState.hasSeenWelcome && !tutorialState.completedAt && !tutorialState.skippedAt;
}

function shouldShowReleaseNotice(tutorialState: TutorialState) {
  return (
    !shouldShowFirstRunWelcome(tutorialState) &&
    tutorialState.version < TUTORIAL_VERSION &&
    tutorialState.newTopics.length > 0
  );
}

function getCompletedTopics(flowId: TutorialFlowId) {
  if (flowId === "full") {
    return ["seeding", "ui", "call-feed", "call-item"];
  }

  return [flowId];
}

function getUniqueTopics(currentTopics: string[], nextTopics: string[]) {
  return Array.from(new Set([...currentTopics, ...nextTopics]));
}

function getNowIsoString() {
  return new Date().toISOString();
}

function getSaveErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Tutorial progress could not be saved.";
}

function useTutorial({ showToast }: { showToast: ShowToast }) {
  const [tutorialState, setTutorialState] = useState<TutorialState | null>(null);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isReleaseNoticeOpen, setIsReleaseNoticeOpen] = useState(false);
  const [activeFlow, setActiveFlow] = useState<TutorialFlowId | null>(null);
  const [completedEvents, setCompletedEvents] = useState<TutorialEventState>(emptyTutorialEvents);

  useEffect(() => {
    let isMounted = true;

    async function loadTutorialState() {
      try {
        const nextTutorialState = await fetchTutorialState();

        if (!isMounted) {
          return;
        }

        setTutorialState(nextTutorialState);

        if (shouldShowFirstRunWelcome(nextTutorialState)) {
          setIsWelcomeOpen(true);
        } else if (shouldShowReleaseNotice(nextTutorialState)) {
          setIsReleaseNoticeOpen(true);
        }
      } catch {
        // Tutorial preferences should never block the dashboard itself.
      }
    }

    loadTutorialState();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveTutorialState = useCallback(
    async (update: Partial<TutorialState>) => {
      try {
        const nextTutorialState = await updateTutorialState(update);
        setTutorialState(nextTutorialState);
      } catch (error) {
        showToast(getSaveErrorMessage(error), "error");
      }
    },
    [showToast],
  );

  const startTutorial = useCallback((flowId: TutorialFlowId = "full") => {
    setIsWelcomeOpen(false);
    setIsReleaseNoticeOpen(false);
    setActiveFlow(flowId);
    setCompletedEvents(emptyTutorialEvents);
  }, []);

  const closeTutorial = useCallback(() => {
    setIsWelcomeOpen(false);
    setIsReleaseNoticeOpen(false);
    setActiveFlow(null);
    setCompletedEvents(emptyTutorialEvents);
  }, []);

  const skipTutorial = useCallback(async () => {
    closeTutorial();

    await saveTutorialState({
      version: TUTORIAL_VERSION,
      hasSeenWelcome: true,
      skippedAt: getNowIsoString(),
    });
  }, [closeTutorial, saveTutorialState]);

  const completeTutorial = useCallback(async () => {
    if (!activeFlow) {
      closeTutorial();
      return;
    }

    const nextCompletedTopics = getUniqueTopics(
      tutorialState?.completedTopics ?? [],
      getCompletedTopics(activeFlow),
    );
    const nextNewTopics =
      activeFlow === "full"
        ? []
        : (tutorialState?.newTopics ?? []).filter((topic) => topic !== activeFlow);

    closeTutorial();

    await saveTutorialState({
      version: TUTORIAL_VERSION,
      hasSeenWelcome: true,
      completedAt: activeFlow === "full" ? getNowIsoString() : (tutorialState?.completedAt ?? null),
      skippedAt: tutorialState?.skippedAt ?? null,
      completedTopics: nextCompletedTopics,
      newTopics: nextNewTopics,
    });
  }, [activeFlow, closeTutorial, saveTutorialState, tutorialState]);

  const dismissReleaseNotice = useCallback(async () => {
    setIsReleaseNoticeOpen(false);
    await saveTutorialState({ version: TUTORIAL_VERSION });
  }, [saveTutorialState]);

  const startReleaseTutorial = useCallback(() => {
    startTutorial("call-item");
    void saveTutorialState({ version: TUTORIAL_VERSION });
  }, [saveTutorialState, startTutorial]);

  const recordTutorialEvent = useCallback((eventId: TutorialEventId) => {
    setCompletedEvents((currentEvents) => {
      if (currentEvents[eventId]) {
        return currentEvents;
      }

      return {
        ...currentEvents,
        [eventId]: true,
      };
    });
  }, []);

  return {
    activeFlow,
    completedEvents,
    isTutorialActive: activeFlow !== null,
    isReleaseNoticeOpen,
    isWelcomeOpen,
    tutorialState,
    closeTutorial,
    completeTutorial,
    dismissReleaseNotice,
    recordTutorialEvent,
    skipTutorial,
    startReleaseTutorial,
    startTutorial,
  };
}

export default useTutorial;
