import { useState } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Clock, MapPin, Share2, Check, ChevronDown, ArrowRight, Minus, Plus, AlertCircle, CalendarIcon } from "lucide-react";
import { actionNotify } from "@/hooks/use-action-notify";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImg from "@/assets/ticket-hero-diriyah.jpg";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";
import BackButton from "@/components/BackButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TicketsPage = () => {
  const { t, lang, isRtl } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const restaurantName = searchParams.get("restaurant");
  const incomingTable = (location.state as any)?.table || null;
  const [quantities, setQuantities] = useState<Record<string, number>>({ adult: 1, child: 0 });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showTerms, setShowTerms] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingCheckoutData, setPendingCheckoutData] = useState<any>(null);

  const VALID_COUPONS: Record<string, number> = {
    "SAUDI20": 20,
    "DIRIYAH10": 10,
    "WELCOME15": 15,
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    if (code.length > 20) {
      setCouponError(isRtl ? "كود غير صالح" : "Invalid code");
      return;
    }
    const discount = VALID_COUPONS[code];
    if (discount) {
      setAppliedCoupon({ code, discount });
      setCouponError("");
      actionNotify({ message: isRtl ? `تم تطبيق كوبون ${code} بخصم ${discount}%` : `Coupon ${code} applied: ${discount}% off`, icon: "🎫", sound: "soft" });
    } else {
      setCouponError(isRtl ? "كود الخصم غير صالح" : "Invalid coupon code");
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const ticketTypes = [
    { id: "adult", label: t("tickets.adult"), price: 50 },
    { id: "vip", label: t("tickets.vip"), price: 150, note: t("tickets.vipNote"), isVip: true },
    { id: "child", label: t("tickets.child"), price: 0, note: t("tickets.free") },
  ];

  const includes = [
    t("tickets.include1"),
    t("tickets.include2"),
    t("tickets.include3"),
  ];

  const terms = [
    t("tickets.term1"),
    t("tickets.term2"),
    t("tickets.term3"),
    t("tickets.term4"),
    t("tickets.term5"),
    t("tickets.term6"),
    t("tickets.term7"),
    t("tickets.term8"),
  ];

  const updateQty = (id: string, delta: number) => {
    const newVal = Math.max(0, (quantities[id] || 0) + delta);
    setQuantities((prev) => ({ ...prev, [id]: newVal }));
    const label = ticketTypes.find((t) => t.id === id)?.label || id;
    if (delta > 0) {
      actionNotify({ message: isRtl ? `تمت إضافة ${label}` : `${label} added`, icon: "🎟️", sound: "soft" });
    } else if (newVal >= 0 && (quantities[id] || 0) > 0) {
      actionNotify({ message: isRtl ? `تم تقليل ${label}` : `${label} reduced`, icon: "➖", sound: "soft" });
    }
  };

  const subtotalPrice = ticketTypes.reduce(
    (sum, tt) => sum + (quantities[tt.id] || 0) * tt.price,
    0
  );

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
  const GROUP_THRESHOLD = 5;
  const GROUP_DISCOUNT = 0.10;
  const hasGroupDiscount = totalTickets > GROUP_THRESHOLD;
  const groupDiscountAmount = hasGroupDiscount ? Math.round(subtotalPrice * GROUP_DISCOUNT) : 0;
  const afterGroupDiscount = subtotalPrice - groupDiscountAmount;
  const couponDiscountAmount = appliedCoupon ? Math.round(afterGroupDiscount * (appliedCoupon.discount / 100)) : 0;
  const totalPrice = afterGroupDiscount - couponDiscountAmount;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="التذاكر" description="احجز تذكرتك لزيارة الدرعية - تصريح دخول مطل البجيري وحي الطريف التاريخي." path="/tickets" />
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-2">
        <BackButton />
      </div>

      {/* Hero */}
      <section className="relative h-[45vh] sm:h-[55vh] md:h-[60vh] min-h-[300px]">
        <img
          src={heroImg}
          alt={t("tickets.title")}
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={800}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-earth/60 to-transparent dark:from-black/70 dark:to-transparent" />
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 -mt-16 relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {/* Main info */}
          <div className={cn("lg:col-span-2", isRtl ? "order-2 lg:order-1" : "order-2 lg:order-1")}>
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-lg border border-border p-5 sm:p-8 mb-6"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <button className="text-muted-foreground hover:text-foreground transition-colors p-2">
                  <Share2 className="w-5 h-5" />
                </button>
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  {t("tickets.title")}
                </h1>
                {restaurantName && (
                  <p className="text-accent font-medium text-sm mt-2">
                    {t("tickets.restaurantBooking")} {restaurantName}
                  </p>
                )}
              </div>

              <div className="h-px bg-border mb-6" />

              {/* Time info */}
              <div className={cn("space-y-5", isRtl ? "text-right" : "text-left")}>
                <div className={cn("flex items-start gap-3", isRtl ? "justify-end" : "justify-start flex-row-reverse")}>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("tickets.time")}</p>
                    <div className="space-y-3">
                      <div>
                        <p className="font-bold text-foreground text-sm">{t("tickets.bujairi")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("tickets.weekdays")}</p>
                        <p className="text-sm text-foreground">{t("tickets.weekdaysTime")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("tickets.weekends")}</p>
                        <p className="text-sm text-foreground">{t("tickets.weekendsTime")}</p>
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{t("tickets.turaif")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("tickets.satToThu")}</p>
                        <p className="text-sm text-foreground">{t("tickets.satToThuTime")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("tickets.friday")}</p>
                        <p className="text-sm text-foreground">{t("tickets.fridayTime")}</p>
                      </div>
                      <p className="text-xs text-gold font-medium">{t("tickets.lastEntry")}</p>
                    </div>
                  </div>
                  <Clock className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                </div>

                <div className={cn("flex items-center gap-3", isRtl ? "justify-end" : "justify-start flex-row-reverse")}>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{t("tickets.city")}</p>
                    <p className="text-sm text-foreground">{t("tickets.cityValue")}</p>
                  </div>
                  <MapPin className="w-5 h-5 text-gold flex-shrink-0" />
                </div>

                <div className={cn("flex items-center gap-3", isRtl ? "justify-end" : "justify-start flex-row-reverse")}>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{t("tickets.venue")}</p>
                    <p className="text-sm text-foreground">{t("tickets.venueValue")}</p>
                  </div>
                  <MapPin className="w-5 h-5 text-gold flex-shrink-0" />
                </div>
              </div>

              <div className="h-px bg-border my-6" />

              {/* Description */}
              <div className={isRtl ? "text-right" : "text-left"}>
                <p className="text-xs text-muted-foreground mb-3">{t("tickets.description")}</p>
                <p className="font-bold text-foreground text-sm mb-3">{t("tickets.includesLabel")}</p>
                <ul className="space-y-2">
                  {includes.map((item, i) => (
                    <li key={i} className={cn("flex items-start gap-2 text-sm text-foreground", isRtl ? "justify-end" : "justify-start flex-row-reverse")}>
                      <span>{item}</span>
                      <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-lg border border-border p-5 sm:p-8 mb-6"
            >
              <h2 className={cn("font-display text-lg font-bold text-foreground mb-4", isRtl ? "text-right" : "text-left")}>{t("tickets.location")}</h2>
              <div className="h-px bg-border mb-4" />
              <div className="rounded-lg overflow-hidden aspect-video">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.5!2d46.5747979!3d24.7373233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQ0JzE0LjQiTiA0NsKwMzQnMjkuMyJF!5e0!3m2!1sar!2ssa!4v1600000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 250 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={t("tickets.location")}
                />
              </div>
            </motion.div>

            {/* Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-lg border border-border p-5 sm:p-8"
            >
              <button
                onClick={() => setShowTerms(!showTerms)}
                className="w-full flex items-center justify-between"
              >
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showTerms ? "rotate-180" : ""}`} />
                <h2 className="font-display text-lg font-bold text-foreground">{t("tickets.terms")}</h2>
              </button>

              {showTerms && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="overflow-hidden"
                >
                  <div className="h-px bg-border my-4" />
                  <div className={isRtl ? "text-right" : "text-left"}>
                    <p className={cn("font-bold text-foreground text-sm mb-3 flex items-center gap-2", isRtl ? "justify-end" : "justify-start")}>
                      <span>{t("tickets.entryInstructions")}</span>
                      <AlertCircle className="w-4 h-4 text-gold" />
                    </p>
                    <ul className="space-y-3">
                      {terms.map((term, i) => (
                        <li key={i} className={cn("text-xs sm:text-sm text-muted-foreground leading-relaxed", isRtl ? "pr-4 border-r-2 border-gold/30" : "pl-4 border-l-2 border-gold/30")}>
                          {term}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Booking sidebar */}
          <div className={cn("lg:col-span-1", isRtl ? "order-1 lg:order-2" : "order-1 lg:order-2")}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-lg border border-border p-5 sm:p-6 sticky top-28"
            >
              <h3 className={cn("font-display text-lg font-bold text-foreground mb-5", isRtl ? "text-right" : "text-left")}>
                {t("tickets.bookNow")}
              </h3>

              {/* Date picker - 5 day buttons */}
              <div className="mb-5">
                <label className={cn("block text-sm font-medium text-foreground mb-2", isRtl ? "text-right" : "text-left")}>
                  {t("tickets.chooseDate")}
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const dayName = format(date, "EEE", { locale: isRtl ? ar : enUS });
                    const dayNum = format(date, "dd");
                    const monthName = format(date, "MMM", { locale: isRtl ? ar : enUS });
                    
                    return (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => {
                          setSelectedDate(date);
                          actionNotify({ message: isRtl ? "تم اختيار التاريخ" : "Date selected", icon: "📅", sound: "soft" });
                        }}
                        className={cn(
                          "flex flex-col items-center gap-0.5 rounded-lg border py-2.5 px-1 text-center transition-all duration-200",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                        )}
                      >
                        <span className="text-[10px] font-medium uppercase">{dayName}</span>
                        <span className={cn("text-lg font-bold leading-none", isSelected ? "text-primary" : "text-foreground")}>{dayNum}</span>
                        <span className="text-[10px]">{monthName}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Ticket types */}
              <div className="space-y-4 mb-6">
                {ticketTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(type.id, 1)}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-foreground">
                        {quantities[type.id] || 0}
                      </span>
                      <button
                        onClick={() => updateQty(type.id, -1)}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className={isRtl ? "text-right" : "text-left"}>
                      <p className={`text-sm font-medium text-foreground ${(type as any).isVip ? "text-gold" : ""}`}>
                        {(type as any).isVip && "⭐ "}{type.label}
                      </p>
                      <p className="text-xs text-gold">
                        {type.price > 0 ? `${type.price} ${t("tickets.sar")}` : type.note}
                      </p>
                      {(type as any).isVip && type.note && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{type.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon code */}
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2.5">
                    <button onClick={removeCoupon} className="text-xs text-destructive hover:underline">
                      {isRtl ? "إزالة" : "Remove"}
                    </button>
                    <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">🎫 {appliedCoupon.code}</span>
                      <span className="text-xs text-green-600 dark:text-green-500">(-{appliedCoupon.discount}%)</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <button
                        onClick={applyCoupon}
                        disabled={!couponCode.trim()}
                        className="px-4 py-2 bg-accent text-accent-foreground text-xs font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                      >
                        {isRtl ? "تطبيق" : "Apply"}
                      </button>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value.slice(0, 20)); setCouponError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        placeholder={isRtl ? "أدخل كود الخصم" : "Enter coupon code"}
                        className="flex-1 px-3 py-2 bg-transparent border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 transition-colors text-right"
                        maxLength={20}
                      />
                    </div>
                    {couponError && (
                      <p className="text-xs text-destructive mt-1 text-right">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Group discount hint */}
              {!hasGroupDiscount && totalTickets > 0 && !appliedCoupon && (
                <p className="text-xs text-muted-foreground mb-3 text-center">
                  💡 {t("tickets.groupHint")}
                </p>
              )}

              {/* Total */}
              <div className="py-3 border-t border-border mb-5 space-y-2">
                {(hasGroupDiscount || appliedCoupon) && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{subtotalPrice} {t("tickets.sar")}</span>
                    <span>{totalTickets} {t("tickets.ticket")}</span>
                  </div>
                )}
                {hasGroupDiscount && (
                  <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                    <span>-{groupDiscountAmount} {t("tickets.sar")}</span>
                    <span>🎉 {t("tickets.groupDiscount")}</span>
                  </div>
                )}
                {appliedCoupon && couponDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                    <span>-{couponDiscountAmount} {t("tickets.sar")}</span>
                    <span>🎫 {isRtl ? `كوبون ${appliedCoupon.code}` : `Coupon ${appliedCoupon.code}`}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-foreground">
                    {totalPrice} <span className="text-sm">{t("tickets.sar")}</span>
                  </p>
                  {!hasGroupDiscount && !appliedCoupon && (
                    <p className="text-sm text-muted-foreground">
                      {totalTickets} {t("tickets.ticket")}
                    </p>
                  )}
                </div>
              </div>

              {/* Selected Table Info */}
              {incomingTable && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{isRtl ? "الطاولة المختارة" : "Selected Table"}</p>
                    <p className="text-sm font-bold text-foreground">
                      {isRtl ? "طاولة" : "Table"} {incomingTable.label} • {incomingTable.seats} {isRtl ? "مقاعد" : "seats"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {incomingTable.zone === "indoor" ? (isRtl ? "داخلي" : "Indoor") :
                       incomingTable.zone === "outdoor" ? (isRtl ? "خارجي" : "Outdoor") : "VIP"}
                      {restaurantName && ` • ${restaurantName}`}
                    </p>
                  </div>
                  <span className="text-lg">🪑</span>
                </div>
              )}

              {/* Book button */}
              <button
                disabled={totalTickets === 0 || !selectedDate}
                onClick={() => {
                  const ticketItems = ticketTypes
                    .filter(tt => (quantities[tt.id] || 0) > 0)
                    .map(tt => ({ id: tt.id, label: tt.label, price: tt.price, qty: quantities[tt.id] || 0 }));
                  const data = {
                    tickets: ticketItems,
                    date: selectedDate?.toISOString(),
                    restaurant: restaurantName,
                    table: incomingTable,
                    subtotal: subtotalPrice,
                    groupDiscount: groupDiscountAmount,
                    couponDiscount: couponDiscountAmount,
                    coupon: appliedCoupon,
                    total: totalPrice,
                  };
                  setPendingCheckoutData(data);
                  setShowConfirmDialog(true);
                }}
                className="w-full bg-accent text-accent-foreground font-bold py-3.5 rounded-lg hover:bg-accent/90 transition-colors text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("tickets.bookNow")}
              </button>

              <p className="text-[10px] text-muted-foreground text-center mt-3">
                {t("tickets.agreeTerms")}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent dir={isRtl ? "rtl" : "ltr"} className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">
              {isRtl ? "تأكيد الطلب" : "Confirm Order"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-start">
                <p className="text-muted-foreground text-sm">
                  {isRtl ? "يرجى مراجعة تفاصيل طلبك قبل المتابعة:" : "Please review your order details before proceeding:"}
                </p>

                {/* Date */}
                {selectedDate && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span className="font-medium">
                      {format(selectedDate, "dd MMMM yyyy", { locale: isRtl ? ar : enUS })}
                    </span>
                  </div>
                )}

                {/* Restaurant */}
                {restaurantName && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">{restaurantName}</span>
                  </div>
                )}

                {/* Tickets list */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  {pendingCheckoutData?.tickets?.map((t: any) => (
                    <div key={t.id} className="flex justify-between text-sm">
                      <span className="text-foreground">{t.label} × {t.qty}</span>
                      <span className="font-semibold text-foreground">{t.price * t.qty} {isRtl ? "ر.س" : "SAR"}</span>
                    </div>
                  ))}
                </div>

                {/* Discounts */}
                {(pendingCheckoutData?.groupDiscount > 0 || pendingCheckoutData?.couponDiscount > 0) && (
                  <div className="space-y-1 text-sm">
                    {pendingCheckoutData?.groupDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{isRtl ? "خصم المجموعات" : "Group discount"}</span>
                        <span>-{pendingCheckoutData.groupDiscount} {isRtl ? "ر.س" : "SAR"}</span>
                      </div>
                    )}
                    {pendingCheckoutData?.couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{isRtl ? "خصم الكوبون" : "Coupon discount"}</span>
                        <span>-{pendingCheckoutData.couponDiscount} {isRtl ? "ر.س" : "SAR"}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="font-bold text-foreground text-base">{isRtl ? "الإجمالي" : "Total"}</span>
                  <span className="font-bold text-primary text-lg">{pendingCheckoutData?.total} {isRtl ? "ر.س" : "SAR"}</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRtl ? "flex-row-reverse gap-2" : ""}>
            <AlertDialogCancel>{isRtl ? "تعديل" : "Edit"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // Fire confetti 🎉
                const duration = 1500;
                const end = Date.now() + duration;
                const colors = ["#c9a96e", "#d4af37", "#f5e6cc", "#8b7355"];
                
                const frame = () => {
                  confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.7 },
                    colors,
                  });
                  confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.7 },
                    colors,
                  });
                  if (Date.now() < end) requestAnimationFrame(frame);
                };
                frame();

                // Star burst from center
                confetti({
                  particleCount: 80,
                  spread: 100,
                  origin: { x: 0.5, y: 0.4 },
                  colors,
                  shapes: ["star", "circle"],
                  scalar: 1.2,
                });

                setTimeout(() => {
                  navigate("/checkout", { state: pendingCheckoutData });
                }, 800);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isRtl ? "متابعة الدفع" : "Proceed to Payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default TicketsPage;
