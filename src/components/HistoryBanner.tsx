import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import salwaImg from "@/assets/salwa-palace-night.jpg";
import placeTuraif from "@/assets/place-turaif.jpg";

const HistoryBanner = () => {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="bg-background relative">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative aspect-[16/9] sm:aspect-[16/10] md:aspect-auto md:min-h-[400px] lg:min-h-[500px] overflow-hidden">
          <img src={salwaImg} alt="قصر سلوى" loading="lazy" width={1920} height={1080} className="w-full h-full object-cover" />
        </div>

        <div className="relative aspect-[16/9] sm:aspect-[16/10] md:aspect-auto md:min-h-[400px] lg:min-h-[500px] overflow-hidden">
          <img src={placeTuraif} alt="حي الطريف التاريخي" loading="lazy" width={1920} height={1080} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-earth/60 flex flex-col items-center justify-center text-center p-6 sm:p-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <div className="w-16 h-px bg-gradient-gold mx-auto mb-6" />
              <p className="text-cream/90 font-display text-lg sm:text-xl md:text-2xl max-w-sm leading-relaxed mb-6 sm:mb-8">
                {t("history.desc")}
              </p>
              <button
                onClick={() => navigate("/tickets")}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 border border-gold/60 text-cream text-xs sm:text-sm rounded-sm hover:bg-gold/20 hover:border-gold transition-all btn-press"
              >
                <span>{t("restaurants.bookNow")}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
              <div className="w-16 h-px bg-gradient-gold mx-auto mt-8" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistoryBanner;
