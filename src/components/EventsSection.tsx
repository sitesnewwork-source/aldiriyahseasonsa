import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import eventCalligraphy from "@/assets/event-calligraphy-2.jpg";
import eventKidsArt from "@/assets/event-kids-art.jpg";
import eventArdah from "@/assets/event-ardah-2.jpg";

const EventsSection = () => {
  const { t, isRtl } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const events = [
    {
      title: t("events.calligraphy"),
      badge: t("events.badge"),
      image: eventCalligraphy,
      tags: [{ icon: "🏛", label: t("events.tagHistory") }],
      extra: "+1",
    },
    {
      title: t("events.kidsArt"),
      badge: t("events.badge"),
      image: eventKidsArt,
      tags: [{ icon: "🎭", label: t("events.tagArts") }],
    },
    {
      title: t("events.ardah"),
      badge: t("events.badge"),
      image: eventArdah,
      tags: [{ icon: "🏛", label: t("events.tagHistory") }],
      extra: "+2",
    },
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section id="events" className="py-8 sm:py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col-reverse sm:flex-row items-start sm:items-start justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-foreground/20 text-foreground flex items-center justify-center hover:border-foreground/40 transition-colors"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="w-full sm:w-auto">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3">
              {t("events.sectionTitle")}
            </h2>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline underline-offset-4"
            >
              {t("events.viewAll")}
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {events.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 w-[260px] sm:w-[300px] md:w-[380px] cursor-pointer group snap-start"
            >
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-2 sm:mb-3">
                <img
                  src={event.image}
                  alt={event.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-primary text-primary-foreground text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 sm:py-1.5 rounded-md">
                  {event.badge}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-row-reverse justify-end flex-wrap">
                {event.tags.map((tag) => (
                  <span
                    key={tag.label}
                    className="inline-flex items-center gap-1 text-xs sm:text-sm text-foreground bg-muted px-2 sm:px-3 py-1 sm:py-1.5 rounded-full"
                  >
                    <span>{tag.icon}</span>
                    {tag.label}
                  </span>
                ))}
                {event.extra && (
                  <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                    {event.extra}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
