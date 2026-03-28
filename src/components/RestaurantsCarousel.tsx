import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { restaurants } from "@/data/restaurants";

const RestaurantsCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -420 : 420,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="restaurants" className="py-20 md:py-28 bg-sand-pattern">
      <div className="container mx-auto px-6 mb-10">
        <div className="flex items-end justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-right"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              تجربة أصيلة وأجواء دافئة
            </h2>
          </motion.div>

          <div className="flex gap-2">
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-colors text-muted-foreground"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-colors text-muted-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-6 pb-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {restaurants.map((restaurant, i) => (
          <motion.div
            key={restaurant.id}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex-shrink-0 w-[320px] md:w-[400px] group cursor-pointer"
          >
            <div className="relative h-[260px] md:h-[320px] overflow-hidden rounded-sm mb-4">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                loading="lazy"
                width={800}
                height={600}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-sm overflow-hidden flex-shrink-0 border border-border">
                <img
                  src={restaurant.logo}
                  alt=""
                  loading="lazy"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <span className="text-muted-foreground text-xs">{restaurant.cuisine}</span>
                <h3 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-gold-dark transition-colors">
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-3">
                  {restaurant.hasBooking && (
                    <Link
                      to={`/restaurant/${restaurant.id}`}
                      className="px-4 py-2 bg-accent text-accent-foreground text-xs font-bold rounded-sm hover:bg-accent/90 transition-colors"
                    >
                      احجز الآن
                    </Link>
                  )}
                  <Link
                    to={`/restaurant/${restaurant.id}`}
                    className="text-foreground text-xs underline underline-offset-4 hover:text-gold-dark transition-colors"
                  >
                    لمعرفة المزيد
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <button className="px-6 py-2.5 border border-foreground text-foreground text-sm rounded-sm hover:bg-foreground hover:text-background transition-all">
          تحميل المزيد
        </button>
      </div>
    </section>
  );
};

export default RestaurantsCarousel;
