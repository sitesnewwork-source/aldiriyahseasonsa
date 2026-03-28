import { memo } from "react";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import OptimizedImage from "./OptimizedImage";

import foodSpread from "@/assets/food-spread.jpg";
import foodDessert from "@/assets/food-dessert.jpg";
import foodCoffee from "@/assets/food-coffee.jpg";
import foodSushi from "@/assets/food-sushi.jpg";
import foodPasta from "@/assets/food-pasta.jpg";
import foodPastry from "@/assets/food-pastry.jpg";
import saudiImg from "@/assets/restaurant-saudi.jpg";
import italianImg from "@/assets/restaurant-italian.jpg";
import frenchImg from "@/assets/restaurant-french.jpg";
import fusionImg from "@/assets/restaurant-fusion.jpg";
import japaneseImg from "@/assets/restaurant-japanese.jpg";
import terraceImg from "@/assets/place-terrace.jpg";

const igImages = [
  foodSpread, saudiImg, foodDessert, italianImg,
  foodCoffee, frenchImg, foodSushi, fusionImg,
  foodPasta, japaneseImg, foodPastry, terraceImg,
];

const InstagramSection = () => {
  const { t } = useLanguage();

  return (
    <section id="instagram" className="py-8 sm:py-12 md:py-16 bg-sand-pattern">
      <div className="container mx-auto px-4 sm:px-6 mb-4 sm:mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-muted-foreground text-xs sm:text-sm block mb-1">{t("instagram.label")}</span>
          <div className="flex items-center justify-between gap-3">
            <a
              href="https://www.instagram.com/diriyahgate/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-foreground text-foreground text-[10px] sm:text-xs rounded-sm hover:bg-foreground hover:text-background transition-all flex-shrink-0"
            >
              <Instagram className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{t("instagram.follow")}</span>
            </a>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              {t("instagram.title")}
            </h2>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0.5 sm:gap-1 md:gap-2 px-0.5 sm:px-1 md:px-2">
        {igImages.map((img, i) => (
          <motion.a
            key={i}
            href="https://www.instagram.com/diriyahgate/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className="aspect-square overflow-hidden group relative"
          >
            <OptimizedImage
              src={img}
              alt=""
              width={300}
              height={300}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-earth/0 group-hover:bg-earth/40 transition-all duration-300 flex items-center justify-center">
              <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
};

export default InstagramSection;
