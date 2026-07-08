import { useEffect } from "react";
import { wakeBackend } from "../api/healthApi";

let hasStartedBackendWakeup = false;

export function resetBackendWakeupForTests() {
  hasStartedBackendWakeup = false;
}

function useBackendWakeup() {
  useEffect(() => {
    if (hasStartedBackendWakeup) {
      return;
    }

    hasStartedBackendWakeup = true;
    void wakeBackend();
  }, []);
}

export default useBackendWakeup;
