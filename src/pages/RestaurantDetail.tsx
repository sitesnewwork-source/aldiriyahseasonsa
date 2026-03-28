import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, MapPin, Phone, ChevronLeft, ExternalLink, UtensilsCrossed } from "lucide-react";
import TableSelector from "@/components/TableSelector";
import { restaurants } from "@/data/restaurants";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import BackButton from "@/components/BackButton";

const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const restaurant = restaurants.find((r) => r.id === id);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<{ id: string; label: string; seats: number; zone: string } | null>(null);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-xl text-foreground mb-4">{t("detail.notFound")}</p>
        <Link to="/restaurants" className="text-primary hover:text-accent underline">
          {t("detail.backToRestaurants")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-2">
        <BackButton />
      </div>

      {/* Hero - Full width image with overlay */}
      <section className="relative h-[55vh] md:h-[70vh] overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Breadcrumb on image */}
        <div className="absolute top-24 right-0 left-0">
          <div className="container mx-auto px-6">
            <nav className="flex items-center gap-2 text-white/70 text-sm">
              <Link to="/" className="hover:text-white transition-colors">{t("common.home")}</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <Link to="/restaurants" className="hover:text-white transition-colors">{t("common.restaurantsAndCafes")}</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-white">{restaurant.name}</span>
            </nav>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 right-0 left-0 pb-12 md:pb-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-primary/90 text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-sm mb-4">
                {restaurant.cuisine}
              </span>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight text-shimmer-gold">
                {restaurant.name}
              </h1>
              <p className="text-white/80 text-base md:text-lg mt-3 max-w-2xl leading-relaxed">
                {restaurant.description}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <div className="bg-foreground text-background">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4 gap-4 overflow-x-auto">
            <div className="flex items-center gap-6 text-sm whitespace-nowrap">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{restaurant.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>أيام الأسبوع: {restaurant.hours.weekdays}</span>
              </div>
              {restaurant.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <a href={`tel:${restaurant.phone}`} className="hover:text-primary transition-colors" dir="ltr">
                    {restaurant.phone}
                  </a>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link to={`/tickets?restaurant=${encodeURIComponent(restaurant.name)}`}>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-xs font-bold">
                    {t("common.bookTable")}
                  </Button>
                </Link>
              {restaurant.menuUrl && (
                <a
                  href={restaurant.menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="border-background/30 text-background hover:bg-background/10 rounded-sm text-xs">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    القائمة
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-16">
            
            {/* Left: Description & Rules - 3 cols */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3 space-y-12"
            >
              {/* About */}
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6 pb-4 border-b border-gold/20 gold-sparkle">
                  عن المطعم
                </h2>
                <p className="text-muted-foreground leading-[1.9] text-base md:text-lg">
                  {restaurant.fullDescription}
                </p>
              </div>

              {/* Rules */}
              {restaurant.rules && restaurant.rules.length > 0 && (
                <div className="bg-secondary/50 dark:bg-secondary/80 rounded-sm p-6 md:p-8">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full inline-block" />
                    قواعد الضيافة
                  </h3>
                  <ul className="space-y-3">
                    {restaurant.rules.map((rule, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-3 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Menu Section inline */}
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 pb-4 border-b border-gold/20 gold-sparkle">
                  قائمة الطعام
                </h2>
                <div className="space-y-10">
                  {restaurant.menu.map((cat, ci) => (
                    <motion.div
                      key={cat.category}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: ci * 0.08 }}
                    >
                      <h3 className="font-display text-lg font-bold text-primary mb-5 flex items-center gap-3">
                        <span className="w-8 h-px bg-primary" />
                        {cat.category}
                      </h3>
                      <div className="space-y-4">
                        {cat.items.map((item) => (
                          <div key={item.name} className="flex justify-between items-start gap-4 group py-3 border-b border-border/50 last:border-0">
                            <div className="flex-1">
                              <h4 className="font-bold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                                {item.name}
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                            </div>
                            <span className="text-primary font-bold text-sm whitespace-nowrap">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: Info Sidebar - 2 cols */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="lg:col-span-2"
            >
              <div className="sticky top-28 space-y-6">
                {/* Info Card */}
                <div className="bg-card border border-border rounded-sm overflow-hidden">
                  <div className="bg-foreground text-background px-6 py-4">
                    <h3 className="font-display text-lg font-bold">{t("detail.restaurantInfo")}</h3>
                  </div>
                  <div className="p-6 space-y-5">
                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">الموقع</p>
                        <p className="text-sm font-bold text-foreground">{restaurant.location}</p>
                        {restaurant.mapUrl && (
                          <a
                            href={restaurant.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                          >
                            احصل على الاتجاهات
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-border" />

                    {/* Hours */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground mb-0.5">ساعات العمل</p>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">أيام الأسبوع</span>
                            <span className="font-medium text-foreground">{restaurant.hours.weekdays}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">نهاية الأسبوع</span>
                            <span className="font-medium text-foreground">{restaurant.hours.weekend}</span>
                          </div>
                          {restaurant.hours.eid && (
                            <div className="flex justify-between gap-4">
                              <span className="text-primary">العيد</span>
                              <span className="font-medium text-primary">{restaurant.hours.eid}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {restaurant.phone && (
                      <>
                        <div className="border-t border-border" />
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">تواصل معنا</p>
                            <a
                              href={`tel:${restaurant.phone}`}
                              className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                              dir="ltr"
                            >
                              {restaurant.phone}
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Table Selector */}
                <TableSelector onSelect={(table) => setSelectedTable(table)} />

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate(`/tickets?restaurant=${encodeURIComponent(restaurant.name)}`, {
                      state: { table: selectedTable },
                    })}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm h-12 text-sm font-bold"
                  >
                    {t("common.bookTableNow")}
                  </Button>
                  {restaurant.menuUrl && (
                    <a
                      href={restaurant.menuUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full rounded-sm h-12 text-sm font-bold border-foreground text-foreground hover:bg-foreground hover:text-background">
                        <UtensilsCrossed className="w-4 h-4" />
                        {t("common.viewMenu")}
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-foreground dark:bg-card py-16 md:py-20">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-background dark:text-foreground mb-10 gold-sparkle">
            معرض الصور
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {restaurant.gallery.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`overflow-hidden rounded-sm cursor-pointer group ${
                  i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                }`}
                onClick={() => setSelectedImage(img)}
              >
                <img
                  src={img}
                  alt={`${restaurant.name} - صورة ${i + 1}`}
                  loading="lazy"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 cursor-pointer backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={selectedImage}
            alt=""
            className="max-w-full max-h-[85vh] object-contain rounded-sm"
          />
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default RestaurantDetail;
