import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

const DarkModeParticles = memo(() => {
  const { theme } = useTheme();

  const particles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      startY: 30 + Math.random() * 40,
      size: 1.5 + Math.random() * 2,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 5,
    })), []
  );

  if (theme !== "dark") return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[2]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.startY}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, hsl(43 72% 55% / 0.6), transparent)`,
          }}
          animate={{
            y: [0, -80],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
});

DarkModeParticles.displayName = "DarkModeParticles";

export default DarkModeParticles;
