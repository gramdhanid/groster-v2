import { useRef, useState, useCallback, useEffect } from 'react';

interface SwipeCallbacks {
  onSwipeLeft: () => void;   // Called when swiping left (next tab)
  onSwipeRight: () => void;  // Called when swiping right (previous tab)
  threshold?: number;        // Default: 80px
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

interface SwipeResult {
  touchHandlers: SwipeHandlers;
  mouseHandlers: SwipeHandlers;
  swipeX: number;      // Current swipe offset for visual feedback (px)
  isDragging: boolean; // Is user currently dragging
}

/**
 * Hook untuk implementasi horizontal swipe gesture (kiri/kanan)
 * Mendukung touch events untuk mobile dan mouse events untuk desktop testing
 *
 * Digunakan untuk navigasi antar tab dengan gesture swipe:
 * - Swipe right (→): Navigate to next/previous depending on context
 * - Swipe left (←): Navigate to previous/next depending on context
 *
 * Elements with data-no-swipe attribute will not trigger swipe gestures.
 */
export function useHorizontalSwipe(callbacks: SwipeCallbacks): SwipeResult {
  const startX = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const threshold = callbacks.threshold ?? 80;

  // Check if target or its parents have data-no-swipe attribute
  const shouldIgnoreSwipe = useCallback((target: EventTarget | null): boolean => {
    if (!target) return false;
    const element = target as HTMLElement;
    return (
      element.closest?.('[data-no-swipe]') !== null ||
      element.tagName === 'INPUT' ||
      element.tagName === 'TEXTAREA' ||
      element.tagName === 'SELECT'
    );
  }, []);

  const handleStart = useCallback((clientX: number, target: EventTarget | null) => {
    if (shouldIgnoreSwipe(target)) return;
    startX.current = clientX;
    setIsDragging(true);
    setSwipeX(0);
  }, [shouldIgnoreSwipe]);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return;

    const deltaX = clientX - startX.current;

    // Apply resistance for smoother feel - max drag is threshold * 1.5
    const maxDrag = threshold * 1.5;
    let adjustedDelta = deltaX;

    // Apply resistance when dragging beyond maxDrag
    if (Math.abs(deltaX) > maxDrag) {
      const sign = Math.sign(deltaX);
      const excess = Math.abs(deltaX) - maxDrag;
      adjustedDelta = sign * (maxDrag + excess * 0.3); // 30% resistance beyond limit
    }

    setSwipeX(adjustedDelta);
  }, [isDragging, threshold]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // Check if swipe exceeded threshold
    if (swipeX > threshold) {
      callbacks.onSwipeRight();
    } else if (swipeX < -threshold) {
      callbacks.onSwipeLeft();
    }

    // Animate back to 0
    setSwipeX(0);
  }, [isDragging, swipeX, threshold, callbacks]);

  // Touch event handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX, e.target);
  }, [handleStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  const onTouchEnd = useCallback((_e: React.TouchEvent) => {
    handleEnd();
  }, [handleEnd]);

  // Mouse event handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    handleStart(e.clientX, e.target);
  }, [handleStart]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const onMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const onMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsDragging(false);
    };
  }, []);

  return {
    touchHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
    },
    mouseHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
    },
    swipeX,
    isDragging,
  };
}
