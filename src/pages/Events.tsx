import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import BackButton from "@/components/BackButton";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import EventBookingDialog from "@/components/EventBookingDialog";
import eventCalligraphy from "@/assets/event-calligraphy-2.jpg";
import eventKidsArt from "@/assets/event-kids-art.jpg";
import eventArdah from "@/assets/event-ardah-2.jpg";

const allEvents = [
  {
    id: "calligraphy",
    title: "ورشة الخط العربي", titleEn: "Arabic Calligraphy Workshop",
    badge: "فعالية العيد", badgeEn: "Eid Event",
    image: eventCalligraphy,
    tags: [{ icon: "🏛", label: "التاريخ والتراث", labelEn: "History & Heritage" }],
    date: "١ – ٥ شوال", dateEn: "1 – 5 Shawwal",
    time: "٤:٠٠ – ٨:٠٠ مساءً", timeEn: "4:00 – 8:00 PM",
    location: "الزلّال، الدرعية", locationEn: "Zallal, Diriyah",
    description: "تعلّم أساسيات الخط العربي على يد خطّاطين محترفين. ورشة تفاعلية تناسب جميع المستويات وتشمل جميع الأدوات والمواد.",
    descriptionEn: "Learn the basics of Arabic calligraphy from professional calligraphers. An interactive workshop suitable for all levels, with all tools and materials included.",
  },
  {
    id: "kids-art",
    title: "ورشة الرسم للأطفال", titleEn: "Kids Art Workshop",
    badge: "فعالية العيد", badgeEn: "Eid Event",
    image: eventKidsArt,
    tags: [{ icon: "🎭", label: "الفنون الأدائية", labelEn: "Performing Arts" }],
    date: "١ – ٥ شوال", dateEn: "1 – 5 Shawwal",
    time: "١٠:٠٠ صباحاً – ١:٠٠ مساءً", timeEn: "10:00 AM – 1:00 PM",
    location: "مطل البجيري، الدرعية", locationEn: "Bujairi Terrace, Diriyah",
    description: "ورشة رسم ممتعة مخصصة للأطفال من ٥ إلى ١٢ سنة. يتعلم الأطفال رسم المعالم التاريخية في الدرعية بطريقة مبتكرة.",
    descriptionEn: "A fun drawing workshop for children aged 5 to 12. Kids learn to draw Diriyah's historical landmarks in creative ways.",
  },
  {
    id: "ardah",
    title: "عرض العرضة السعودية", titleEn: "Saudi Ardah Performance",
    badge: "فعالية العيد", badgeEn: "Eid Event",
    image: eventArdah,
    tags: [{ icon: "🏛", label: "التاريخ والتراث", labelEn: "History & Heritage" }],
    date: "١ – ٣ شوال", dateEn: "1 – 3 Shawwal",
    time: "٨:٠٠ – ١٠:٠٠ مساءً", timeEn: "8:00 – 10:00 PM",
    location: "ساحة الطريف، الدرعية", locationEn: "At-Turaif Square, Diriyah",
    description: "استمتع بعرض العرضة السعودية التقليدية، الرقصة الوطنية التي تعكس الفخر والأصالة، يقدمها فريق من أمهر الفنانين الشعبيين.",
    descriptionEn: "Enjoy the traditional Saudi Ardah performance, the national dance reflecting pride and authenticity, presented by a team of the finest folk artists.",
  },
  {
    id: "poetry",
    title: "أمسية شعرية", titleEn: "Poetry Evening",
    badge: "فعالية العيد", badgeEn: "Eid Event",
    image: eventCalligraphy,
    tags: [{ icon: "📜", label: "الأدب والشعر", labelEn: "Literature & Poetry" }],
    date: "٢ – ٤ شوال", dateEn: "2 – 4 Shawwal",
    time: "٩:٠٠ – ١١:٠٠ مساءً", timeEn: "9:00 – 11:00 PM",
    location: "الزلّال، الدرعية", locationEn: "Zallal, Diriyah",
    description: "أمسية شعرية تجمع نخبة من الشعراء المحليين في أجواء تراثية ساحرة، مع القهوة السعودية والتمور.",
    descriptionEn: "A poetry evening gathering elite local poets in an enchanting heritage atmosphere, with Saudi coffee and dates.",
  },
  {
    id: "cooking",
    title: "ورشة الطبخ السعودي", titleEn: "Saudi Cooking Workshop",
    badge: "فعالية العيد", badgeEn: "Eid Event",
    image: eventKidsArt,
    tags: [{ icon: "🍽", label: "الطعام والطبخ", labelEn: "Food & Cooking" }],
    date: "١ – ٥ شوال", dateEn: "1 – 5 Shawwal",
    time: "٥:٠٠ – ٧:٠٠ مساءً", timeEn: "5:00 – 7:00 PM",
    location: "مطل البجيري، الدرعية", locationEn: "Bujairi Terrace, Diriyah",
    description: "تعلّم طبخ أشهر الأطباق السعودية التقليدية مثل الكبسة والجريش مع طهاة متخصصين. تشمل الورشة تذوق الأطباق.",
    descriptionEn: "Learn to cook famous traditional Saudi dishes like Kabsa and Jareesh with specialized chefs. The workshop includes food tasting.",
  },
  {
    id: "falconry",
    title: "عرض الصقور", titleEn: "Falconry Show",
    badge: "فعالية العيد", badgeEn: "Eid Event",
    image: eventArdah,
    tags: [{ icon: "🦅", label: "التراث والطبيعة", labelEn: "Heritage & Nature" }],
    date: "١ – ٣ شوال", dateEn: "1 – 3 Shawwal",
    time: "٤:٠٠ – ٦:٠٠ مساءً", timeEn: "4:00 – 6:00 PM",
    location: "وادي حنيفة، الدرعية", locationEn: "Wadi Hanifa, Diriyah",
    description: "شاهد عروض الصقارة التقليدية وتعرّف على أنواع الصقور وطرق تدريبها في تجربة تراثية فريدة.",
    descriptionEn: "Watch traditional falconry shows and learn about falcon species and training methods in a unique heritage experience.",
  },
];

