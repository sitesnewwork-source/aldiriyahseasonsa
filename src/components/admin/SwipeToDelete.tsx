import { useRef, useState, useCallback, type ReactNode } from "react";
import { Trash2 } from "lucide-react";

interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => void;
  label?: string;
}

const SwipeToDelete = ({ children, onDelete, label = "مسح" }: SwipeToDeleteProps) => {
  const startX = useRef(0);
  const currentX = useRef(0);
  const isSwiping = useRef(false);
  const isMouseDown = useRef(false);
  const directionLocked = useRef(false);
  const [offset, setOffset] = useState(0);
  const [showDelete, setShowDelete] = useState(false);

  const beginSwipe = useCallback((clientX: number) => {
    startX.current = clientX;
    isSwiping.current = false;
    directionLocked.current = false;
  }, []);

  const moveSwipe = useCallback((clientX: number) => {
    const dx = clientX - startX.current;
    if (!directionLocked.current && Math.abs(dx) > 8) {
      directionLocked.current = true;
      isSwiping.current = true;
    }
    if (!isSwiping.current) return;
    const clampedDx = Math.min(Math.abs(dx), 120);
    currentX.current = clampedDx;
    setOffset(clampedDx);
  }, []);

  const endSwipe = useCallback(() => {
    if (!isSwiping.current) return;
    if (currentX.current > 60) {
      setShowDelete(true);
      setOffset(80);
      if (navigator.vibrate) navigator.vibrate(30);
    } else {
      setShowDelete(false);
      setOffset(0);
    }
    isSwiping.current = false;
    isMouseDown.current = false;
    currentX.current = 0;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => beginSwipe(e.touches[0].clientX), [beginSwipe]);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - (startX.current); // approximate
    if (!directionLocked.current && Math.abs(dx) > 8) {
      directionLocked.current = true;
      isSwiping.current = true;
    }
    if (!isSwiping.current) return;
    e.preventDefault();
    const clampedDx = Math.min(Math.abs(dx), 120);
    currentX.current = clampedDx;
    setOffset(clampedDx);
  }, []);
  const handleTouchEnd = useCallback(() => endSwipe(), [endSwipe]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isMouseDown.current = true;
    beginSwipe(e.clientX);
  }, [beginSwipe]);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    moveSwipe(e.clientX);
  }, [moveSwipe]);
  const handleMouseUp = useCallback(() => { if (isMouseDown.current) endSwipe(); }, [endSwipe]);
  const handleMouseLeave = useCallback(() => { if (isMouseDown.current) endSwipe(); }, [endSwipe]);

  const handleDelete = useCallback(() => {
    setOffset(300);
    setTimeout(() => {
      onDelete();
      setOffset(0);
      setShowDelete(false);
    }, 250);
  }, [onDelete]);

  const handleCancel = useCallback(() => {
    setOffset(0);
    setShowDelete(false);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl select-none">
      <div
        className="absolute inset-y-0 left-0 flex items-center justify-start rounded-2xl transition-colors"
        style={{
          width: Math.max(offset, 80),
          background: showDelete
            ? "linear-gradient(135deg, #ef4444, #dc2626)"
            : "linear-gradient(135deg, #f87171, #ef4444)",
          opacity: Math.min(offset / 40, 1),
        }}
      >
        {showDelete ? (
          <button onClick={handleDelete} className="flex flex-col items-center gap-0.5 px-4 text-white animate-[shake_0.3s_ease-in-out]">
            <Trash2 className="w-5 h-5" />
            <span className="text-[9px] font-bold">{label}</span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-0.5 px-4 text-white/80">
            <Trash2 className="w-4 h-4" />
          </div>
        )}
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={showDelete ? handleCancel : undefined}
        style={{
          transform: `translateX(-${offset}px)`,
          transition: isSwiping.current ? "none" : "transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)",
          cursor: "grab",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeToDelete;
