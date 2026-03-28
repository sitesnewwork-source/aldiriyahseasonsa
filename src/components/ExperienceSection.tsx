import { useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { experiences } from "@/data/experiences";
import { useLanguage } from "@/i18n/LanguageContext";
import { actionNotify } from "@/hooks/use-action-notify";
import OptimizedImage from "./OptimizedImage";
import { useIsMobile } from "@/hooks/use-mobile";
import TextReveal from "./TextReveal";

const ExpCard = ({ exp, index }: { exp: typeof import("@/data/experiences").experiences[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [isMobile ? 10 : 20, isMobile ? -10 : -20]);

  return (
    <motion.div
      ref={ref}
      key={exp.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="flex-shrink-0 w-[240px] sm:w-[300px] md:w-[360px] snap-start"
    >
      <Link to={`/experience/${exp.id}`} className="group block">
        <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-2 sm:mb-3">
          <motion.div style={{ y: imgY }} className="absolute inset-0">
            <OptimizedImage
              src={exp.image}
              alt={exp.title}
              width={800}
              height={1000}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
          <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-muted/90 backdrop-blur-sm text-foreground text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-md z-10">
            {exp.category}
          </span>
        </div>
        <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
          {exp.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">{exp.schedule}</p>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {exp.description}
        </p>
      </Link>
    </motion.div>
  );
};

const ExperienceSection = () => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { key: "الكل", label: t("experiences.tabAll") },
    { key: "التاريخ والثقافة", label: t("experiences.tabHistory") },
    { key: "الفنون", label: t("experiences.tabArts") },
    { key: "التجارب", label: t("experiences.tabExperiences") },
  ];

  const [activeTab, setActiveTab] = useState("الكل");

  const filteredExperiences = useMemo(() => {
    if (activeTab === "الكل") return experiences;
    return experiences.filter((exp) => exp.category === activeTab);
  }, [activeTab]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="experiences" className="py-8 sm:py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-3 mb-3">
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
            <TextReveal>
              <span className="text-muted-foreground text-xs sm:text-sm block mb-1">{t("experiences.label")}</span>
            </TextReveal>
            <TextReveal delay={0.1}>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                {t("experiences.heading")}
              </h2>
            </TextReveal>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3 mb-5 sm:mb-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" }); actionNotify({ message: tab.label, icon: "🎭", sound: "soft" }); }}
              className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors whitespace-nowrap flex-shrink-0 ${
                tab.key === activeTab
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filteredExperiences.map((exp, i) => (
            <ExpCard key={exp.id} exp={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
