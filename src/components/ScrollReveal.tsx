import { motion, type Variant } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

type AnimationType = "fade-up" | "fade-left" | "fade-right" | "zoom" | "fade";

const desktopVariants: Record<AnimationType, { hidden: Variant; visible: Variant }> = {
  "fade-up": {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

const mobileVariants: Record<AnimationType, { hidden: Variant; visible: Variant }> = {
  "fade-up": {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -25 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 25 },
    visible: { opacity: 1, x: 0 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

interface ScrollRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 0.7,
  className = "",
  once = true,
}, ref) => {
  const isMobile = useIsMobile();
  const variants = isMobile ? mobileVariants : desktopVariants;
  const mobileDuration = isMobile ? Math.min(duration, 0.5) : duration;
  const mobileDelay = isMobile ? delay * 0.6 : delay;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: isMobile ? "-40px" : "-80px" }}
      variants={variants[animation]}
      transition={{ duration: mobileDuration, delay: mobileDelay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

ScrollReveal.displayName = "ScrollReveal";

export default ScrollReveal;
