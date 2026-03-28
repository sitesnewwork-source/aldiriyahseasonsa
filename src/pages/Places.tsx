import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { places } from "@/data/places";
import { useLanguage } from "@/i18n/LanguageContext";
import BackButton from "@/components/BackButton";
import ScrollReveal from "@/components/ScrollReveal";

const Places = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <SEOHead
        title={isAr ? "أماكن للزيارة" : "Places to Visit"}
        description={isAr ? "اكتشف أبرز الوجهات في الدرعية" : "Discover top destinations in Diriyah"}
        path="/places"
      />
      <Header />

      <section className="pt-20 sm:pt-28 pb-6 sm:pb-8 bg-gradient-to-b from-gold/5 to-background dark:from-gold/10 dark:to-background">
        <div className="container mx-auto px-6">
          <BackButton />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={isAr ? "text-right" : "text-left"}>
            <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mb-4">
              <Link to="/" className="hover:text-foreground transition-colors">{isAr ? "الرئيسية" : "Home"}</Link>
              <ChevronIcon className="w-3 h-3" />
              <span className="text-foreground">{isAr ? "أماكن للزيارة" : "Places to Visit"}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3">
              {isAr ? "أماكن للزيارة" : "Places to Visit"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              {isAr ? "اكتشف الوجهات المميزة في الدرعية — من المواقع التاريخية إلى الوجهات الترفيهية" : "Discover Diriyah's unique destinations — from historic sites to entertainment venues"}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-10 sm:pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {places.map((place, i) => (
              <ScrollReveal key={place.id} animation={i % 2 === 0 ? "fade-left" : "fade-right"} delay={i * 0.08}>
                <Link to={`/place/${place.id}`} className="group block">
                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-4 dark:ring-1 dark:ring-border">
                    <img src={place.detailImage} alt={isAr ? place.name : place.nameEn} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent dark:from-black/70" />
                    <div className={`absolute bottom-0 left-0 right-0 p-5 md:p-6 ${isAr ? "text-right" : "text-left"}`}>
                      <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-1">
                        {isAr ? place.name : place.nameEn}
                      </h3>
                      <p className="text-white/70 text-sm">{isAr ? place.subtitle : place.subtitleEn}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-4 text-xs text-muted-foreground ${isAr ? "justify-end" : "justify-start"} flex-wrap`}>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gold" />
                      {isAr ? place.location : place.locationEn}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gold" />
                      {isAr ? place.hours[0]?.time : place.hours[0]?.timeEn}
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Places;
