import { motion } from "framer-motion";
import { Clock, Car } from "lucide-react";

const locations = [
  {
    name: "المطل",
    hours: [
      { label: "الأحد - الأربعاء", time: "١٢:٠٠ ظهراً - ١٢:٠٠ ليلاً" },
      { label: "الخميس - السبت", time: "١٢:٠٠ ظهراً - ١:٠٠ ليلاً" },
    ],
    valet: "خدمة صف السيارات ١٩٥ ريال",
  },
  {
    name: "واحة النخيل",
    hours: [
      { label: "الأحد - الأربعاء", time: "٥:٠٠ مساءً - ١٢:٠٠ ليلاً" },
      { label: "الخميس - السبت", time: "٥:٠٠ مساءً - ١:٠٠ ليلاً" },
    ],
    valet: "خدمة صف السيارات ١٩٥ ريال",
  },
  {
    name: "سوق التوابل",
    hours: [
      { label: "الأحد - الأربعاء", time: "١٠:٠٠ صباحاً - ١١:٠٠ مساءً" },
      { label: "الخميس - السبت", time: "١٠:٠٠ صباحاً - ١٢:٠٠ ليلاً" },
    ],
    valet: null,
  },
];

const HoursSection = () => {
  return (
    <section id="hours" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-right mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            ساعات العمل
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {locations.map((loc, i) => (
            <motion.div
              key={loc.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-border rounded-sm p-6"
            >
              <h3 className="font-display text-xl font-bold text-foreground mb-5 pb-3 border-b border-border">
                {loc.name}
              </h3>

              <div className="space-y-3 mb-5">
                {loc.hours.map((h) => (
                  <div key={h.label} className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-muted-foreground block">{h.label}</span>
                      <span className="text-sm text-foreground">{h.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {loc.valet && (
                <div className="flex items-center gap-2 text-xs bg-gold/10 text-gold-dark px-3 py-2 rounded-sm">
                  <Car className="w-3.5 h-3.5" />
                  <span>{loc.valet}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HoursSection;
