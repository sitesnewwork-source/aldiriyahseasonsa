import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useState, useEffect } from "react";
import diriyahLogo from "@/assets/diriyah-logo.png";

interface PageTransitionProps {
  children: ReactNode;
}

const LoadingScreen = () => (
  <motion.div
    className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden pointer-events-none"
    style={{ background: "linear-gradient(160deg, hsl(30 10% 12%) 0%, hsl(30 15% 8%) 50%, hsl(30 10% 5%) 100%)" }}
    initial={{ opacity: 1, scale: 1 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 0.45, ease: "easeInOut" }}
    aria-hidden="true"
  >
    {/* Subtle geometric pattern */}
    <div className="absolute inset-0 opacity-[0.04]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 40px, hsl(36 60% 60% / 0.5) 40px, hsl(36 60% 60% / 0.5) 41px),
            repeating-linear-gradient(-45deg, transparent, transparent 40px, hsl(36 60% 60% / 0.3) 40px, hsl(36 60% 60% / 0.3) 41px)
          `,
        }}
      />
    </div>

    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full"
      style={{
        background: "radial-gradient(circle, hsl(36 50% 50% / 0.12) 0%, transparent 70%)",
      }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />

    <div className="relative flex flex-col items-center gap-8">
      <div className="relative">
        <motion.div
          className="absolute -inset-10 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(36 50% 50% / 0.25) 0%, hsl(36 50% 50% / 0.05) 50%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.img
          src={diriyahLogo}
          alt="الدرعية"
          className="relative w-32 h-32 object-contain"
          style={{ filter: "drop-shadow(0 0 30px hsl(36 50% 50% / 0.4))" }}
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <motion.div
        className="flex flex-col items-center gap-1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
      >
        <span
          className="text-sm font-medium tracking-[0.3em] uppercase"
          style={{ color: "hsl(36 40% 55%)" }}
        >
          من هالأرض
        </span>
      </motion.div>

      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="w-40 h-[2px] rounded-full overflow-hidden" style={{ background: "hsl(36 30% 30% / 0.3)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, hsl(36 50% 50%), hsl(36 60% 65%))" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full"
              style={{ background: "hsl(36 40% 55%)" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  </motion.div>
);

const PageTransition = ({ children }: PageTransitionProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <LoadingScreen key="loader" />}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default PageTransition;
