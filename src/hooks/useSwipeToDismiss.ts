import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSwipeToDismissProps {
  isOpen: boolean;
  onClose: () => void;
  threshold?: number;
  enabled?: boolean;
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

interface SwipeResult {
  handlers: SwipeHandlers;
  /** Handlers for header area - always allows drag regardless of scroll position */
  headerHandlers: SwipeHandlers;
  style: React.CSSProperties;
  contentRef: React.RefObject<HTMLDivElement | null>;
  canPullToDismiss: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * Hook to handle swipe-to-dismiss gesture for bottom sheet modals.
 *
 * Features:
 * - Drag down on mobile to dismiss modal
 * - Visual feedback during drag
 * - Smart detection: body handlers only allow drag when content is at top
 * - Header handlers always allow drag regardless of scroll position
 * - Configurable threshold
 * - Can be disabled via `enabled` prop
 *
 * @param props - Configuration options
 * @returns Handlers (for body), headerHandlers (for header), styles, and refs
 */
export function useSwipeToDismiss({
  isOpen,
  onClose,
  threshold = 150,
  enabled = true,
}: UseSwipeToDismissProps): SwipeResult {
  const [dragStartY, setDragStartY] = useState(0);
  const [currentDragY, setCurrentDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [canPullToDismiss, setCanPullToDismiss] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeAttemptRef = useRef(false);

  // Body handlers - check scroll position before allowing drag
  const handleDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!enabled || !canPullToDismiss) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
    setIsDragging(true);
  }, [enabled, canPullToDismiss]);

  // Header handlers - always allow drag regardless of scroll position
  const handleHeaderDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!enabled) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
    setIsDragging(true);
  }, [enabled]);

  const handleDragMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - dragStartY;

    // Only allow downward drag (deltaY positive)
    if (deltaY > 0) {
      setCurrentDragY(deltaY);
    }
  }, [isDragging, dragStartY]);

  const handleDragEnd = useCallback(() => {
    // If drag exceeds threshold, close modal
    if (currentDragY > threshold) {
      closeAttemptRef.current = true;
      onClose();
      // Check if modal is still open (close was prevented)
      setTimeout(() => {
        if (isOpen) {
          // Close was prevented, reset position
          setCurrentDragY(0);
        }
        closeAttemptRef.current = false;
      }, 100);
    } else {
      // Return to original position
      setCurrentDragY(0);
    }
    setIsDragging(false);
  }, [currentDragY, threshold, onClose, isOpen]);

  // Reset drag state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentDragY(0);
      setIsDragging(false);
      setDragStartY(0);
      setCanPullToDismiss(true);
    }
  }, [isOpen]);

  // Handle scroll for smart pull-to-dismiss behavior
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    // Only allow pull-to-dismiss when at top
    setCanPullToDismiss(scrollTop === 0);
  }, []);

  const style: React.CSSProperties = {
    transform: currentDragY > 0 ? `translateY(${currentDragY}px)` : 'translateY(0)',
    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
  };

  return {
    // Body handlers - only allow drag when at top
    handlers: {
      onTouchStart: handleDragStart as (e: React.TouchEvent) => void,
      onTouchMove: handleDragMove as (e: React.TouchEvent) => void,
      onTouchEnd: handleDragEnd,
      onMouseDown: handleDragStart as (e: React.MouseEvent) => void,
      onMouseMove: handleDragMove as (e: React.MouseEvent) => void,
      onMouseUp: handleDragEnd,
      onMouseLeave: handleDragEnd,
    },
    // Header handlers - always allow drag
    headerHandlers: {
      onTouchStart: handleHeaderDragStart as (e: React.TouchEvent) => void,
      onTouchMove: handleDragMove as (e: React.TouchEvent) => void,
      onTouchEnd: handleDragEnd,
      onMouseDown: handleHeaderDragStart as (e: React.MouseEvent) => void,
      onMouseMove: handleDragMove as (e: React.MouseEvent) => void,
      onMouseUp: handleDragEnd,
      onMouseLeave: handleDragEnd,
    },
    style,
    contentRef,
    canPullToDismiss,
    onScroll: handleScroll,
  };
}
