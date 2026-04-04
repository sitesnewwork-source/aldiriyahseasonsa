import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { scrollToSection } from "@/lib/scroll";
import { useLanguage } from "@/i18n/LanguageContext";
import hotelImg from "@/assets/hotel-bab-samhan.jpg";

const PromoBanner = () => {
  const { t, isRtl } = useLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-[40vh] sm:min-h-[50vh] md:min-h-[60vh] overflow-hidden">
      <img
        src={hotelImg}
        alt="باب سمحان"
        loading="lazy"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-l from-earth/90 via-earth/50 to-earth/20 sm:from-earth/85 sm:via-earth/40 sm:to-transparent" />

      <div className="relative z-10 flex items-end sm:items-center h-full min-h-[40vh] sm:min-h-[50vh] md:min-h-[60vh] pb-8 sm:pb-0">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`max-w-lg ${isRtl ? "sm:mr-auto" : "sm:ml-auto"}`}
          >
            <div className="w-12 h-px bg-gradient-gold mb-6" />
            <p className="text-cream/90 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 max-w-md">
              {t("promo.desc")}
            </p>
            <button
              onClick={() => scrollToSection("places")}
              className="inline-flex items-center gap-2 text-cream border-b border-gold/50 pb-1 hover:border-gold transition-colors text-sm btn-press"
            >
              <span>{t("promo.cta")}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
