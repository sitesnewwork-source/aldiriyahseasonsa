import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const CTABanner = forwardRef<HTMLElement>((_, ref) => {
  const { isRtl } = useLanguage();
  const navigate = useNavigate();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section ref={ref} className="py-16 sm:py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="w-16 h-px bg-gradient-gold mx-auto mb-6" />

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            {isRtl ? "ابدأ رحلتك\nإلى الدرعية" : "Start Your Journey\nto Diriyah"}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">
            {isRtl
              ? "احجز تذكرتك الآن واستمتع بتجربة لا تُنسى في قلب التاريخ والثقافة السعودية"
              : "Book your ticket now and enjoy an unforgettable experience in the heart of Saudi history and culture"}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/checkout")}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-accent-foreground font-bold rounded-sm hover:bg-accent/90 transition-colors text-sm sm:text-base btn-press"
            >
              <span>{isRtl ? "احجز تذكرتك" : "Book Your Ticket"}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/experiences")}
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-gold/30 text-foreground font-bold rounded-sm hover:border-gold/60 transition-all text-sm sm:text-base btn-press"
            >
              <span>{isRtl ? "استكشف التجارب" : "Explore Experiences"}</span>
            </button>
          </div>

          <div className="w-16 h-px bg-gradient-gold mx-auto mt-10" />
        </motion.div>
      </div>
    </section>
  );
});

CTABanner.displayName = "CTABanner";

export default CTABanner;
