"use client";

import { useRef, useCallback } from "react";

/**
 * useSubmitGuard — prevents rapid repeated form submissions.
 * Returns a guard function: call it before your submit logic.
 * If it returns false, the submission should be blocked.
 * Automatically resets after cooldownMs.
 */
export function useSubmitGuard(cooldownMs = 2000) {
  const lastSubmitRef = useRef<number>(0);

  const canSubmit = useCallback((): boolean => {
    const now = Date.now();
    if (now - lastSubmitRef.current < cooldownMs) return false;
    lastSubmitRef.current = now;
    return true;
  }, [cooldownMs]);

  const reset = useCallback(() => {
    lastSubmitRef.current = 0;
  }, []);

  return { canSubmit, reset };
}
