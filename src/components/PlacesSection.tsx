import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { places } from "@/data/places";
import { useLanguage } from "@/i18n/LanguageContext";
import OptimizedImage from "./OptimizedImage";
import { useIsMobile } from "@/hooks/use-mobile";
import TextReveal from "./TextReveal";

const PlaceCard = ({ place, index }: { place: typeof places[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [isMobile ? 15 : 30, isMobile ? -15 : -30]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.97, 1, 0.97]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      style={{ scale }}
    >
      <Link
        to={`/place/${place.id}`}
        className="group relative rounded-lg overflow-hidden cursor-pointer aspect-[3/4] block"
      >
        <motion.div style={{ y }} className="absolute inset-0">
          <OptimizedImage
            src={place.image}
            alt={place.name}
            width={640}
            height={800}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-earth/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
          <h3 className="font-display text-sm sm:text-lg md:text-xl font-bold text-cream">
            {place.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
};

const PlacesSection = () => {
  const { t } = useLanguage();

  return (
    <section id="places" className="py-8 sm:py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-5 sm:mb-6">
          <TextReveal>
            <span className="text-muted-foreground text-xs sm:text-sm block mb-1">{t("places.label")}</span>
          </TextReveal>
          <TextReveal delay={0.1}>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              {t("places.heading")}
            </h2>
          </TextReveal>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {places.map((place, i) => (
            <PlaceCard key={place.id} place={place} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlacesSection;
