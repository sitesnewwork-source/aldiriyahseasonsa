import { useRef, useState, useCallback, type ReactNode } from "react";
import { Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { playChime } from "@/hooks/use-action-sound";

interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => void;
  label?: string;
  undoLabel?: string;
  undoDuration?: number;
}

const SwipeToDelete = ({
  children,
  onDelete,
  label = "مسح",
  undoLabel = "تم الحذف",
  undoDuration = 4000,
}: SwipeToDeleteProps) => {
  const startX = useRef(0);
  const currentX = useRef(0);
  const isSwiping = useRef(false);
  const isMouseDown = useRef(false);
  const directionLocked = useRef(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undone = useRef(false);
  const [offset, setOffset] = useState(0);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hidden, setHidden] = useState(false);

  const beginSwipe = useCallback((clientX: number) => {
    if (deleting) return;
    startX.current = clientX;
    isSwiping.current = false;
    directionLocked.current = false;
  }, [deleting]);

  const moveSwipe = useCallback((clientX: number) => {
    if (deleting) return;
    const dx = clientX - startX.current;
    if (!directionLocked.current && Math.abs(dx) > 8) {
      directionLocked.current = true;
      isSwiping.current = true;
    }
    if (!isSwiping.current) return;
    const clampedDx = Math.min(Math.abs(dx), 120);
    currentX.current = clampedDx;
    setOffset(clampedDx);
  }, [deleting]);

  const endSwipe = useCallback(() => {
    if (!isSwiping.current || deleting) return;
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
  }, [deleting]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => beginSwipe(e.touches[0].clientX), [beginSwipe]);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (deleting) return;
    const dx = e.touches[0].clientX - startX.current;
    if (!directionLocked.current && Math.abs(dx) > 8) {
      directionLocked.current = true;
      isSwiping.current = true;
    }
    if (!isSwiping.current) return;
    e.preventDefault();
    const clampedDx = Math.min(Math.abs(dx), 120);
    currentX.current = clampedDx;
    setOffset(clampedDx);
  }, [deleting]);
  const handleTouchEnd = useCallback(() => endSwipe(), [endSwipe]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (deleting) return;
    isMouseDown.current = true;
    beginSwipe(e.clientX);
  }, [beginSwipe, deleting]);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    moveSwipe(e.clientX);
  }, [moveSwipe]);
  const handleMouseUp = useCallback(() => { if (isMouseDown.current) endSwipe(); }, [endSwipe]);
  const handleMouseLeave = useCallback(() => { if (isMouseDown.current) endSwipe(); }, [endSwipe]);

  const restoreCard = useCallback(() => {
    undone.current = true;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setDeleting(false);
    setHidden(false);
    setOffset(0);
    setShowDelete(false);
  }, []);

  const handleDelete = useCallback(() => {
    setDeleting(true);
    undone.current = false;
    playChime("delete");

    toast(
      () => (
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-sm font-medium">{undoLabel}</span>
            </div>
            <button
              onClick={() => {
                restoreCard();
                toast.dismiss();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              تراجع
            </button>
          </div>
          <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-red-500"
              style={{
                animation: `undoProgress ${undoDuration}ms linear forwards`,
              }}
            />
          </div>
        </div>
      ),
      {
        duration: undoDuration,
        unstyled: false,
      },
    );

    undoTimer.current = setTimeout(() => {
      if (!undone.current) {
        setHidden(true);
        onDelete();
      }
    }, undoDuration);
  }, [onDelete, undoLabel, undoDuration, restoreCard]);

  const handleCancel = useCallback(() => {
    if (deleting) return;
    setOffset(0);
    setShowDelete(false);
  }, [deleting]);

  if (hidden) return null;

  return (
    <div
      className="relative select-none"
      style={{
        maxHeight: deleting ? 0 : 500,
        opacity: deleting ? 0 : 1,
        marginBottom: deleting ? 0 : undefined,
        overflow: "hidden",
        transition: deleting
          ? "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.15s, opacity 0.3s ease-out, margin-bottom 0.4s ease 0.15s"
          : "max-height 0.35s ease, opacity 0.25s ease, margin-bottom 0.35s ease",
      }}
    >
      <div className="relative overflow-hidden rounded-2xl">
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
            transform: deleting
              ? "translateX(-100%)"
              : `translateX(-${offset}px)`,
            transition: isSwiping.current
              ? "none"
              : deleting
                ? "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
                : "transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)",
            cursor: deleting ? "default" : "grab",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default SwipeToDelete;
