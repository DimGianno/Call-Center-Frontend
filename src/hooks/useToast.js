import { useEffect, useState } from "react";

function useToast(autoDismissMs = 3500) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setToast(null);
    }, autoDismissMs);

    return () => clearTimeout(timeoutId);
  }, [autoDismissMs, toast]);

  function showToast(message, type = "success") {
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
