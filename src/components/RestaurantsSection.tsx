import { useState } from "react";
import { motion } from "framer-motion";
import RestaurantCard from "./RestaurantCard";
import { actionNotify } from "@/hooks/use-action-notify";

import italianImg from "@/assets/restaurant-italian.jpg";
import frenchImg from "@/assets/restaurant-french.jpg";
import saudiImg from "@/assets/restaurant-saudi.jpg";
import fusionImg from "@/assets/restaurant-fusion.jpg";
import japaneseImg from "@/assets/restaurant-japanese.jpg";

const categories = ["الكل", "سعودي", "إيطالي", "فرنسي", "ياباني", "عالمي"];

const restaurants = [
  {
    name: "دار النخيل",
    cuisine: "سعودي",
    description: "تجربة طعام سعودية أصيلة تجمع بين نكهات الماضي وإبداع الحاضر، في أجواء نجدية تراثية فريدة.",
    image: saudiImg,
    hours: "١٢:٠٠ ظهراً - ١٢:٠٠ ليلاً",
  },
  {
    name: "لا تيرازا",
    cuisine: "إيطالي",
    description: "مطعم إيطالي فاخر يقدّم أشهى المعكرونات الطازجة والبيتزا المحضّرة بعناية من أجود المكونات.",
    image: italianImg,
    hours: "١:٠٠ ظهراً - ١١:٣٠ مساءً",
  },
  {
    name: "لو جاردان",
    cuisine: "فرنسي",
    description: "باتيسري ومقهى فرنسي راقي يقدّم أرقى الحلويات والمعجنات الباريسية مع القهوة الفاخرة.",
    image: frenchImg,
    hours: "٨:٠٠ صباحاً - ١١:٠٠ مساءً",
  },
  {
    name: "سطح الدرعية",
    cuisine: "عالمي",
    description: "تجربة طعام على السطح مع إطلالة ساحرة على الدرعية التاريخية، وقائمة متنوعة من المأكولات العالمية.",
    image: fusionImg,
    hours: "٥:٠٠ مساءً - ١:٠٠ ليلاً",
  },
  {
    name: "ساكورا",
    cuisine: "ياباني",
    description: "فن الطهي الياباني يلتقي بالضيافة العربية، مع سوشي طازج وأطباق تيبانياكي محضّرة أمامكم.",
    image: japaneseImg,
    hours: "١٢:٣٠ ظهراً - ١١:٣٠ مساءً",
  },
];

const RestaurantsSection = () => {
  const [activeCategory, setActiveCategory] = useState("الكل");

  const filtered = activeCategory === "الكل"
    ? restaurants
    : restaurants.filter((r) => r.cuisine === activeCategory);

  return (
    <section id="restaurants" className="py-20 md:py-28 bg-sand-pattern">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-gold text-sm tracking-[0.2em] uppercase mb-3 block">
            اكتشف
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            مطاعم الموسم
          </h2>
          <div className="w-16 h-[2px] bg-gradient-gold mx-auto mb-4" />
          <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
            تشكيلة مميزة من أرقى المطاعم العالمية والمحلية في وجهة واحدة
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-12 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); actionNotify({ message: cat, icon: "🍽️", sound: "soft" }); }}
              className={`px-4 py-2 rounded-sm text-sm transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-accent text-accent-foreground font-bold"
                  : "bg-sand-dark text-muted-foreground hover:text-foreground hover:bg-sand-dark/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Restaurant grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered.map((restaurant, i) => (
            <RestaurantCard
              key={restaurant.name}
              {...restaurant}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RestaurantsSection;
