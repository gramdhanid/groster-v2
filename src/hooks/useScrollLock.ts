import { useEffect } from "react";

let lockCount = 0;
let originalOverflow = "";
let originalHtmlOverflow = "";
let originalBodyPosition = "";
let originalBodyRight = "";
let originalScrollY = 0;

/**
 * Hook to lock body scroll when modals are open.
 * Prevents background page scrolling when modal content is scrolled.
 *
 * Features:
 * - Locks body scroll using position: fixed + overflow: hidden
 * - Stores and restores original scroll position
 * - Supports nested modals via shared lock counting
 * - Works on both desktop and mobile (including PWA)
 * - Compensates for layout shift when scrollbar is hidden
 * - Handles both html and body elements for maximum compatibility
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
        // Store original values
        originalOverflow = document.body.style.overflow;
        originalHtmlOverflow = document.documentElement.style.overflow;
        originalBodyPosition = document.body.style.position;
        originalBodyRight = document.body.style.right;
        originalScrollY = window.scrollY;

        // Calculate scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Lock scroll using multiple approaches for maximum compatibility
        document.body.style.position = "fixed";
        document.body.style.top = `-${originalScrollY}px`;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        // Compensate for layout shift when scrollbar is hidden
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // Prevent touch scrolling on mobile devices
        document.body.style.touchAction = "none";
      }

      return () => {
        lockCount -= 1;

        if (lockCount === 0) {
          // Restore original values
          document.body.style.position = originalBodyPosition;
          document.body.style.top = "";
          document.body.style.right = originalBodyRight;
          document.body.style.paddingRight = "";
          document.body.style.overflow = originalOverflow;
          document.documentElement.style.overflow = originalHtmlOverflow;
          document.body.style.touchAction = "";

          // Restore scroll position
          window.scrollTo(0, originalScrollY);
        }
      };
    }
  }, [isLocked]);
}
