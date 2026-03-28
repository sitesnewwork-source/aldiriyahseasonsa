import { motion } from "framer-motion";
import ParallaxHero from "@/components/ParallaxHero";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, MapPin, Car, Ticket, HelpCircle, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import BackButton from "@/components/BackButton";
import placeBujairi from "@/assets/place-bujairi.jpg";

const planSections = [
  {
    icon: Clock,
    title: "ساعات العمل", titleEn: "Working Hours",
    items: [
      {
        area: "الطريف", areaEn: "At-Turaif",
        lines: [
          { label: "السبت – الخميس", labelEn: "Sat – Thu", time: "10:00 صباحاً – 12:00 منتصف الليل", timeEn: "10:00 AM – 12:00 AM" },
          { label: "الجمعة", labelEn: "Friday", time: "2:00 مساءً – 12:00 منتصف الليل", timeEn: "2:00 PM – 12:00 AM" },
        ],
      },
      {
        area: "مطل البجيري", areaEn: "Bujairi Terrace",
        lines: [
          { label: "أيام الأسبوع", labelEn: "Weekdays", time: "9:00 صباحاً – 12:00 منتصف الليل", timeEn: "9:00 AM – 12:00 AM" },
          { label: "نهاية الأسبوع", labelEn: "Weekends", time: "9:00 صباحاً – 1:00 صباحاً", timeEn: "9:00 AM – 1:00 AM" },
        ],
      },
      {
        area: "الزلّال", areaEn: "Zallal",
        lines: [
          { label: "السبت – الخميس", labelEn: "Sat – Thu", time: "10:00 صباحاً – 11:00 مساءً", timeEn: "10:00 AM – 11:00 PM" },
          { label: "الجمعة", labelEn: "Friday", time: "2:00 مساءً – 11:00 مساءً", timeEn: "2:00 PM – 11:00 PM" },
        ],
      },
    ],
  },
];

const tips = [
  { icon: Ticket, title: "التذاكر", titleEn: "Tickets", desc: "تصريح الدخول متوفر عبر الموقع أو عند البوابات. الأطفال دون 6 سنوات مجاناً.", descEn: "Entry pass available online or at the gates. Children under 6 enter free.", link: "/tickets" },
  { icon: Car, title: "الوصول والمواقف", titleEn: "Access & Parking", desc: "مواقف سيارات مجانية متوفرة. خدمة صف السيارات (فاليه) بـ 195 ريال في مطل البجيري.", descEn: "Free parking available. Valet parking service at 195 SAR at Bujairi Terrace." },
  { icon: MapPin, title: "الموقع", titleEn: "Location", desc: "الدرعية، شمال غرب الرياض. يسهل الوصول عبر طريق الملك خالد أو طريق الملك فهد.", descEn: "Diriyah, northwest of Riyadh. Easy access via King Khalid Road or King Fahd Road." },
  { icon: HelpCircle, title: "نصائح عامة", titleEn: "General Tips", desc: "ارتدِ أحذية مريحة، أحضر واقي شمس في النهار، وخصص 3-4 ساعات للزيارة الكاملة.", descEn: "Wear comfortable shoes, bring sunscreen during the day, and allow 3-4 hours for a full visit." },
  { icon: Phone, title: "تواصل معنا", titleEn: "Contact Us", desc: "للاستفسارات والحجوزات، تواصل معنا عبر الهاتف أو صفحة التواصل.", descEn: "For inquiries and reservations, contact us by phone or through the contact page.", link: "/contact" },
];

const PlanVisit = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <SEOHead title={isAr ? "خطط لزيارتك" : "Plan Your Visit"} description={isAr ? "كل ما تحتاج معرفته لتخطيط زيارتك للدرعية" : "Everything you need to plan your Diriyah visit"} path="/plan" />
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-2">
        <BackButton />
      </div>

      <ParallaxHero image={placeBujairi} alt={isAr ? "خطط لزيارتك" : "Plan Your Visit"} height="h-[45vh] md:h-[55vh]">
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container mx-auto px-6 pb-10 md:pb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 text-white/60 text-xs sm:text-sm mb-4">
                <Link to="/" className="hover:text-white transition-colors">{isAr ? "الرئيسية" : "Home"}</Link>
                <ChevronIcon className="w-3 h-3" />
                <span className="text-white">{isAr ? "خطط لزيارتك" : "Plan Your Visit"}</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                {isAr ? "خطط لزيارتك" : "Plan Your Visit"}
              </h1>
              <p className="text-white/70 text-sm md:text-lg mt-3 max-w-xl">
                {isAr ? "كل ما تحتاج معرفته لتجربة لا تُنسى في الدرعية" : "Everything you need for an unforgettable Diriyah experience"}
              </p>
            </motion.div>
          </div>
        </div>
      </ParallaxHero>

      <section className="py-14 md:py-20">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`${isAr ? "text-right" : "text-left"} mb-10`}>
            <h2 className={`font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3 ${isAr ? "justify-end" : "justify-start"}`}>
              {isAr ? "ساعات العمل" : "Working Hours"}
              <Clock className="w-6 h-6 text-gold" />
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {planSections[0].items.map((item, i) => (
              <motion.div key={isAr ? item.area : item.areaEn} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`bg-card rounded-lg border border-border p-6 ${isAr ? "text-right" : "text-left"}`}>
                <h3 className="font-display text-lg font-bold text-foreground mb-4 pb-3 border-b border-border">
                  {isAr ? item.area : item.areaEn}
                </h3>
                <div className="space-y-3">
                  {item.lines.map((line) => (
                    <div key={isAr ? line.label : line.labelEn}>
                      <p className="text-xs text-muted-foreground">{isAr ? line.label : line.labelEn}</p>
                      <p className="text-sm font-medium text-foreground">{isAr ? line.time : line.timeEn}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-card border-t border-border">
        <div className="container mx-auto px-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`font-display text-2xl md:text-3xl font-bold text-foreground ${isAr ? "text-right" : "text-left"} mb-10`}>
            {isAr ? "معلومات مهمة" : "Important Information"}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tips.map((tip, i) => (
              <motion.div key={isAr ? tip.title : tip.titleEn} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className={`bg-background rounded-lg border border-border p-6 ${isAr ? "text-right" : "text-left"}`}>
                <div className={`flex items-center gap-3 ${isAr ? "justify-end" : "justify-start"} mb-3`}>
                  {!isAr && <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center"><tip.icon className="w-5 h-5 text-gold" /></div>}
                  <h3 className="font-display text-base font-bold text-foreground">{isAr ? tip.title : tip.titleEn}</h3>
                  {isAr && <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center"><tip.icon className="w-5 h-5 text-gold" /></div>}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{isAr ? tip.desc : tip.descEn}</p>
                {tip.link && (
                  <Link to={tip.link} className="inline-block mt-3 text-sm text-primary hover:underline underline-offset-4 font-medium">
                    {isAr ? "المزيد ←" : "Learn More →"}
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PlanVisit;
