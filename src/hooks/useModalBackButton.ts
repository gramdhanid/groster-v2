import { useEffect, useRef } from "react";

interface UseModalBackButtonProps {
  isOpen: boolean;
  onClose: () => void;
}

// Module-level state to track active modals for nested modal support
let modalCount = 0;

/**
 * Hook to handle mobile back button for modals.
 *
 * When a modal opens, pushes a history entry so pressing the device back button
 * will close the modal instead of navigating away.
 *
 * Features:
 * - Pushes history entry when modal opens
 * - Listens for popstate event to close modal via back button
 * - Cleans up history entry when modal closes normally
 * - Supports nested modals via shared modal counting
 * - Prevents duplicate history entries
 *
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Callback to close the modal
 *
 * @example
 * ```tsx
 * useModalBackButton({
 *   isOpen,
 *   onClose: () => setIsOpen(false),
 * });
 * ```
 */
export function useModalBackButton({ isOpen, onClose }: UseModalBackButtonProps) {
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      modalCount += 1;

      if (modalCount === 1) {
        // Push history entry when first modal opens
        window.history.pushState({ modalOpen: true }, "", "");

        const handlePopState = (event: PopStateEvent) => {
          // Only close if this was a modal-related history entry
          if (event.state?.modalOpen || modalCount > 0) {
            isClosingRef.current = true;
            onClose();
            isClosingRef.current = false;
          }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
          window.removeEventListener("popstate", handlePopState);

          modalCount -= 1;

          // If we're not closing via back button, go back to clean up history
          if (modalCount === 0 && !isClosingRef.current) {
            window.history.back();
          }
        };
      }

      return () => {
        modalCount -= 1;
      };
    }
  }, [isOpen, onClose]);
}
