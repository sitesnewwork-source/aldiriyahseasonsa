import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const THRESHOLD = 80;

const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const y = useMotionValue(0);
  const rotate = useTransform(y, [0, THRESHOLD], [0, 360]);
  const opacity = useTransform(y, [0, 40, THRESHOLD], [0, 0.5, 1]);
  const scale = useTransform(y, [0, THRESHOLD], [0.5, 1]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = containerRef.current;
    if (!el || refreshing) return;
    // Only activate when scrolled to top
    if (el.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return;
    const diff = Math.max(0, e.touches[0].clientY - startY.current);
    // Dampen the pull
    const dampened = Math.min(diff * 0.45, THRESHOLD + 20);
    y.set(dampened);
  }, [refreshing, y]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current || refreshing) return;
    pulling.current = false;
    const currentY = y.get();
    if (currentY >= THRESHOLD) {
      setRefreshing(true);
      y.set(50);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        y.set(0);
      }
    } else {
      y.set(0);
    }
  }, [refreshing, onRefresh, y]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Indicator */}
      <motion.div
        className="flex items-center justify-center pointer-events-none"
        style={{ height: y, opacity }}
      >
        <motion.div
          style={{ scale, rotate: refreshing ? undefined : rotate }}
          className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 text-blue-500 ${refreshing ? "animate-spin" : ""}`} />
        </motion.div>
      </motion.div>

      {children}
    </div>
  );
};

export default PullToRefresh;
