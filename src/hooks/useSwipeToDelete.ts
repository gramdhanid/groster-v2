import { useRef, useState } from 'react';

interface SwipeCallbacks {
  onSwipeLeft: () => void;
  threshold?: number; // Default: 100px
}

/**
 * Hook untuk implementasi swipe-to-delete gesture pada product cards
 * Mendukung touch events untuk mobile dan mouse events untuk desktop testing
 */
export function useSwipeToDelete(
  callbacks: SwipeCallbacks,
  enabled: boolean = true
) {
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const threshold = callbacks.threshold ?? 100;

  const onTouchStart = (e: TouchEvent) => {
    if (!enabled) return;
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!isDragging || !enabled) return;
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;

    // Only allow left swipe (negative values)
    if (deltaX < 0) {
      // Add resistance for smoother feel
      const resistance = deltaX < -threshold ? 1.5 : 2;
      setSwipeX(deltaX / resistance);
    } else {
      setSwipeX(0);
    }
  };

  const onTouchEnd = () => {
    if (!isDragging || !enabled) return;
    setIsDragging(false);

    if (Math.abs(swipeX) > threshold) {
      callbacks.onSwipeLeft();
    }

    // Reset animation
    setSwipeX(0);
  };

  // Also support mouse events for desktop testing
  const onMouseDown = (e: MouseEvent) => {
    if (!enabled) return;
    startX.current = e.clientX;
    setIsDragging(true);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging || !enabled) return;
    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;

    if (deltaX < 0) {
      const resistance = deltaX < -threshold ? 1.5 : 2;
      setSwipeX(deltaX / resistance);
    } else {
      setSwipeX(0);
    }
  };

  const onMouseUp = () => {
    if (!isDragging || !enabled) return;
    setIsDragging(false);

    if (Math.abs(swipeX) > threshold) {
      callbacks.onSwipeLeft();
    }

    setSwipeX(0);
  };

  return {
    swipeX,
    isDragging,
    touchHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    mouseHandlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
    },
    resetSwipe: () => setSwipeX(0),
  };
}
