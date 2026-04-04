import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { scrollToSection } from "@/lib/scroll";
import { useLanguage } from "@/i18n/LanguageContext";
import schoolImg from "@/assets/school-trips.jpg";

const SchoolBanner = () => {
  const { t, isRtl } = useLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section id="school" className="relative h-[35vh] sm:h-[40vh] min-h-[240px] sm:min-h-[300px] overflow-hidden">
      <img
        src={schoolImg}
        alt="جولات طلابية"
        loading="lazy"
        width={1920}
        height={800}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-l from-earth/85 via-earth/45 to-earth/20 sm:from-earth/75 sm:via-earth/35 sm:to-transparent" />

      <div className="relative z-10 flex items-end sm:items-center h-full pb-8 sm:pb-0">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`max-w-lg ${isRtl ? "sm:mr-auto" : "sm:ml-auto"}`}
          >
            <div className="w-10 h-px bg-gradient-gold mb-5" />
            <p className="text-cream font-display text-base sm:text-xl md:text-2xl leading-relaxed mb-4 sm:mb-6 max-w-md">
              {t("school.desc")}
            </p>
            <button
              onClick={() => scrollToSection("experiences")}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-accent text-accent-foreground text-xs sm:text-sm font-bold rounded-sm hover:bg-accent/90 transition-colors btn-press"
            >
              <span>{t("school.cta")}</span>
              <ArrowIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SchoolBanner;
