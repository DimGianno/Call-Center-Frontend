import { useEffect } from "react";

let activeScrollLocks = 0;

function useBodyScrollLock(isLocked = true) {
  useEffect(() => {
    if (!isLocked) {
      return undefined;
    }

    activeScrollLocks += 1;
    document.body.classList.add("is-scroll-locked");

    return () => {
      activeScrollLocks = Math.max(0, activeScrollLocks - 1);

      if (activeScrollLocks === 0) {
        document.body.classList.remove("is-scroll-locked");
      }
    };
  }, [isLocked]);
}

export default useBodyScrollLock;
