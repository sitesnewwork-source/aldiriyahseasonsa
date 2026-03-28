import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

const DarkModeParticles = memo(() => {
  const { theme } = useTheme();

  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      startY: 20 + Math.random() * 60,
      size: 1.5 + Math.random() * 3,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 6,
      drift: (Math.random() - 0.5) * 40,
      glow: Math.random() > 0.6,
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
            background: p.glow
              ? `radial-gradient(circle, hsl(43 80% 65% / 0.9), hsl(43 72% 50% / 0.3), transparent)`
              : `radial-gradient(circle, hsl(43 72% 55% / 0.7), transparent)`,
            boxShadow: p.glow ? `0 0 ${p.size * 3}px hsl(43 80% 60% / 0.4)` : "none",
          }}
          animate={{
            y: [0, -60, -120],
            x: [0, p.drift * 0.5, p.drift],
            opacity: [0, 0.6, 0],
            scale: [0.3, 1, 0.2],
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
