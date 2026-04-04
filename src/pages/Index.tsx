import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import HeroSection from "@/components/HeroSection";
import EventsSection from "@/components/EventsSection";
import ExperienceSection from "@/components/ExperienceSection";
import StatsSection from "@/components/StatsSection";
import PromoBanner from "@/components/PromoBanner";
import HistoryBanner from "@/components/HistoryBanner";
import PlacesSection from "@/components/PlacesSection";
import RestaurantsPreview from "@/components/RestaurantsPreview";
import SchoolBanner from "@/components/SchoolBanner";
import InstagramSection from "@/components/InstagramSection";
import FAQSection from "@/components/FAQSection";
import CTABanner from "@/components/CTABanner";
import PartnersSection from "@/components/PartnersSection";
import SectionDivider from "@/components/SectionDivider";
import MarqueeBanner from "@/components/MarqueeBanner";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import DarkModeParticles from "@/components/DarkModeParticles";
import LatestArticles from "@/components/LatestArticles";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <DarkModeParticles />
      <SEOHead title="الدرعية" description="اكتشفوا الدرعية - الوجهة التاريخية والثقافية للمملكة العربية السعودية. زوروا مطل البجيري وحي الطريف التاريخي." path="/" />
      <Header />
      <HeroSection />

      <MarqueeBanner />

      <ScrollReveal animation="fade">
        <EventsSection />
      </ScrollReveal>

      <SectionDivider />

      <ScrollReveal animation="fade">
        <ExperienceSection />
      </ScrollReveal>

      <StatsSection />

      <PromoBanner />

      <HistoryBanner />

      <SectionDivider variant="gold" />

      <ScrollReveal animation="fade">
        <PlacesSection />
      </ScrollReveal>

      <SectionDivider />

      <ScrollReveal animation="fade">
        <RestaurantsPreview />
      </ScrollReveal>

      <ScrollReveal animation="fade">
        <SchoolBanner />
      </ScrollReveal>

      <MarqueeBanner />

      <ScrollReveal animation="fade">
        <InstagramSection />
      </ScrollReveal>

      <ScrollReveal animation="fade">
        <LatestArticles />
      </ScrollReveal>

      <SectionDivider variant="gold" />

      <ScrollReveal animation="fade">
        <FAQSection />
      </ScrollReveal>

      <PartnersSection />

      <ScrollReveal animation="fade">
        <CTABanner />
      </ScrollReveal>

      <Footer />
    </div>
  );
};

export default Index;
