import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ParallaxHero from "@/components/ParallaxHero";
import { Clock, MapPin, Check, Lightbulb, ChevronLeft, ChevronRight, Star, ArrowRight, ArrowLeft, X, Images } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPlaceById, places } from "@/data/places";
import { getPlaceReviews } from "@/data/reviews";
import ReviewsSection from "@/components/ReviewsSection";
import { useLanguage } from "@/i18n/LanguageContext";
import BackButton from "@/components/BackButton";

const PlaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const place = getPlaceById(id || "");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;
  const TipArrow = isAr ? ArrowRight : ArrowLeft;

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };
  const navigateLightbox = (dir: number) => {
    if (!place) return;
    setLightboxIndex((prev) => (prev + dir + place.gallery.length) % place.gallery.length);
  };

  if (!place) {
    return (
      <div className="min-h-screen bg-background flex flex-col" dir={isAr ? "rtl" : "ltr"}>
        <Header />
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">{isAr ? "المكان غير موجود" : "Place Not Found"}</h1>
            <Link to="/" className="text-gold hover:underline underline-offset-4">{isAr ? "العودة للرئيسية" : "Back to Home"}</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const t = (ar: string | string[], en: string | string[]) => isAr ? ar : en;
  const otherPlaces = places.filter((p) => p.id !== place.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-2">
        <BackButton />
      </div>

      <ParallaxHero image={place.detailImage} alt={t(place.name, place.nameEn) as string} overlayClassName="bg-gradient-to-t from-earth/80 via-earth/30 to-earth/10">
        <div className="absolute top-20 sm:top-28 right-0 left-0 z-10">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 text-cream/60 text-xs sm:text-sm">
              <Link to="/" className="hover:text-cream transition-colors">{isAr ? "الرئيسية" : "Home"}</Link>
              <ChevronIcon className="w-3 h-3" />
              <span className="text-cream/40">{isAr ? "الأماكن" : "Places"}</span>
              <ChevronIcon className="w-3 h-3" />
              <span className="text-cream">{t(place.name, place.nameEn)}</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 left-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 pb-6 sm:pb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block bg-gold/20 text-gold text-xs sm:text-sm px-3 py-1 rounded-sm mb-3 backdrop-blur-sm">{t(place.subtitle, place.subtitleEn)}</span>
              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-cream">{t(place.name, place.nameEn)}</h1>
            </motion.div>
          </div>
        </div>
      </ParallaxHero>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-lg border border-border p-5 sm:p-8">
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4">{isAr ? "عن المكان" : "About the Place"}</h2>
              <div className="h-px bg-border mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{t(place.fullDescription, place.fullDescriptionEn)}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-lg border border-border p-5 sm:p-8">
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4">{isAr ? "أبرز المعالم" : "Highlights"}</h2>
              <div className="h-px bg-border mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(t(place.highlights, place.highlightsEn) as string[]).map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Star className="w-3 h-3 text-gold" /></div>
                    <p className="text-sm text-foreground">{h}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-lg border border-border p-5 sm:p-8">
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4">{isAr ? "المرافق والخدمات" : "Facilities & Services"}</h2>
              <div className="h-px bg-border mb-4" />
              <ul className="space-y-3">
                {(t(place.features, place.featuresEn) as string[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-3"><Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" /><span className="text-sm text-foreground">{item}</span></li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gold/5 rounded-lg border border-gold/20 p-5 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-gold" />
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">{isAr ? "نصائح للزائر" : "Visitor Tips"}</h2>
              </div>
              <ul className="space-y-3">
                {(t(place.tips, place.tipsEn) as string[]).map((tip, i) => (
                  <li key={i} className="flex items-start gap-3"><TipArrow className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-1" /><span className="text-sm text-muted-foreground">{tip}</span></li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="bg-card rounded-lg border border-border p-5 sm:p-8">
              <div className="flex items-center gap-2 mb-4"><Images className="w-5 h-5 text-gold" /><h2 className="font-display text-lg sm:text-xl font-bold text-foreground">{isAr ? "معرض الصور" : "Photo Gallery"}</h2></div>
              <div className="h-px bg-border mb-4" />
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {place.gallery.map((img, i) => (
                  <motion.button key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => openLightbox(i)} className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer">
                    <img src={img.src} alt={isAr ? img.alt : img.altEn} loading="lazy" width={800} height={600} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-earth/0 group-hover:bg-earth/20 transition-colors" />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <ReviewsSection reviews={getPlaceReviews(place.id)} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card rounded-lg border border-border p-5 sm:p-8">
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4">{isAr ? "الموقع" : "Location"}</h2>
              <div className="h-px bg-border mb-4" />
              <div className="rounded-lg overflow-hidden aspect-video">
                <iframe src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${place.mapQuery}&zoom=15`} width="100%" height="100%" style={{ border: 0, minHeight: 250 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`${isAr ? "موقع" : "Location of"} ${t(place.name, place.nameEn)}`} />
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-lg border border-border p-5 sm:p-6 sticky top-28 space-y-5">
              <h3 className="font-display text-lg font-bold text-foreground">{isAr ? "معلومات الزيارة" : "Visit Information"}</h3>
              <div className="h-px bg-border" />
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{isAr ? "أوقات العمل" : "Working Hours"}</p>
                    {place.hours.map((h, i) => (
                      <div key={i} className="mb-1">
                        <p className="text-xs text-muted-foreground">{isAr ? h.label : h.labelEn}</p>
                        <p className="text-sm font-medium text-foreground">{isAr ? h.time : h.timeEn}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{isAr ? "الموقع" : "Location"}</p>
                    <p className="text-sm font-medium text-foreground">{t(place.location, place.locationEn)}</p>
                  </div>
                </div>
              </div>
              <div className="h-px bg-border" />
              <Link to="/tickets" className="block w-full bg-accent text-accent-foreground font-bold py-3.5 rounded-lg hover:bg-accent/90 transition-colors text-sm text-center">
                {isAr ? "احجز تذكرتك" : "Book Your Ticket"}
              </Link>
              <p className="text-[10px] text-muted-foreground text-center">{isAr ? "التذكرة تشمل الدخول لجميع الأماكن والمعارض" : "Ticket includes access to all places and exhibitions"}</p>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 sm:mt-20">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8">{isAr ? "أماكن أخرى للزيارة" : "Other Places to Visit"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {otherPlaces.map((other) => (
              <Link key={other.id} to={`/place/${other.id}`} className="group">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-3">
                  <img src={other.image} alt={t(other.name, other.nameEn) as string} loading="lazy" width={640} height={800} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-earth/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display text-base sm:text-lg font-bold text-cream">{t(other.name, other.nameEn)}</h3>
                    <p className="text-xs text-cream/70 mt-1">{t(other.subtitle, other.subtitleEn)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      <Footer />

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-earth/95 backdrop-blur-sm flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
            <button onClick={() => setLightboxOpen(false)} className="absolute top-4 left-4 sm:top-6 sm:left-6 w-10 h-10 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center transition-colors z-10"><X className="w-5 h-5 text-cream" /></button>
            <button onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }} className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center transition-colors z-10"><ChevronRight className="w-5 h-5 text-cream" /></button>
            <button onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }} className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center transition-colors z-10"><ChevronLeft className="w-5 h-5 text-cream" /></button>
            <motion.img key={lightboxIndex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} src={place.gallery[lightboxIndex].src} alt={isAr ? place.gallery[lightboxIndex].alt : place.gallery[lightboxIndex].altEn} onClick={(e) => e.stopPropagation()} className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg" />
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="text-cream/80 text-sm">{isAr ? place.gallery[lightboxIndex].alt : place.gallery[lightboxIndex].altEn}</p>
              <p className="text-cream/40 text-xs mt-1">{lightboxIndex + 1} / {place.gallery.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaceDetail;
