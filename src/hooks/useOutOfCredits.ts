import { useState } from 'react';

/**
 * Manages the out-of-credits inline state for AI action components.
 * Catches HTTP 429 (QuotaExceededError) from the backend credits middleware.
 *
 * Usage:
 *   const { outOfCredits, check402 } = useOutOfCredits();
 *   // in catch block:
 *   if (check402(error)) return;
 */
export function useOutOfCredits() {
  const [outOfCredits, setOutOfCredits] = useState(false);

  function check402(error: any): boolean {
    const status = error?.response?.status;
    if (status === 429 || status === 402) {
      setOutOfCredits(true);
      return true;
    }
    return false;
  }

  return { outOfCredits, check402 };
}
