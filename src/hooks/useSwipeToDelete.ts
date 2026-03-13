import { useRef, useState, useEffect, useCallback } from "react";

interface SwipeCallbacks {
  onSwipeLeft: () => void;
  threshold?: number;
}

/**
 * Hook untuk implementasi swipe-to-delete gesture pada product cards
 * Mendukung touch events untuk mobile dan mouse events untuk desktop testing
 *
 * Behavior:
 * - Fast swipe (>1.5 px/ms, min 50px): Deletes immediately
 * - Slow swipe: Must reach threshold (100px) to delete
 * - Slow swipe not reaching threshold: Springs back
 * - Vertical scroll: Tidak diblock, gesture diabaikan
 *
 * Fixes:
 * - Stale state bug: passedThreshold now uses ref instead of stale state
 * - Mouse event leak: mousemove/mouseup attached to document via useEffect
 * - DRY: extracted handleSwipeEnd to avoid duplicated logic
 * - Redundant condition: removed double-check on MIN_FAST_SWIPE_DISTANCE
 * - Scroll block: deteksi arah gesture sebelum intercept touch event
 */
export function useSwipeToDelete(
  callbacks: SwipeCallbacks,
  enabled: boolean = true,
) {
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0); // FIX SCROLL: track Y untuk deteksi arah
  const currentX = useRef(0);
  const startTime = useRef(0);
  const swipeXRef = useRef(0);

  // FIX SCROLL: null = belum tahu, "horizontal" = swipe, "vertical" = scroll
  const gestureDirection = useRef<"horizontal" | "vertical" | null>(null);

  const threshold = callbacks.threshold ?? 100;
  const VELOCITY_THRESHOLD = 1.5;
  const MIN_FAST_SWIPE_DISTANCE = 50;
  const GESTURE_LOCK_DISTANCE = 8; // px sebelum arah dikunci

  const updateSwipeX = useCallback((val: number) => {
    swipeXRef.current = val;
    setSwipeX(val);
  }, []);

  const handleSwipeEnd = useCallback(() => {
    if (!enabled) return;

    // Kalau gesture-nya vertikal, tidak perlu cek apa-apa
    if (gestureDirection.current === "vertical") {
      gestureDirection.current = null;
      setIsDragging(false);
      return;
    }

    const swipeDistance = Math.abs(startX.current - currentX.current);
    const swipeDuration = Date.now() - startTime.current;
    const velocity = swipeDuration > 0 ? swipeDistance / swipeDuration : 0;

    const isFastSwipe =
      velocity > VELOCITY_THRESHOLD && swipeDistance > MIN_FAST_SWIPE_DISTANCE;
    const passedThreshold = Math.abs(swipeXRef.current) > threshold;

    if (isFastSwipe || passedThreshold) {
      callbacks.onSwipeLeft();
    }

    gestureDirection.current = null;
    setIsDragging(false);
    updateSwipeX(0);
  }, [enabled, threshold, callbacks, updateSwipeX]);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!enabled) return;
      currentX.current = clientX;
      const deltaX = currentX.current - startX.current;

      if (deltaX < 0) {
        const resistance = deltaX < -threshold ? 1.5 : 2;
        updateSwipeX(deltaX / resistance);
      } else {
        updateSwipeX(0);
      }
    },
    [enabled, threshold, updateSwipeX],
  );

  // Mouse: attach ke document saat isDragging untuk mencegah event leak
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleSwipeEnd();

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, handleMove, handleSwipeEnd]);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY; // FIX SCROLL
      currentX.current = e.touches[0].clientX;
      startTime.current = Date.now();
      gestureDirection.current = null; // reset setiap touch baru
      setIsDragging(true);
    },
    [enabled],
  );

  /**
   * onTouchMove HARUS di-attach dengan { passive: false } dari component
   * supaya e.preventDefault() bisa berjalan untuk block scroll saat swipe horizontal.
   */
  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;

      const deltaX = e.touches[0].clientX - startX.current;
      const deltaY = e.touches[0].clientY - startY.current;
      const totalDelta = Math.abs(deltaX) + Math.abs(deltaY);

      // Belum cukup gerakan untuk lock arah
      if (gestureDirection.current === null) {
        if (totalDelta < GESTURE_LOCK_DISTANCE) return;

        // Lock arah berdasarkan mana yang lebih dominan
        gestureDirection.current =
          Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
      }

      // Vertikal → biarkan browser handle scroll, jangan intercept
      if (gestureDirection.current === "vertical") return;

      // Horizontal → block scroll, handle swipe
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    },
    [enabled, handleMove],
  );

  const onTouchEnd = useCallback(() => {
    if (!enabled) return;
    handleSwipeEnd();
  }, [enabled, handleSwipeEnd]);

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!enabled) return;
      startX.current = e.clientX;
      currentX.current = e.clientX;
      startTime.current = Date.now();
      setIsDragging(true);
    },
    [enabled],
  );

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
    },
    resetSwipe: () => updateSwipeX(0),
  };
}
