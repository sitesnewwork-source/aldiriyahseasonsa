import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import BackButton from "@/components/BackButton";
import { useLanguage } from "@/i18n/LanguageContext";
import { articles } from "@/data/articles";
import ScrollReveal from "@/components/ScrollReveal";

const ArticleDetail = () => {
  const { id } = useParams();
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  const article = articles.find((a) => a.id === id);

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir={isAr ? "rtl" : "ltr"}>
        <Header />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{isAr ? "المقال غير موجود" : "Article Not Found"}</h1>
          <Link to="/articles" className="text-primary hover:underline">{isAr ? "العودة للمقالات" : "Back to Articles"}</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const content = isAr ? article.content : article.contentEn;
  const currentIndex = articles.findIndex((a) => a.id === id);
  const relatedArticles = articles.filter((a) => a.id !== id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <SEOHead
        title={isAr ? article.title : article.titleEn}
        description={isAr ? article.excerpt : article.excerptEn}
        path={`/article/${article.id}`}
      />
      <Header />

      {/* Hero */}
      <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <motion.img
          src={article.image}
          alt={isAr ? article.title : article.titleEn}
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-12 ${isAr ? "text-right" : "text-left"}`}>
          <div className="container mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <span className="inline-block bg-primary text-primary-foreground text-xs px-3 py-1 rounded-md mb-3">
                {isAr ? article.category : article.categoryEn}
              </span>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-3xl leading-tight">
                {isAr ? article.title : article.titleEn}
              </h1>
              <div className="flex items-center gap-4 text-white/70 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {isAr ? article.date : article.dateEn}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {isAr ? article.readTime : article.readTimeEn}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="border-b border-border/50 bg-muted/30">
        <div className="container mx-auto px-6 py-3">
          <BackButton />
          <div className="flex items-center gap-2 text-muted-foreground text-xs mt-2">
            <Link to="/" className="hover:text-foreground transition-colors">{isAr ? "الرئيسية" : "Home"}</Link>
            <ChevronIcon className="w-3 h-3" />
            <Link to="/articles" className="hover:text-foreground transition-colors">{isAr ? "مقالات" : "Articles"}</Link>
            <ChevronIcon className="w-3 h-3" />
            <span className="text-foreground truncate max-w-[200px]">{isAr ? article.title : article.titleEn}</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-10 sm:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            {/* Excerpt */}
            <ScrollReveal>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 font-medium border-s-4 border-primary ps-5">
                {isAr ? article.excerpt : article.excerptEn}
              </p>
            </ScrollReveal>

            {/* Body */}
            {content.map((paragraph, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <p className="text-base sm:text-lg text-foreground/85 leading-[1.9] mb-6">
                  {paragraph}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </article>

      {/* Related Articles */}
      <section className="py-10 sm:py-16 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
              {isAr ? "مقالات ذات صلة" : "Related Articles"}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((related, i) => {
              const ReadMoreArrow = isAr ? ArrowLeft : ArrowRight;
              return (
                <ScrollReveal key={related.id} delay={i * 0.1}>
                  <Link to={`/article/${related.id}`} className="group block">
                    <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-4 dark:ring-1 dark:ring-border">
                      <img
                        src={related.image}
                        alt={isAr ? related.title : related.titleEn}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className={`absolute top-3 ${isAr ? "right-3" : "left-3"} bg-muted/90 backdrop-blur-sm text-foreground text-xs px-3 py-1 rounded-md`}>
                        {isAr ? related.category : related.categoryEn}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{isAr ? related.date : related.dateEn}</p>
                    <h3 className="font-display text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {isAr ? related.title : related.titleEn}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                      {isAr ? "اقرأ المزيد" : "Read More"}
                      <ReadMoreArrow className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArticleDetail;
