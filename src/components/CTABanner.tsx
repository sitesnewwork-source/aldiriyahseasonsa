import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const CTABanner = () => {
  const { isRtl } = useLanguage();
  const navigate = useNavigate();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="py-16 sm:py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Floating gold dust particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold/40"
            style={{
              left: `${15 + i * 15}%`,
              bottom: '20%',
              animation: `float-dust ${3 + i * 0.5}s ease-in-out ${i * 0.7}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Decorative gold corners */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-gold/20 opacity-40" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-gold/20 opacity-40" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Gold line above title */}
          <div className="w-16 h-px bg-gradient-gold mx-auto mb-6" />

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight gold-sparkle">
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
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-accent-foreground font-bold rounded-sm hover:bg-accent/90 transition-colors text-sm sm:text-base btn-press glow-gold"
            >
              <span>{isRtl ? "احجز تذكرتك" : "Book Your Ticket"}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/experiences")}
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-gold/30 text-foreground font-bold rounded-sm hover:border-gold/60 transition-all text-sm sm:text-base btn-press btn-luxury"
            >
              <span>{isRtl ? "استكشف التجارب" : "Explore Experiences"}</span>
            </button>
          </div>

          {/* Gold line below */}
          <div className="w-16 h-px bg-gradient-gold mx-auto mt-10" />
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
