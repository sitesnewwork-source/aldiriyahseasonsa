import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { places } from "@/data/places";
import { useLanguage } from "@/i18n/LanguageContext";
import OptimizedImage from "./OptimizedImage";

const PlacesSection = () => {
  const { t } = useLanguage();

  return (
    <section id="places" className="py-8 sm:py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-5 sm:mb-6">
          <span className="text-muted-foreground text-xs sm:text-sm block mb-1">{t("places.label")}</span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            {t("places.heading")}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {places.map((place, i) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/place/${place.id}`}
                className="group relative rounded-lg overflow-hidden cursor-pointer aspect-[3/4] block"
              >
                <OptimizedImage
                  src={place.image}
                  alt={place.name}
                  width={640}
                  height={800}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-earth/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                  <h3 className="font-display text-sm sm:text-lg md:text-xl font-bold text-cream">
                    {place.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlacesSection;
