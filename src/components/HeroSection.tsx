import { useState, useEffect, useCallback } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { scrollToSection } from "@/lib/scroll";
import { useLanguage } from "@/i18n/LanguageContext";
import GoldParticles from "./GoldParticles";

import hero1 from "@/assets/hero-diriyah-1.jpg";
import hero2 from "@/assets/hero-diriyah-2.jpg";
import hero3 from "@/assets/hero-diriyah-3.jpg";

const HeroSection = () => {
  const { t, isRtl } = useLanguage();
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      image: hero1,
      title: t("hero.slide1.title"),
      subtitle: t("hero.slide1.subtitle"),
      cta: t("hero.slide1.cta"),
      target: "/checkout",
    },
    {
      image: hero2,
      title: t("hero.slide2.title"),
      subtitle: t("hero.slide2.subtitle"),
      cta: t("hero.slide1.cta"),
      target: "/checkout",
    },
    {
      image: hero3,
      title: t("hero.slide3.title"),
      subtitle: t("hero.slide3.subtitle"),
      cta: t("hero.slide3.cta"),
      target: "/restaurants",
    },
  ];

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const handleCTA = (target: string) => {
    if (target.startsWith("http")) {
      window.open(target, "_blank", "noopener,noreferrer");
    } else if (target.startsWith("/")) {
      navigate(target);
    } else {
      scrollToSection(target);
    }
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="relative h-[85vh] sm:h-screen min-h-[500px] sm:min-h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={slides[current].image}
          alt={slides[current].title}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          width={1920}
          height={1080}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-earth/80 via-earth/20 to-earth/40 pointer-events-none" />

      {/* Floating gold particles */}
      <GoldParticles />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            className="max-w-3xl"
          >
            {/* Decorative top line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="w-20 h-px bg-gradient-gold mx-auto mb-6 origin-center"
            />
            
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-cream leading-tight mb-3 sm:mb-4 text-shimmer-gold">
              {slides[current].title}
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-cream/70 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-2"
            >
              {slides[current].subtitle}
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onClick={() => { playChime("click"); handleCTA(slides[current].target); }}
              className="pointer-events-auto inline-flex items-center gap-2 text-cream text-sm border-b border-gold/50 pb-1 hover:border-gold transition-all btn-press btn-luxury glow-gold-hover px-4 py-2 magnetic-glow"
            >
              <span>{slides[current].cta}</span>
              <ArrowIcon className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gold animated line at bottom */}
      <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 w-32 sm:w-48 gold-line-animated z-20 pointer-events-none">
        <div className="h-px" />
      </div>

      {/* Slide progress bar */}
      <div className="absolute bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 w-32 sm:w-40 h-[2px] bg-cream/10 rounded-full z-20 overflow-hidden pointer-events-none">
        <motion.div
          key={current}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 6, ease: "linear" }}
          className="h-full bg-gradient-gold origin-left"
        />
      </div>

      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { playChime("soft"); setCurrent(i); }}
            className={`transition-all duration-500 rounded-full ${
              i === current
                ? "w-3 h-3 border-2 border-gold bg-transparent glow-gold"
                : "w-2 h-2 bg-cream/30 hover:bg-cream/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;