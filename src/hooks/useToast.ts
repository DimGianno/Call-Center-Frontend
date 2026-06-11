import { useEffect, useState } from "react";
import type { ToastMessage, ToastType } from "../types";

function useToast(autoDismissMs = 3500) {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setToast(null);
    }, autoDismissMs);

    return () => clearTimeout(timeoutId);
  }, [autoDismissMs, toast]);

  function showToast(message: string, type: ToastType = "success") {
    setToast({
      id: Date.now(),
      message,
      type,
    });
  }

  function dismissToast() {
    setToast(null);
  }

  return {
    toast,
    showToast,
    dismissToast,
  };
}

export default useToast;
