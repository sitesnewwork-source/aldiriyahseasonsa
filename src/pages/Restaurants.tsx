import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Instagram, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { restaurants, type RestaurantCategory } from "@/data/restaurants";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";
import BackButton from "@/components/BackButton";

import heroImg from "@/assets/dine-hero.jpg";
import introImg from "@/assets/dine-intro.jpg";
import carousel1 from "@/assets/dine-carousel-1.jpg";
import carousel2 from "@/assets/dine-carousel-2.jpg";
import carousel3 from "@/assets/dine-carousel-3.jpg";
import carousel4 from "@/assets/dine-carousel-4.jpg";
import carousel5 from "@/assets/dine-carousel-5.jpg";
import carousel6 from "@/assets/dine-carousel-6.jpg";

const carouselImages = [carousel1, carousel2, carousel3, carousel4, carousel5, carousel6];

const INITIAL_COUNT = 6;

const categories: (RestaurantCategory | "الكل")[] = ["الكل", "مطاعم فاخرة", "مطعم ومقهى", "زلال", "باب سمحان"];

const Restaurants = () => {
  const { t, isRtl } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [activeCategory, setActiveCategory] = useState<RestaurantCategory | "الكل">("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredRestaurants = useMemo(() => {
    let result = restaurants;
    if (activeCategory !== "الكل") {
      result = result.filter((r) => r.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (r) => r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, searchQuery]);

  const visibleRestaurants = filteredRestaurants.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRestaurants.length;

  const getCategoryCount = (cat: RestaurantCategory | "الكل") =>
    cat === "الكل" ? restaurants.length : restaurants.filter((r) => r.category === cat).length;

  const scrollCarousel = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="المطاعم" description="اكتشفوا أفضل المطاعم في الدرعية - تجارب طعام استثنائية في قلب مطل البجيري." path="/restaurants" />
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-2">
        <BackButton />
      </div>

      {/* ===== HERO ===== */}
      <section className="relative h-[70vh] md:h-[85vh] flex items-end overflow-hidden">
        <img
          src={heroImg}
          alt="ثقافة النكهات الأصيلة"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent dark:from-black/80 dark:via-black/30 dark:to-transparent" />
        <div className={`relative z-10 w-full px-6 md:px-16 lg:px-24 pb-14 md:pb-20 ${isRtl ? "text-right" : "text-left"}`}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl md:text-6xl lg:text-[72px] font-bold text-background mb-4 leading-[1.15] text-shimmer-gold"
          >
            {t("restaurants.heroTitle")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-background/80 text-base md:text-xl"
          >
            {t("restaurants.heroSubtitle")}
          </motion.p>
        </div>
      </section>

      {/* ===== INTRO SECTION ===== */}
      <section className="relative py-10 md:py-16 overflow-hidden">
        {/* Decorative triangles */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.06]">
          <svg width="200" height="400" viewBox="0 0 200 400">
            <polygon points="0,100 100,0 100,200" fill="hsl(var(--sand-dark))" />
            <polygon points="50,200 150,100 150,300" fill="hsl(var(--sand-dark))" />
            <polygon points="0,300 100,200 100,400" fill="hsl(var(--sand-dark))" />
          </svg>
        </div>

        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-right order-1"
            >
              <h2 className="font-display text-3xl md:text-5xl lg:text-[56px] font-bold text-foreground mb-5 leading-[1.3] whitespace-pre-line">
                {t("restaurants.exploreTitle")}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-[1.9] max-w-lg">
                {t("restaurants.exploreDesc")}
              </p>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-2"
            >
              <div className="aspect-[4/5] rounded-xl overflow-hidden">
                <img
                  src={introImg}
                  alt="استكشف مطاعم الدرعية"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={1024}
                  height={1280}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== IMAGE CAROUSEL ===== */}
      <section className="pb-10 md:pb-14">
        <div className="relative">
          <button
            onClick={() => scrollCarousel("right")}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-11 md:h-11 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-background transition-all shadow-md"
            aria-label="السابق"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollCarousel("left")}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-11 md:h-11 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-background transition-all shadow-md"
            aria-label="التالي"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide px-6 md:px-12 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {carouselImages.map((img, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[75vw] sm:w-[45vw] md:w-[30vw] aspect-[3/2] rounded-xl overflow-hidden snap-start"
              >
                <img
                  src={img}
                  alt={`صورة ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  width={1280}
                  height={864}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RESTAURANT CARDS (matching official site) ===== */}
      <section className="pb-10 md:pb-16">
        <div className="container mx-auto px-6 md:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-4xl font-bold text-foreground mb-6 gold-sparkle"
          >
            {t("restaurants.sectionTitle")}
          </motion.h2>

          {/* Search bar */}
          <div className="relative mb-8">
            <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(INITIAL_COUNT); }}
              placeholder={t("restaurants.searchPlaceholder")}
              className={`w-full ${isRtl ? "pr-7 pl-4" : "pl-7 pr-4"} py-3 bg-transparent border-b border-border/60 dark:border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 dark:focus:border-gold transition-colors`}
            />
          </div>

          {/* Category filter tabs */}
          <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8 overflow-x-auto scrollbar-hide -mx-6 px-6 md:-mx-12 md:px-12 snap-x snap-mandatory" dir="rtl" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setVisibleCount(INITIAL_COUNT); }}
                className={`relative whitespace-nowrap flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-medium border transition-all duration-300 snap-start ${
                  activeCategory === cat
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-transparent text-muted-foreground border-border hover:border-accent/40 hover:text-foreground/80"
                }`}
              >
                <span>{cat}</span>
                <sup className={`text-[10px] mr-1 -top-1 ${activeCategory === cat ? "text-background/60" : "text-muted-foreground/40"}`}>
                  {getCategoryCount(cat)}
                </sup>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            >
              {visibleRestaurants.map((restaurant, i) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 30, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="group relative rounded-2xl overflow-hidden aspect-[4/3]">
                    {/* Full-bleed image */}
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent dark:from-black/70 dark:via-black/20 dark:to-transparent" />

                    {/* Logo overlay - top right */}
                    <div className="absolute top-3 right-3 w-[60px] h-[60px] md:w-[70px] md:h-[70px] bg-background rounded-lg shadow-lg flex items-center justify-center p-2">
                      <img
                        src={restaurant.logo}
                        alt={`${restaurant.name} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Bottom overlay content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-right">
                      <span className="text-background/70 text-xs block mb-0.5">
                        {restaurant.cuisine}
                      </span>
                      <h3 className="font-display text-lg md:text-xl font-bold text-background mb-3">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-3 justify-end flex-wrap">
                <Link
                          to={`/tickets?restaurant=${encodeURIComponent(restaurant.name)}`}
                          className="inline-flex items-center justify-center px-6 py-2.5 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors btn-press glow-gold-hover"
                        >
                          {t("restaurants.bookNow")}
                        </Link>
                        <Link
                          to={`/restaurant/${restaurant.id}`}
                          className="inline-flex items-center gap-1.5 text-background/90 text-sm font-medium hover:text-background transition-colors"
                        >
                          {t("restaurants.learnMore")}
                          {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="px-8 py-3 border-2 border-gold/30 text-foreground rounded-full text-sm font-medium hover:border-gold/60 hover:bg-gold/5 transition-all btn-luxury btn-press"
              >
                {t("restaurants.loadMore")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== HOURS SECTION ===== */}
      <section className="py-8 md:py-12 bg-card border-t border-gold/20">
        <div className="container mx-auto px-6 md:px-12">
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground text-right mb-5">
            {t("restaurants.hours")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                area: "الطريف",
                lines: [
                  { label: "اول يوم عيد", time: "2:00 مساءً - 12:00 ليلاً" },
                  { label: "ثاني وثالث يوم عيد الفطر", time: "10:00 صباحاً - 12:00 ليلاً" },
                ],
              },
              {
                area: "مطل البجيري",
                lines: [
                  { label: "اول ايام عيد الفطر", time: "6:00 صباحاً - 2:00 ليلاً" },
                  { label: "ثاني و ثالث يوم عيد الفطر", time: "9:00 صباحاً - 2:00 ليلاً" },
                ],
                extra: "خدمة صف السيارات 195 ريال",
              },
              {
                area: "زلّال",
                lines: [
                  { label: "اول ايام عيد الفطر", time: "6:00 صباحاً - 2:00 ليلاً" },
                  { label: "ثاني و ثالث يوم عيد الفطر", time: "9:00 صباحاً - 2:00 ليلاً" },
                ],
                extra: "خدمة صف السيارات 195 ريال",
              },
            ].map((item) => (
              <div key={item.area} className="bg-background rounded-lg p-6 text-right border border-border">
                <h4 className="font-display text-lg font-bold text-foreground mb-4">{item.area}</h4>
                <div className="space-y-2">
                  {item.lines.map((line, idx) => (
                    <div key={idx}>
                      <p className="text-muted-foreground text-xs">{line.label}</p>
                      <p className="text-foreground text-sm font-medium">{line.time}</p>
                    </div>
                  ))}
                </div>
                {item.extra && (
                  <p className="text-primary text-xs mt-4 font-medium underline underline-offset-2 cursor-pointer">
                    {item.extra}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INSTAGRAM SECTION ===== */}
      <section className="py-10 md:py-16 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-10">
            <p className="text-muted-foreground text-xs tracking-widest uppercase mb-2">{t("restaurants.instagram.label")}</p>
            <h3 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-4">
              {t("restaurants.instagram.title")}
            </h3>
            <a
              href="https://www.instagram.com/bujairiterrace/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline underline-offset-4"
            >
              <Instagram className="w-4 h-4" />
              {t("restaurants.instagram.follow")}
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {carouselImages.concat(carouselImages.slice(0, 2)).map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="aspect-square rounded-lg overflow-hidden group cursor-pointer"
              >
                <img
                  src={img}
                  alt={`منشور انستغرام ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Restaurants;