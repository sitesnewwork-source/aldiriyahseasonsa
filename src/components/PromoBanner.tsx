import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { scrollToSection } from "@/lib/scroll";
import { useLanguage } from "@/i18n/LanguageContext";
import hotelImg from "@/assets/hotel-bab-samhan.jpg";
import { useRef } from "react";

const PromoBanner = () => {
  const { t, isRtl } = useLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.6]);

  return (
    <section ref={ref} id="about" className="relative min-h-[40vh] sm:min-h-[50vh] md:min-h-[60vh] overflow-hidden">
      <motion.img
        src={hotelImg}
        alt="باب سمحان"
        loading="lazy"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ y, opacity }}
      />

      {/* Luxury gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-l from-earth/90 via-earth/50 to-earth/20 sm:from-earth/85 sm:via-earth/40 sm:to-transparent" />

      {/* Gold accent overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/10 pointer-events-none" />

      {/* Decorative gold corners */}
      <div className="absolute top-6 left-6 w-20 h-20 border-t-2 border-l-2 border-gold/25 opacity-60" />
      <div className="absolute bottom-6 right-6 w-20 h-20 border-b-2 border-r-2 border-gold/25 opacity-60" />

      {/* Animated gold line at top */}
      <div className="absolute top-0 left-0 right-0 gold-line-animated z-10"><div className="h-px" /></div>

      {/* Floating gold dust */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold/30"
            style={{
              left: `${20 + i * 20}%`,
              bottom: '30%',
              animation: `float-dust ${3 + i * 0.6}s ease-in-out ${i * 0.8}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-end sm:items-center h-full min-h-[40vh] sm:min-h-[50vh] md:min-h-[60vh] pb-8 sm:pb-0">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`max-w-lg ${isRtl ? "sm:mr-auto" : "sm:ml-auto"}`}
          >
            {/* Gold decorative line before text */}
            <div className="w-12 h-px bg-gradient-gold mb-6" />

            <p className="text-cream/90 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 max-w-md">
              {t("promo.desc")}
            </p>
            <button
              onClick={() => scrollToSection("places")}
              className="inline-flex items-center gap-2 text-cream border-b border-gold/50 pb-1 hover:border-gold transition-colors text-sm btn-press btn-luxury"
            >
              <span>{t("promo.cta")}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 gold-line-animated z-10"><div className="h-px" /></div>
    </section>
  );
};

export default PromoBanner;
