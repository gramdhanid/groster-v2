import { useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useSwipeToDelete } from "@/hooks/useSwipeToDelete.ts";

interface SwipeableProductCardProps {
  children: React.ReactNode;
  onDelete: () => void;
  enabled?: boolean;
}

export default function SwipeableProductCard({
  children,
  onDelete,
  enabled = true,
}: SwipeableProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const TRIGGER_THRESHOLD = -140;

  const { swipeX, isDragging, touchHandlers, mouseHandlers } = useSwipeToDelete(
    {
      onSwipeLeft: onDelete,
      threshold: Math.abs(TRIGGER_THRESHOLD),
    },
    enabled,
  );

  // Touch events untuk mobile
  // KRITIS: touchmove harus { passive: false } supaya e.preventDefault()
  // bisa berjalan — tanpa ini scroll tidak bisa diblock saat swipe horizontal
  useEffect(() => {
    const card = cardRef.current;
    if (!card || !enabled) return;

    card.addEventListener("touchstart", touchHandlers.onTouchStart, {
      passive: true, // touchstart tidak perlu preventDefault
    });
    card.addEventListener("touchmove", touchHandlers.onTouchMove, {
      passive: false, // HARUS false agar preventDefault() bisa berjalan
    });
    card.addEventListener("touchend", touchHandlers.onTouchEnd, {
      passive: true,
    });

    return () => {
      card.removeEventListener("touchstart", touchHandlers.onTouchStart);
      card.removeEventListener("touchmove", touchHandlers.onTouchMove);
      card.removeEventListener("touchend", touchHandlers.onTouchEnd);
    };
  }, [touchHandlers, enabled]);

  // Mouse: onMouseMove dan onMouseUp sudah dihandle di dalam hook via useEffect + document
  // Component hanya perlu expose onMouseDown
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enabled) return;
    if ((e.target as HTMLElement).closest("button, a, input, .no-swipe")) {
      return;
    }
    mouseHandlers.onMouseDown(e.nativeEvent);
  };

  const isNearThreshold = swipeX < TRIGGER_THRESHOLD + 40;

  return (
    <div className="relative overflow-hidden rounded-xl group bg-slate-900">
      {/* Background delete indicator */}
      {swipeX < 0 && (
        <div
          className={`absolute inset-y-0 right-0 flex items-center justify-end pr-8 select-none transition-colors duration-300 pointer-events-none ${
            isNearThreshold ? "bg-red-600" : "bg-red-500"
          }`}
          style={{ width: `${Math.abs(swipeX) + 10}px` }}
        >
          <div
            className={`transition-transform duration-200 ${
              isNearThreshold ? "scale-125 shadow-lg" : "scale-100"
            }`}
          >
            <Trash2 size={24} className="text-white" strokeWidth={2.5} />
          </div>
        </div>
      )}

      {/* Card Content */}
      <div
        ref={cardRef}
        className="relative z-10 will-change-transform"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isDragging
            ? "none"
            : "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    </div>
  );
}
