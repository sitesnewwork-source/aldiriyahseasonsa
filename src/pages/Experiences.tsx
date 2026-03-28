import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, MapPin, Banknote } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { experiences } from "@/data/experiences";
import { useLanguage } from "@/i18n/LanguageContext";
import BackButton from "@/components/BackButton";
import ScrollReveal from "@/components/ScrollReveal";

const categoriesAr = ["الكل", "التاريخ والثقافة", "الفنون", "التجارب"];
const categoriesEn = ["All", "History & Culture", "Arts", "Experiences"];

const Experiences = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const categories = isAr ? categoriesAr : categoriesEn;
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  const filtered = activeCategory === categories[0]
    ? experiences
    : experiences.filter((e) => (isAr ? e.category : e.categoryEn) === activeCategory);

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <SEOHead
        title={isAr ? "أنشطة سياحية" : "Tourist Activities"}
        description={isAr ? "اكتشف الأنشطة والتجارب السياحية في الدرعية" : "Discover tourist activities and experiences in Diriyah"}
        path="/experiences"
      />
      <Header />

      <section className="pt-20 sm:pt-28 pb-6 sm:pb-8 bg-gradient-to-b from-gold/5 to-background dark:from-gold/10 dark:to-background">
        <div className="container mx-auto px-6">
          <BackButton />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={isAr ? "text-right" : "text-left"}>
            <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mb-4">
              <Link to="/" className="hover:text-foreground transition-colors">{isAr ? "الرئيسية" : "Home"}</Link>
              <ChevronIcon className="w-3 h-3" />
              <span className="text-foreground">{isAr ? "أنشطة سياحية" : "Tourist Activities"}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 gold-sparkle">
              {isAr ? "أنشطة سياحية" : "Tourist Activities"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              {isAr ? "تجارب ثقافية وتاريخية فريدة في قلب الدرعية" : "Unique cultural and historical experiences in the heart of Diriyah"}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-4">
        <div className="container mx-auto px-6">
          <div className={`flex items-center gap-3 overflow-x-auto scrollbar-hide ${isAr ? "justify-end" : "justify-start"} pb-2`} style={{ scrollbarWidth: "none" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium border transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-transparent text-muted-foreground border-border hover:border-accent/40 hover:text-foreground/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-16">
        <div className="container mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            >
              {filtered.map((exp, i) => (
                <ScrollReveal key={exp.id} animation={i % 3 === 0 ? "fade-up" : i % 3 === 1 ? "zoom" : "fade"} delay={i * 0.06}>
                  <Link to={`/experience/${exp.id}`} className="group block">
                    <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-3 dark:ring-1 dark:ring-border">
                      <img src={exp.image} alt={isAr ? exp.title : exp.titleEn} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent dark:from-black/60 pointer-events-none" />
                      <span className={`absolute top-3 ${isAr ? "right-3" : "left-3"} bg-muted/90 backdrop-blur-sm text-foreground text-xs px-3 py-1 rounded-md`}>
                        {isAr ? exp.category : exp.categoryEn}
                      </span>
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors btn-luxury">
                      {isAr ? exp.title : exp.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{isAr ? exp.description : exp.descriptionEn}</p>
                    <div className={`flex items-center gap-3 text-xs text-muted-foreground ${isAr ? "justify-end" : "justify-start"} flex-wrap`}>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gold" />{isAr ? exp.duration : exp.durationEn}</span>
                      <span className="flex items-center gap-1"><Banknote className="w-3 h-3 text-gold" />{isAr ? exp.price : exp.priceEn}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gold" />{isAr ? exp.location : exp.locationEn}</span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Experiences;
