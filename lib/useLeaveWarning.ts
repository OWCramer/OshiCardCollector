import { useEffect } from "react";

/**
 * Shows a browser "Leave site?" dialog when the user tries to close the tab
 * or refresh while `isDirty` is true.
 */
export function useLeaveWarning(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
}
