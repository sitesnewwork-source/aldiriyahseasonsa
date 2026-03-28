import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { scrollToSection } from "@/lib/scroll";
import { useLanguage } from "@/i18n/LanguageContext";
import schoolImg from "@/assets/school-trips.jpg";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const SchoolBanner = () => {
  const { t, isRtl } = useLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const isMobile = useIsMobile();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], isMobile ? ["-5%", "5%"] : ["-12%", "12%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5]);

  return (
    <section ref={ref} id="school" className="relative h-[35vh] sm:h-[40vh] min-h-[240px] sm:min-h-[300px] overflow-hidden">
      <motion.img
        src={schoolImg}
        alt="جولات طلابية"
        loading="lazy"
        width={1920}
        height={800}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ y, opacity: bgOpacity }}
      />

      {/* Luxury overlay with gold tint */}
      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-l from-earth/85 via-earth/45 to-earth/20 sm:from-earth/75 sm:via-earth/35 sm:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-tl from-gold/8 via-transparent to-transparent pointer-events-none" />

      {/* Decorative gold corners */}
      <div className="absolute top-5 right-5 w-16 h-16 border-t-2 border-r-2 border-gold/20 opacity-50" />
      <div className="absolute bottom-5 left-5 w-16 h-16 border-b-2 border-l-2 border-gold/20 opacity-50" />

      {/* Floating gold particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold/25"
            style={{
              right: `${15 + i * 25}%`,
              bottom: '25%',
              animation: `float-dust ${3.5 + i * 0.5}s ease-in-out ${i * 1}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Top gold animated line */}
      <div className="absolute top-0 left-0 right-0 gold-line-animated z-10"><div className="h-px" /></div>

      <div className="relative z-10 flex items-end sm:items-center h-full pb-8 sm:pb-0">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`max-w-lg ${isRtl ? "sm:mr-auto" : "sm:ml-auto"}`}
          >
            {/* Gold accent line */}
            <div className="w-10 h-px bg-gradient-gold mb-5" />

            <p className="text-cream font-display text-base sm:text-xl md:text-2xl leading-relaxed mb-4 sm:mb-6 max-w-md">
              {t("school.desc")}
            </p>
            <button
              onClick={() => scrollToSection("experiences")}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-accent text-accent-foreground text-xs sm:text-sm font-bold rounded-sm hover:bg-accent/90 transition-colors btn-press glow-gold"
            >
              <span>{t("school.cta")}</span>
              <ArrowIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom gold animated line */}
      <div className="absolute bottom-0 left-0 right-0 gold-line-animated z-10"><div className="h-px" /></div>
    </section>
  );
};

export default SchoolBanner;
