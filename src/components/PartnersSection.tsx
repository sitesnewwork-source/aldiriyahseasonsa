import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

import partnerSta from "@/assets/partner-sta.png";
import partnerVision from "@/assets/partner-vision.png";
import partnerUnesco from "@/assets/partner-unesco.png";
import partnerMoc from "@/assets/partner-moc.png";
import partnerDgda from "@/assets/partner-dgda.png";
import partnerPif from "@/assets/partner-pif.png";
import partnerGea from "@/assets/partner-gea.png";
import partnerRcrc from "@/assets/partner-rcrc.png";

const partners = [
  { nameAr: "هيئة السياحة", nameEn: "Saudi Tourism", logo: partnerSta },
  { nameAr: "رؤية 2030", nameEn: "Vision 2030", logo: partnerVision },
  { nameAr: "اليونسكو", nameEn: "UNESCO", logo: partnerUnesco },
  { nameAr: "وزارة الثقافة", nameEn: "Ministry of Culture", logo: partnerMoc },
  { nameAr: "بوابة الدرعية", nameEn: "Diriyah Gate", logo: partnerDgda },
  { nameAr: "صندوق الاستثمارات", nameEn: "PIF", logo: partnerPif },
  { nameAr: "هيئة الترفيه", nameEn: "GEA", logo: partnerGea },
  { nameAr: "الهيئة الملكية للرياض", nameEn: "Royal Commission", logo: partnerRcrc },
];

const allPartners = [...partners, ...partners];

const PartnersSection = () => {
  const { isRtl } = useLanguage();

  return (
    <section className="py-10 sm:py-14 bg-card border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 mb-6 sm:mb-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-xs sm:text-sm text-muted-foreground tracking-widest uppercase"
        >
          {isRtl ? "شركاؤنا" : "Our Partners"}
        </motion.p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex items-center gap-10 sm:gap-14 md:gap-18 w-max"
          animate={{ x: isRtl ? ["0%", "50%"] : ["0%", "-50%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {allPartners.map((partner, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-background/80 dark:bg-white/10 p-1.5 flex items-center justify-center">
                <img
                  src={partner.logo}
                  alt={isRtl ? partner.nameAr : partner.nameEn}
                  loading="lazy"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain dark:brightness-150 dark:contrast-125"
                />
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium whitespace-nowrap">
                {isRtl ? partner.nameAr : partner.nameEn}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection;
