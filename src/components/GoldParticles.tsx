import { memo, useMemo } from "react";
import { motion } from "framer-motion";

const GoldParticles = memo(() => {
  const particles = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 20 + Math.random() * 60,
      size: 2 + Math.random() * 2,
      duration: 6 + Math.random() * 4,
      delay: Math.random() * 3,
    })), []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, hsl(43 72% 60% / 0.6), transparent)`,
          }}
          animate={{
            y: [0, -50],
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

GoldParticles.displayName = "GoldParticles";

export default GoldParticles;
