import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import salwaImg from "@/assets/salwa-palace-night.jpg";
import placeTuraif from "@/assets/place-turaif.jpg";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const HistoryBanner = () => {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const isMobile = useIsMobile();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], isMobile ? ["-4%", "4%"] : ["-10%", "10%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], isMobile ? ["-3%", "3%"] : ["-6%", "6%"]);
  const scale1 = useTransform(scrollYProgress, [0, 0.5, 1], isMobile ? [1.02, 1, 1.02] : [1.05, 1, 1.05]);

  return (
    <section ref={ref} className="bg-background relative">
      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0 z-10 gold-line-animated"><div className="h-px" /></div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative aspect-[16/9] sm:aspect-[16/10] md:aspect-auto md:min-h-[400px] lg:min-h-[500px] overflow-hidden"
        >
          <motion.img src={salwaImg} alt="قصر سلوى" loading="lazy" width={1920} height={1080} className="w-full h-full object-cover" style={{ y: y1, scale: scale1 }} />
          {/* Gold gradient overlay on left image */}
          <div className="absolute inset-0 bg-gradient-to-t from-gold/10 via-transparent to-transparent pointer-events-none" />
          {/* Gold corner */}
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b border-l border-gold/30" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative aspect-[16/9] sm:aspect-[16/10] md:aspect-auto md:min-h-[400px] lg:min-h-[500px] overflow-hidden"
        >
          <motion.img src={placeTuraif} alt="حي الطريف التاريخي" loading="lazy" width={1920} height={1080} className="w-full h-full object-cover" style={{ y: y2 }} />
          <div className="absolute inset-0 bg-earth/60 flex flex-col items-center justify-center text-center p-6 sm:p-8">
            {/* Gold accent gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/8 via-transparent to-gold/5 pointer-events-none" />

            <div className="relative z-10">
              {/* Gold line above text */}
              <div className="w-16 h-px bg-gradient-gold mx-auto mb-6" />

              <p className="text-cream/90 font-display text-lg sm:text-xl md:text-2xl max-w-sm leading-relaxed mb-6 sm:mb-8 gold-sparkle">
                {t("history.desc")}
              </p>
              <button
                onClick={() => navigate("/tickets")}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 border border-gold/60 text-cream text-xs sm:text-sm rounded-sm hover:bg-gold/20 hover:border-gold transition-all btn-press glow-gold-hover"
              >
                <span>{t("restaurants.bookNow")}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              {/* Gold line below */}
              <div className="w-16 h-px bg-gradient-gold mx-auto mt-8" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 z-10 gold-line-animated"><div className="h-px" /></div>
    </section>
  );
};

export default HistoryBanner;
