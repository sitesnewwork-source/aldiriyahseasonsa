import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import BackButton from "@/components/BackButton";
import { articles } from "@/data/articles";

const Articles = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;
  const ReadMoreArrow = isAr ? ArrowLeft : ArrowRight;

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(articles.map(a => isAr ? a.category : a.categoryEn));
    return Array.from(cats);
  }, [isAr]);

  const filtered = useMemo(() => {
    return articles.filter(article => {
      const matchesCategory = !activeCategory || (isAr ? article.category : article.categoryEn) === activeCategory;
      if (!search.trim()) return matchesCategory;
      const q = search.toLowerCase();
      const matchesSearch =
        article.title.toLowerCase().includes(q) ||
        article.titleEn.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.excerptEn.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory, isAr]);

  const featured = filtered.length > 0 && !search && !activeCategory ? filtered[0] : null;
  const grid = featured ? filtered.slice(1) : filtered;

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <SEOHead title={isAr ? "مقالات" : "Articles"} description={isAr ? "مقالات ومحتوى ثقافي عن الدرعية" : "Articles and cultural content about Diriyah"} path="/articles" />
      <Header />

      <section className="pt-20 sm:pt-28 pb-6 sm:pb-8 bg-gradient-to-b from-gold/5 to-background dark:from-gold/10 dark:to-background">
        <div className="container mx-auto px-6">
          <BackButton />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={isAr ? "text-right" : "text-left"}>
            <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mb-4">
              <Link to="/" className="hover:text-foreground transition-colors">{isAr ? "الرئيسية" : "Home"}</Link>
              <ChevronIcon className="w-3 h-3" />
              <span className="text-foreground">{isAr ? "مقالات" : "Articles"}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3">
              {isAr ? "مقالات" : "Articles"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              {isAr ? "اقرأ عن تاريخ الدرعية وثقافتها ووجهاتها المميزة" : "Read about Diriyah's history, culture, and unique destinations"}
            </p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isAr ? "right-3" : "left-3"}`} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isAr ? "ابحث في المقالات..." : "Search articles..."}
                className={`w-full h-10 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${isAr ? "pr-10 pl-9" : "pl-10 pr-9"}`}
              />
              {search && (
                <button onClick={() => setSearch("")} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isAr ? "left-3" : "right-3"}`}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!activeCategory ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {isAr ? "الكل" : "All"}
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      <AnimatePresence mode="wait">
        {featured && (
          <section className="pb-8">
            <div className="container mx-auto px-6">
              <Link to={`/article/${featured.id}`} className="group block">
                <motion.div key={featured.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative aspect-[21/9] rounded-lg overflow-hidden dark:ring-1 dark:ring-border">
                  <img src={featured.image} alt={isAr ? featured.title : featured.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent dark:from-black/80" />
                  <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-10 ${isAr ? "text-right" : "text-left"}`}>
                    <span className="inline-block bg-primary text-primary-foreground text-xs px-3 py-1 rounded-md mb-3">
                      {isAr ? featured.category : featured.categoryEn}
                    </span>
                    <h2 className="font-display text-xl md:text-3xl font-bold text-white mb-2">
                      {isAr ? featured.title : featured.titleEn}
                    </h2>
                    <p className="text-white/70 text-sm md:text-base max-w-2xl hidden sm:block">
                      {isAr ? featured.excerpt : featured.excerptEn}
                    </p>
                  </div>
                </motion.div>
              </Link>
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* Grid */}
      <section className="pb-10 sm:pb-16">
        <div className="container mx-auto px-6">
          {grid.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
              <AnimatePresence mode="popLayout">
                {grid.map((article, i) => (
                  <motion.div
                    key={article.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={`/article/${article.id}`} className="group block">
                      <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-4 dark:ring-1 dark:ring-border">
                        <img src={article.image} alt={isAr ? article.title : article.titleEn} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className={`absolute top-3 ${isAr ? "right-3" : "left-3"} bg-muted/90 backdrop-blur-sm text-foreground text-xs px-3 py-1 rounded-md`}>
                          {isAr ? article.category : article.categoryEn}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{isAr ? article.date : article.dateEn}</p>
                      <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {isAr ? article.title : article.titleEn}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{isAr ? article.excerpt : article.excerptEn}</p>
                      <span className="inline-flex items-center gap-1 text-sm text-primary mt-3 font-medium">
                        {isAr ? "اقرأ المزيد" : "Read More"}
                        <ReadMoreArrow className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-medium">
                {isAr ? "لا توجد نتائج" : "No results found"}
              </p>
              <p className="text-muted-foreground/60 text-sm mt-1">
                {isAr ? "جرّب كلمات بحث مختلفة أو غيّر الفئة" : "Try different keywords or change the category"}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Articles;