const EventsPage = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [bookingEvent, setBookingEvent] = useState<typeof allEvents[0] | null>(null);

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <SEOHead title={isAr ? "الفعاليات" : "Events"} description={isAr ? "اكتشفوا فعاليات الدرعية" : "Discover Diriyah events"} path="/events" />
      <Header />

      <section className="pt-20 sm:pt-28 pb-6 sm:pb-8 bg-gradient-to-b from-gold/5 to-background dark:from-gold/10 dark:to-background relative overflow-hidden">
        {/* Gold decorative line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 sm:w-48 gold-line-animated z-10"><div className="h-px" /></div>
        <div className="container mx-auto px-4">
          <BackButton />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={isAr ? "text-right" : "text-left"}>
            <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mb-4">
              <Link to="/" className="hover:text-foreground transition-colors">{isAr ? "الرئيسية" : "Home"}</Link>
              <span>/</span>
              <span className="text-foreground">{isAr ? "الفعاليات" : "Events"}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 text-shimmer-gold">
              {isAr ? "فعاليات عيد الدرعية" : "Diriyah Eid Events"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              {isAr ? "اكتشف مجموعة متنوعة من الفعاليات والأنشطة الثقافية والترفيهية خلال عيد الدرعية" : "Discover a variety of cultural and entertainment events and activities during Diriyah Eid"}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-10 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {allEvents.map((event, i) => (
              <ScrollReveal key={event.id} animation={i % 3 === 0 ? "fade-up" : i % 3 === 1 ? "fade-left" : "zoom"} delay={i * 0.07} className="group cursor-pointer">
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-3 dark:ring-1 dark:ring-border">
                  <img src={event.image} alt={isAr ? event.title : event.titleEn} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent dark:from-black/50 pointer-events-none" />
                  <span className={`absolute top-3 ${isAr ? "right-3" : "left-3"} bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-md`}>
                    {isAr ? event.badge : event.badgeEn}
                  </span>
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors btn-luxury">
                  {isAr ? event.title : event.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                  {isAr ? event.description : event.descriptionEn}
                </p>
                <div className="space-y-1 text-xs text-muted-foreground dark:text-muted-foreground/80">
                  <p>📅 {isAr ? event.date : event.dateEn}</p>
                  <p>🕐 {isAr ? event.time : event.timeEn}</p>
                  <p>📍 {isAr ? event.location : event.locationEn}</p>
                </div>
                <div className={`flex items-center gap-1.5 ${isAr ? "flex-row-reverse justify-end" : "justify-start"} flex-wrap mt-3`}>
                  {event.tags.map((tag) => (
                    <span key={tag.label} className="inline-flex items-center gap-1 text-xs text-foreground bg-muted px-2 py-1 rounded-full">
                      <span>{tag.icon}</span>
                      {isAr ? tag.label : tag.labelEn}
                    </span>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="mt-3 w-full btn-press glow-gold-hover"
                  onClick={() => setBookingEvent(event)}
                >
                  {isAr ? "احجز الآن" : "Book Now"}
                </Button>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {bookingEvent && (
        <EventBookingDialog
          open={!!bookingEvent}
          onOpenChange={(open) => !open && setBookingEvent(null)}
          eventId={bookingEvent.id}
          eventTitle={bookingEvent.title}
          eventTitleEn={bookingEvent.titleEn}
        />
      )}
    </div>
  );
};

export default EventsPage;
