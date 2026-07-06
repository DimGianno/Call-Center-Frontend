import { useCallback, useEffect, useState } from "react";
import {
  addCallNote,
  archiveAllCalls,
  archiveCall,
  deleteCall,
  fetchAllCalls,
  fetchCall,
  resetCalls,
  unarchiveAllCalls,
  unarchiveCall,
} from "../api/callsApi";
import { subscribeToCallChanges } from "../api/callEventsApi";
import type { Call, CallView, OpenConfirmDialog, ShowToast } from "../types";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

type LoadCallsOptions = {
  isRealtimeRefresh?: boolean;
  showLoading?: boolean;
};

function useCalls({
  showToast,
  openConfirmDialog,
}: {
  showToast: ShowToast;
  openConfirmDialog: OpenConfirmDialog;
}) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [callView, setCallView] = useState<CallView>("active");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadCalls = useCallback(
    async ({ isRealtimeRefresh = false, showLoading = true }: LoadCallsOptions = {}) => {
      if (showLoading) {
        setIsLoading(true);
      }

      if (!isRealtimeRefresh) {
        setErrorMessage("");
      }

      try {
        const apiCalls = await fetchAllCalls();
        setCalls(apiCalls);

        if (isRealtimeRefresh) {
          setSelectedCallId((currentSelectedCallId) => {
            if (!currentSelectedCallId) {
              return currentSelectedCallId;
            }

            const selectedCallStillExists = apiCalls.some((call) => {
              return call.id === currentSelectedCallId;
            });

            if (selectedCallStillExists) {
              return currentSelectedCallId;
            }

            showToast("Selected call was removed in another tab.", "error");
            return null;
          });
        }
      } catch (error) {
        if (!isRealtimeRefresh) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [showToast],
  );

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  useEffect(() => {
    return subscribeToCallChanges(() => {
      void loadCalls({
        isRealtimeRefresh: true,
        showLoading: false,
      });
    });
  }, [loadCalls]);

  function updateCallInState(updatedCall: Call) {
    setCalls((currentCalls) => {
      return currentCalls.map((call) => {
        if (call.id === updatedCall.id) {
          return updatedCall;
        }

        return call;
      });
    });
  }

  function handleResetCalls() {
    const isSeedingCalls = calls.length === 0;

    openConfirmDialog({
      title: isSeedingCalls ? "Seed sample calls?" : "Reset calls?",
      message: isSeedingCalls
        ? "This will populate your dashboard with sample call data."
        : "This will delete all calls, restore the sample call data, and close any selected call.",
      confirmLabel: isSeedingCalls ? "Seed calls" : "Reset calls",
      onConfirm: async () => {
        setErrorMessage("");

        try {
          const resetResult = await resetCalls();
          setSelectedCallId(null);
          await loadCalls();
          showToast(
            isSeedingCalls
              ? "Sample calls added successfully."
              : (resetResult?.message ?? "Calls reset successfully."),
          );
        } catch (error) {
          setErrorMessage(getErrorMessage(error));
        }
      },
    });
  }

  async function handleSelectCall(callId: string) {
    setErrorMessage("");

    try {
      const call = await fetchCall(callId);
      updateCallInState(call);
      setSelectedCallId(callId);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function handleArchiveCall(callId: string) {
    setErrorMessage("");
    const previousCalls = calls;
    const previousSelectedCallId = selectedCallId;

    setCalls((currentCalls) => {
      return currentCalls.map((call) => {
        if (call.id === callId) {
          return {
            ...call,
            is_archived: true,
          };
        }

        return call;
      });
    });

    if (selectedCallId === callId) {
      setSelectedCallId(null);
    }

    try {
      const archivedCall = await archiveCall(callId);
      updateCallInState(archivedCall);
      showToast("Call archived successfully.");
    } catch (error) {
      setCalls(previousCalls);
      setSelectedCallId(previousSelectedCallId);
      setErrorMessage(getErrorMessage(error));
      return false;
    }

    return true;
  }

  async function handleAddNote(callId: string, content: string) {
    setErrorMessage("");
    const previousCalls = calls;
    const temporaryNote = {
      id: `temp-${Date.now()}`,
      content,
    };

    setCalls((currentCalls) => {
      return currentCalls.map((call) => {
        if (call.id === callId) {
          return {
            ...call,
            notes: [...(call.notes ?? []), temporaryNote],
          };
        }

        return call;
      });
    });

    try {
      const updatedCall = await addCallNote(callId, content);
      updateCallInState(updatedCall);
      showToast("Note added successfully.");
      return true;
    } catch (error) {
      setCalls(previousCalls);
      setErrorMessage(getErrorMessage(error));
      return false;
    }
  }

  function handleDeleteCall(callId: string) {
    openConfirmDialog({
      title: "Delete this call?",
      message: "This call will be permanently removed from the dashboard.",
      confirmLabel: "Delete call",
      isDanger: true,
      onConfirm: async () => {
        setErrorMessage("");
        const previousCalls = calls;
        const previousSelectedCallId = selectedCallId;

        setCalls((currentCalls) => {
          return currentCalls.filter((call) => call.id !== callId);
        });
        setSelectedCallId(null);

        try {
          await deleteCall(callId);
          showToast("Call deleted successfully.");
        } catch (error) {
          setCalls(previousCalls);
          setSelectedCallId(previousSelectedCallId);
          setErrorMessage(getErrorMessage(error));
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
          setErrorMessage(getErrorMessage(error));
        }
      },
    });
  }

  async function handleUnarchiveCall(callId: string) {
    setErrorMessage("");
    const previousCalls = calls;

    setCalls((currentCalls) => {
      return currentCalls.map((call) => {
        if (call.id === callId) {
          return {
            ...call,
            is_archived: false,
          };
        }

        return call;
      });
    });

    try {
      const unarchivedCall = await unarchiveCall(callId);
      updateCallInState(unarchivedCall);
      showToast("Call unarchived successfully.");
      return true;
    } catch (error) {
      setCalls(previousCalls);
      setErrorMessage(getErrorMessage(error));
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
          setErrorMessage(getErrorMessage(error));
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

  const visibleCalls = calls.filter((call) => {
    if (callView === "active") {
      return !call.is_archived;
    }

    return call.is_archived;
  });

  const selectedCall = calls.find((call) => {
    return call.id === selectedCallId;
  });

  const hasAnyCalls = calls.length > 0;

  return {
    callView,
    errorMessage,
    isLoading,
    hasAnyCalls,
    selectedCall,
    visibleCalls,
    setCallView,
    clearSelectedCall: () => setSelectedCallId(null),
    handleAddNote,
    handleArchiveAll,
    handleArchiveCall,
    handleDeleteCall,
    handleResetCalls,
    handleSelectCall,
    handleUnarchiveAll,
    handleUnarchiveCall,
  };
}

export default useCalls;
