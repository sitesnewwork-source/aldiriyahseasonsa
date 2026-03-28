import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ParallaxHero from "@/components/ParallaxHero";
import { ArrowRight, ArrowLeft, Clock, MapPin, Banknote, Check, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getExperienceById, experiences } from "@/data/experiences";
import { getExperienceReviews } from "@/data/reviews";
import ReviewsSection from "@/components/ReviewsSection";
import { useLanguage } from "@/i18n/LanguageContext";
import BackButton from "@/components/BackButton";

const ExperienceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const exp = getExperienceById(id || "");
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;
  const TipArrow = isAr ? ArrowRight : ArrowLeft;

  const t = (ar: string | string[], en: string | string[]) => isAr ? ar : en;

  if (!exp) {
    return (
      <div className="min-h-screen bg-background flex flex-col" dir={isAr ? "rtl" : "ltr"}>
        <Header />
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">{isAr ? "التجربة غير موجودة" : "Experience Not Found"}</h1>
            <Link to="/" className="text-gold hover:underline underline-offset-4">{isAr ? "العودة للرئيسية" : "Back to Home"}</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const otherExperiences = experiences.filter((e) => e.id !== exp.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-2">
        <BackButton />
      </div>

      <ParallaxHero image={exp.detailImage} alt={t(exp.title, exp.titleEn) as string} overlayClassName="bg-gradient-to-t from-earth/80 via-earth/30 to-earth/10 dark:from-black/80 dark:via-black/40 dark:to-black/10">
        <div className="absolute top-20 sm:top-28 right-0 left-0 z-10">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 text-cream/60 text-xs sm:text-sm">
              <Link to="/" className="hover:text-cream transition-colors">{isAr ? "الرئيسية" : "Home"}</Link>
              <ChevronIcon className="w-3 h-3" />
              <span className="text-cream/40">{isAr ? "التجارب" : "Experiences"}</span>
              <ChevronIcon className="w-3 h-3" />
              <span className="text-cream">{t(exp.title, exp.titleEn)}</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 left-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 pb-6 sm:pb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block bg-gold/20 text-gold text-xs sm:text-sm px-3 py-1 rounded-sm mb-3 backdrop-blur-sm">{t(exp.category, exp.categoryEn)}</span>
              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-cream mb-2 text-shimmer-gold">{t(exp.title, exp.titleEn)}</h1>
              <p className="text-cream/70 text-sm sm:text-base">{t(exp.schedule, exp.scheduleEn)}</p>
            </motion.div>
          </div>
        </div>
      </ParallaxHero>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-lg border border-border p-5 sm:p-8">
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4">{isAr ? "عن التجربة" : "About the Experience"}</h2>
              <div className="h-px bg-border mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{t(exp.fullDescription, exp.fullDescriptionEn)}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-lg border border-border p-5 sm:p-8">
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4">{isAr ? "أبرز المعالم" : "Highlights"}</h2>
              <div className="h-px bg-border mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(t(exp.highlights, exp.highlightsEn) as string[]).map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-gold text-xs font-bold">{i + 1}</span></div>
                    <p className="text-sm text-foreground">{h}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-lg border border-border p-5 sm:p-8">
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4">{isAr ? "التجربة تشمل" : "Experience Includes"}</h2>
              <div className="h-px bg-border mb-4" />
              <ul className="space-y-3">
                {(t(exp.includes, exp.includesEn) as string[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-3"><Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" /><span className="text-sm text-foreground">{item}</span></li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gold/5 dark:bg-gold/10 rounded-lg border border-gold/20 dark:border-gold/30 p-5 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-gold" />
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">{isAr ? "نصائح للزائر" : "Visitor Tips"}</h2>
              </div>
              <ul className="space-y-3">
                {(t(exp.tips, exp.tipsEn) as string[]).map((tip, i) => (
                  <li key={i} className="flex items-start gap-3"><TipArrow className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-1" /><span className="text-sm text-muted-foreground">{tip}</span></li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-lg overflow-hidden">
              <img src={exp.image} alt={t(exp.title, exp.titleEn) as string} loading="lazy" width={1200} height={800} className="w-full h-auto object-cover rounded-lg" />
            </motion.div>

            <ReviewsSection reviews={getExperienceReviews(exp.id)} />
          </div>

          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-lg border border-border p-5 sm:p-6 sticky top-28 space-y-5">
              <h3 className="font-display text-lg font-bold text-foreground">{isAr ? "معلومات التجربة" : "Experience Info"}</h3>
              <div className="h-px bg-border" />
              <div className="space-y-4">
                <div className="flex items-start gap-3"><Clock className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" /><div><p className="text-xs text-muted-foreground mb-0.5">{isAr ? "المدة" : "Duration"}</p><p className="text-sm font-medium text-foreground">{t(exp.duration, exp.durationEn)}</p></div></div>
                <div className="flex items-start gap-3"><Banknote className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" /><div><p className="text-xs text-muted-foreground mb-0.5">{isAr ? "السعر" : "Price"}</p><p className="text-sm font-medium text-foreground">{t(exp.price, exp.priceEn)}</p></div></div>
                <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" /><div><p className="text-xs text-muted-foreground mb-0.5">{isAr ? "الموقع" : "Location"}</p><p className="text-sm font-medium text-foreground">{t(exp.location, exp.locationEn)}</p></div></div>
                <div className="flex items-start gap-3"><Clock className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" /><div><p className="text-xs text-muted-foreground mb-0.5">{isAr ? "الجدول" : "Schedule"}</p><p className="text-sm font-medium text-foreground">{t(exp.schedule, exp.scheduleEn)}</p></div></div>
              </div>
              <div className="h-px bg-border" />
              <Link to="/tickets" className="block w-full bg-accent text-accent-foreground font-bold py-3.5 rounded-lg hover:bg-accent/90 transition-colors text-sm text-center btn-press glow-gold-hover">{isAr ? "احجز تذكرتك" : "Book Your Ticket"}</Link>
              <p className="text-[10px] text-muted-foreground text-center">{isAr ? "التذكرة تشمل الدخول لجميع المعارض والتجارب" : "Ticket includes access to all exhibitions and experiences"}</p>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 sm:mt-20">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8 gold-sparkle">{isAr ? "تجارب أخرى قد تعجبك" : "Other Experiences You May Like"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {otherExperiences.map((other) => (
              <Link key={other.id} to={`/experience/${other.id}`} className="group">
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-3 dark:ring-1 dark:ring-border">
                  <img src={other.image} alt={t(other.title, other.titleEn) as string} loading="lazy" width={640} height={800} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className={`absolute top-3 ${isAr ? "right-3" : "left-3"} bg-muted/90 backdrop-blur-sm text-foreground text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-md`}>{t(other.category, other.categoryEn)}</span>
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">{t(other.title, other.titleEn)}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t(other.schedule, other.scheduleEn)}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default ExperienceDetail;
