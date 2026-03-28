import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { restaurants as allRestaurants } from "@/data/restaurants";
import { useLanguage } from "@/i18n/LanguageContext";
import OptimizedImage from "./OptimizedImage";

const previewRestaurants = allRestaurants.slice(0, 5);

const RestaurantsPreview = () => {
  const { t, isRtl } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-sand-pattern">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4 sm:mb-5">
          <span className="text-primary text-xs sm:text-sm block mb-3">{t("restaurantPreview.label")}</span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold text-foreground leading-relaxed max-w-3xl mx-auto whitespace-pre-line">
            {t("restaurantPreview.heading")}
          </h2>
        </div>

        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 border-primary/30 text-primary flex items-center justify-center hover:border-primary/50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline underline-offset-4"
          >
            {t("restaurantPreview.viewAll")}
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 sm:gap-7 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {previewRestaurants.map((rest, i) => (
            <motion.div
              key={rest.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex-shrink-0 w-[260px] sm:w-[320px] md:w-[380px] snap-start"
            >
              <Link to={`/restaurant/${rest.id}`} className="group block">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
                    <OptimizedImage
                      src={rest.image}
                      alt={rest.name}
                      width={760}
                      height={950}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl shadow-lg flex items-center justify-center p-2 sm:p-3">
                    <img
                      src={rest.logo}
                      alt={`${rest.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RestaurantsPreview;
