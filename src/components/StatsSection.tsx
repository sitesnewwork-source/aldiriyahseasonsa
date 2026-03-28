import { motion, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

interface StatItemProps {
  value: number;
  suffix: string;
  label: string;
  delay: number;
}

const StatItem = ({ value, suffix, label, delay }: StatItemProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const controls = animate(0, value, {
            duration: 2,
            delay,
            ease: [0.25, 0.1, 0.25, 1],
            onUpdate: (v) => setDisplayValue(Math.round(v)),
          });
          return () => controls.stop();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="text-center group"
    >
      <div className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-shimmer-gold mb-2 gold-sparkle">
        {displayValue}{suffix}
      </div>
      <div className="text-sm sm:text-base text-background/70 group-hover:text-gold/80 transition-colors duration-300">{label}</div>
    </motion.div>
  );
};

const StatsSection = () => {
  const { isRtl } = useLanguage();

  const stats = [
    { value: 300, suffix: "+", label: isRtl ? "عام من التاريخ" : "Years of History" },
    { value: 50, suffix: "+", label: isRtl ? "تجربة فريدة" : "Unique Experiences" },
    { value: 30, suffix: "+", label: isRtl ? "مطعم عالمي" : "World-Class Restaurants" },
    { value: 2, suffix: "M+", label: isRtl ? "زائر سنوياً" : "Annual Visitors" },
  ];

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-foreground relative overflow-hidden">
      {/* Subtle gold pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(60deg, transparent, transparent 80px, hsl(43 72% 50%) 80px, hsl(43 72% 50%) 81px)`,
        }} />
      </div>

      {/* Gold corner accents */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-gold/15" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-gold/15" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-gold/15" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-gold/15" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <StatItem
              key={i}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              delay={i * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
