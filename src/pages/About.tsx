import { motion } from "framer-motion";
import ParallaxHero from "@/components/ParallaxHero";
import { Link } from "react-router-dom";
import { ChevronLeft, MapPin, Calendar, Users, Award } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import BackButton from "@/components/BackButton";
import ScrollReveal from "@/components/ScrollReveal";
import introImg from "@/assets/intro-people.jpg";
import placeTuraif from "@/assets/place-turaif.jpg";
import placeBujairi from "@/assets/place-bujairi.jpg";
import placeWadi from "@/assets/place-wadi.jpg";

const stats = [
  { icon: Calendar, value: "١٤٤٦هـ", label: "تأسست الدرعية" },
  { icon: MapPin, value: "+٧ كم²", label: "المساحة الإجمالية" },
  { icon: Users, value: "+٢ مليون", label: "زائر سنوياً" },
  { icon: Award, value: "يونسكو", label: "تراث عالمي" },
];

const About = () => {
  const { t, isRtl } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="نبذة عنّا" description="تعرّف على الدرعية - موطن التراث والثقافة السعودية، ومهد الدولة السعودية الأولى." path="/about" />
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-2">
        <BackButton />
      </div>

      {/* Hero */}
      <ParallaxHero image={introImg} alt="الدرعية" height="h-[40vh] md:h-[50vh]">
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container mx-auto px-6 pb-8 md:pb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 text-white/60 text-xs sm:text-sm mb-4">
                <Link to="/" className="hover:text-white transition-colors">الرئيسية</Link>
                <ChevronLeft className="w-3 h-3" />
                <span className="text-white">نبذة عنّا</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                الدرعية
              </h1>
              <p className="text-white/70 text-sm md:text-lg mt-3 max-w-2xl">
                موطن التاريخ والثقافة السعودية الأصيلة، ومهد الدولة السعودية الأولى
              </p>
            </motion.div>
          </div>
        </div>
      </ParallaxHero>

      {/* Stats */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border rtl:divide-x-reverse">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="py-6 md:py-8 text-center"
              >
                <stat.icon className="w-5 h-5 text-gold mx-auto mb-2" />
                <p className="font-display text-xl md:text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <ScrollReveal animation="fade-right" className="order-2 lg:order-1">
              <img src={placeTuraif} alt="حي الطريف" className="w-full rounded-lg" loading="lazy" />
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={0.1} className="order-1 lg:order-2 text-right">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-4">
                قصة الدرعية
              </h2>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                <p>
                  تقع الدرعية في الجزء الشمالي الغربي من مدينة الرياض، على ضفاف وادي حنيفة. تأسست في عام ١٤٤٦هـ على يد مانع بن ربيعة المريدي، جد أسرة آل سعود، لتصبح عاصمة الدولة السعودية الأولى.
                </p>
                <p>
                  يعد حي الطريف في الدرعية أحد مواقع التراث العالمي لمنظمة اليونسكو، ويضم قصر سلوى ومباني تاريخية تعكس العمارة النجدية التقليدية المميزة.
                </p>
                <p>
                  اليوم، تشهد الدرعية تحولاً نوعياً ضمن رؤية المملكة ٢٠٣٠، لتصبح وجهة ثقافية وسياحية عالمية تجمع بين عراقة التاريخ وحداثة التجربة.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-10 md:py-16 bg-card border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <ScrollReveal animation="fade-up" className="text-right">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-4">
                رؤية المستقبل
              </h2>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                <p>
                  تسعى هيئة تطوير بوابة الدرعية لتحويل الدرعية إلى واحدة من أهم الوجهات الثقافية والتراثية والترفيهية في العالم، من خلال مشاريع تطوير طموحة تحافظ على الهوية التاريخية.
                </p>
                <p>
                  تشمل الخطط المستقبلية متاحف عالمية، فنادق فاخرة، مراكز ثقافية، ومساحات ترفيهية متنوعة، كلها مستوحاة من الطراز المعماري النجدي الأصيل.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-left" delay={0.15}>
              <div className="grid grid-cols-2 gap-3">
                <img src={placeBujairi} alt="مطل البجيري" className="w-full rounded-lg" loading="lazy" />
                <img src={placeWadi} alt="وادي حنيفة" className="w-full rounded-lg mt-8" loading="lazy" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
