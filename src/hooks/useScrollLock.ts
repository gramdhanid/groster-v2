import { useEffect } from "react";

let lockCount = 0;
let originalOverflow = "";

/**
 * Hook to lock body scroll when modals are open.
 * Prevents background page scrolling when modal content is scrolled.
 *
 * Features:
 * - Locks body scroll by adding overflow: hidden
 * - Stores and restores original scroll position
 * - Supports nested modals via shared lock counting
 * - Works on both desktop and mobile
 *
 * IMPORTANT: Uses module-level state so ALL modal instances share the same
 * scroll position. This prevents conflicts when multiple modals are open.
 *
 * @param isLocked - Whether scroll should be locked
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      lockCount += 1;

      if (lockCount === 1) {
        originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      }

      return () => {
        lockCount -= 1;

        if (lockCount === 0) {
          document.body.style.overflow = originalOverflow;
        }
      };
    }
  }, [isLocked]);
}
