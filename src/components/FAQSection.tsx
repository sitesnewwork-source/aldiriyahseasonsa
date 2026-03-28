import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarCheck, ParkingCircle, UtensilsCrossed, ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { actionNotify } from "@/hooks/use-action-notify";

const FAQSection = forwardRef<HTMLElement>((_, ref) => {
  const { t, isRtl } = useLanguage();
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const faqCategories = [
    {
      icon: UtensilsCrossed,
      title: t("faq.season"),
      question: t("faq.sampleQ1"),
      faqs: [
        { q: t("faq.q1"), a: t("faq.a1") },
        { q: t("faq.q2"), a: t("faq.a2") },
      ],
    },
    {
      icon: ParkingCircle,
      title: t("faq.parking"),
      question: t("faq.sampleQ2"),
      faqs: [
        { q: t("faq.q3"), a: t("faq.a3") },
        { q: t("faq.q4"), a: t("faq.a4") },
      ],
    },
    {
      icon: CalendarCheck,
      title: t("faq.access"),
      question: t("faq.sampleQ3"),
      faqs: [
        { q: t("faq.q5"), a: t("faq.a5") },
        { q: t("faq.q6"), a: t("faq.a6") },
      ],
    },
  ];

  return (
    <section id="faq" className="py-8 sm:py-12 md:py-16 bg-sand-pattern">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 sm:mb-8"
        >
          {t("faq.heading")}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {faqCategories.map((cat, i) => {
            const Icon = cat.icon;
            const isExpanded = expandedCategory === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card border border-border rounded-lg p-6 sm:p-8 flex flex-col items-center text-center"
              >
                <div className="text-primary mb-5">
                  <Icon className="w-8 h-8 sm:w-9 sm:h-9" strokeWidth={1.5} />
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4 leading-snug">
                  {cat.title}
                </h3>

                <div className="w-16 h-px bg-border mb-5" />

                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                  {cat.question}
                </p>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full overflow-hidden mb-4"
                    >
                      <div className="space-y-2">
                        {cat.faqs.map((faq) => (
                          <div key={faq.q} className="border border-border/50 rounded-md overflow-hidden">
                            <button
                              onClick={() => { const isOpen = openFaq === faq.q; setOpenFaq(isOpen ? null : faq.q); if (!isOpen) actionNotify({ message: isRtl ? "عرض الإجابة" : "Showing answer", icon: "💡", sound: "soft" }); }}
                              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/30 transition-colors gap-2"
                            >
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-primary flex-shrink-0 transition-transform duration-200 ${openFaq === faq.q ? "rotate-180" : ""}`}
                              />
                              <span className="text-xs font-medium text-foreground flex-1">{faq.q}</span>
                            </button>
                            <AnimatePresence>
                              {openFaq === faq.q && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <p className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-border/30 pt-2">
                                    {faq.a}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : i)}
                  className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline underline-offset-4 mt-auto"
                >
                  {t("faq.explore")}
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

FAQSection.displayName = "FAQSection";

export default FAQSection;
