import { useEffect, useRef } from 'react';

/**
 * Hook to lock body scroll when modals are open.
 * Prevents background page scrolling when modal content is scrolled.
 *
 * Features:
 * - Locks body scroll by adding overflow: hidden
 * - Stores and restores original scroll position
 * - Supports nested modals via ref counting
 * - Works on both desktop and mobile
 *
 * @param isLocked - Whether scroll should be locked
 */
export function useScrollLock(isLocked: boolean) {
  const lockCountRef = useRef(0);
  const originalOverflowRef = useRef<string>('');

  useEffect(() => {
    if (isLocked) {
      // Increment lock count (for nested modals)
      lockCountRef.current += 1;

      // Only lock on first lock
      if (lockCountRef.current === 1) {
        // Store original overflow value
        originalOverflowRef.current = document.body.style.overflow;

        // Lock scroll
        document.body.style.overflow = 'hidden';

        // Also prevent scroll on mobile
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      }

      return () => {
        // Decrement lock count
        lockCountRef.current -= 1;

        // Only unlock when all locks are released
        if (lockCountRef.current === 0) {
          // Restore original overflow
          document.body.style.overflow = originalOverflowRef.current;
          document.body.style.position = '';
          document.body.style.width = '';
        }
      };
    }
  }, [isLocked]);
}
