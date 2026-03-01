import { useRef, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useSwipeToDelete } from "../../hooks/useSwipeToDelete";

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
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Kita set threshold di sini, misal -140px untuk auto-delete
  const TRIGGER_THRESHOLD = -140;

  const { swipeX, isDragging, touchHandlers, mouseHandlers } = useSwipeToDelete(
    {
      onSwipeLeft: onDelete,
      threshold: Math.abs(TRIGGER_THRESHOLD), // Gunakan nilai yang sama agar sinkron dengan hook
    },
    enabled,
  );

  // Touch events for mobile
  useEffect(() => {
    const card = cardRef.current;
    if (!card || !enabled) return;

    card.addEventListener("touchstart", touchHandlers.onTouchStart);
    card.addEventListener("touchmove", touchHandlers.onTouchMove);
    card.addEventListener("touchend", touchHandlers.onTouchEnd);

    return () => {
      card.removeEventListener("touchstart", touchHandlers.onTouchStart);
      card.removeEventListener("touchmove", touchHandlers.onTouchMove);
      card.removeEventListener("touchend", touchHandlers.onTouchEnd);
    };
  }, [touchHandlers, enabled]);

  // Mouse events for desktop
  useEffect(() => {
    if (!isMouseDown || !enabled) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouseHandlers.onMouseMove(e);
    };

    const handleGlobalMouseUp = () => {
      mouseHandlers.onMouseUp();
      setIsMouseDown(false);
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isMouseDown, mouseHandlers, enabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enabled) return;
    // Mencegah swipe aktif saat klik tombol di dalam kartu
    if ((e.target as HTMLElement).closest("button, a, input, .no-swipe")) {
      return;
    }
    mouseHandlers.onMouseDown(e.nativeEvent);
    setIsMouseDown(true);
  };

  // Logika UI: Kapan indikator merah mulai terlihat serius?
  const isNearThreshold = swipeX < TRIGGER_THRESHOLD + 40;

  return (
    <div className="relative overflow-hidden rounded-xl group bg-slate-900">
      {/* Background Action: 
          - Menggunakan transition-colors supaya pas berubah jadi merah terang lebih smooth.
          - Ditambah pointer-events-none supaya tidak ganggu mouse up.
      */}
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
        className="relative z-10 transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `translateX(${swipeX}px)`,
          // Jika sedang dragging, hilangkan transition supaya nempel ke jari
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
