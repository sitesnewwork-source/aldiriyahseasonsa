import { Link } from "react-router-dom";
import { articles } from "@/data/articles";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowLeft, ArrowRight, Clock, Calendar } from "lucide-react";

const LatestArticles = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const latest = articles.slice(0, 3);

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {isAr ? "أحدث المقالات" : "Latest Articles"}
            </h2>
            <p className="text-muted-foreground text-lg">
              {isAr ? "اقرأ آخر الأخبار والمقالات عن الدرعية" : "Read the latest news and articles about Diriyah"}
            </p>
          </div>
          <Link
            to="/articles"
            className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            {isAr ? "عرض الكل" : "View All"}
            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latest.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.id}`}
              className="group rounded-xl overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={article.image}
                  alt={isAr ? article.title : article.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary mb-3">
                  {isAr ? article.category : article.categoryEn}
                </span>
                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {isAr ? article.title : article.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {isAr ? article.excerpt : article.excerptEn}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {isAr ? article.date : article.dateEn}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {isAr ? article.readTime : article.readTimeEn}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          to="/articles"
          className="md:hidden flex items-center justify-center gap-2 mt-8 text-primary hover:text-primary/80 transition-colors font-medium"
        >
          {isAr ? "عرض جميع المقالات" : "View All Articles"}
          {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </Link>
      </div>
    </section>
  );
};

export default LatestArticles;
