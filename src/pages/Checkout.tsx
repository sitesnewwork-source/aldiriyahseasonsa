import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { actionNotify } from "@/hooks/use-action-notify";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Ticket, MapPin, Calendar, Minus, Plus, Trash2, ShieldCheck, Armchair } from "lucide-react";

const Checkout = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const bookingState = location.state as {
    restaurant?: string;
    table?: { id: string; label: string; seats: number; zone: string };
    tickets?: { id: string | number; label?: string; name?: string; price: number; qty: number }[];
    date?: string;
    subtotal?: number;
    groupDiscount?: number;
    couponDiscount?: number;
    coupon?: { code: string; discount: number } | null;
    total?: number;
  } | null;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const buildInitialTickets = () => {
    if (bookingState?.tickets && bookingState.tickets.length > 0) {
      return bookingState.tickets.map((t, i) => ({
        id: typeof t.id === "number" ? t.id : i + 1,
        name: t.label || t.name || (isAr ? "تذكرة" : "Ticket"),
        price: t.price,
        qty: t.qty,
      }));
    }
    return [
      { id: 1, name: isAr ? "تذكرة دخول حي الطريف" : "At-Turaif Entry Ticket", price: 50, qty: 2 },
      { id: 2, name: isAr ? "جولة إرشادية - البجيري" : "Guided Tour - Bujairi", price: 75, qty: 1 },
    ];
  };

  const [tickets, setTickets] = useState(buildInitialTickets);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) {
      e.firstName = isAr ? "أدخل الاسم الأول" : "Enter first name";
    }
    if (!lastName.trim()) {
      e.lastName = isAr ? "أدخل اسم العائلة" : "Enter last name";
    }
    if (tickets.length === 0) {
      e.tickets = isAr ? "لا توجد تذاكر" : "No tickets";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = isAr ? "أدخل بريد إلكتروني صحيح" : "Enter a valid email";
    }
    const digits = phone.replace(/\D/g, "");
    if (!digits || digits.length !== 9 || !digits.startsWith("5")) {
      e.phone = isAr ? "أدخل رقم جوال سعودي صحيح (9 أرقام يبدأ بـ 5)" : "Enter a valid Saudi mobile (9 digits starting with 5)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const updateQty = (id: number, delta: number) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, qty: Math.max(0, t.qty + delta) } : t)).filter((t) => t.qty > 0)
    );
    actionNotify({
      message: isAr ? (delta > 0 ? "تمت زيادة الكمية" : "تم تقليل الكمية") : (delta > 0 ? "Quantity increased" : "Quantity decreased"),
      icon: delta > 0 ? "➕" : "➖",
      sound: "soft",
    });
  };

  const removeTicket = (id: number) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    actionNotify({ message: isAr ? "تم حذف التذكرة" : "Ticket removed", icon: "🗑️", sound: "soft" });
  };

  const subtotal = tickets.reduce((sum, t) => sum + t.price * t.qty, 0);
  const vat      = Math.round(subtotal * 0.15);
  const total    = subtotal + vat;

  return (
    <div className="min-h-screen bg-background font-body" dir={isAr ? "rtl" : "ltr"}>
      <Header />

      <main className="pt-20 sm:pt-28 pb-12 sm:pb-20 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
            {isAr ? "إتمام الطلب" : "Checkout"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-8">
            {isAr ? "راجع طلبك وأكمل عملية الدفع" : "Review your order and complete payment"}
          </p>

          <div className="grid md:grid-cols-5 gap-5 sm:gap-8">

            {/* Order Summary */}
            <div className="md:col-span-3 space-y-6">

              {/* Tickets */}
              <div className="bg-card rounded-xl border border-border p-3 sm:p-5">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Ticket className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-base sm:text-lg font-semibold text-foreground">
                    {isAr ? "التذاكر" : "Tickets"}
                  </h2>
                </div>

                {tickets.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-6 text-center">
                    {isAr ? "لا توجد تذاكر في السلة" : "No tickets in cart"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="p-2.5 sm:p-3 rounded-lg bg-background">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm leading-tight">{ticket.name}</p>
                            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span>{isAr ? "الدرعية" : "Diriyah"}</span>
                              <Calendar className="w-3 h-3 ms-1 flex-shrink-0" />
                              <span>2026-04-15</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeTicket(ticket.id)}
                            className="text-destructive/60 hover:text-destructive transition-colors p-1 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQty(ticket.id, -1)}
                              className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-foreground">{ticket.qty}</span>
                            <button
                              onClick={() => updateQty(ticket.id, 1)}
                              className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-foreground">
                            {ticket.price * ticket.qty} {isAr ? "ر.س" : "SAR"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="bg-card rounded-xl border border-border p-3 sm:p-5">
                <h2 className="font-display text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
                  {isAr ? "معلومات التواصل" : "Contact Information"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-foreground text-sm">{isAr ? "الاسم الأول" : "First Name"}</Label>
                    <Input
                      className={`mt-1.5 bg-background text-base ${errors.firstName ? "border-destructive" : ""}`}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={isAr ? "محمد" : "Mohammed"}
                      maxLength={50}
                    />
                    {errors.firstName && <p className="text-destructive text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Label className="text-foreground text-sm">{isAr ? "اسم العائلة" : "Last Name"}</Label>
                    <Input
                      className={`mt-1.5 bg-background text-base ${errors.lastName ? "border-destructive" : ""}`}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={isAr ? "العبدالله" : "Al-Abdullah"}
                      maxLength={50}
                    />
                    {errors.lastName && <p className="text-destructive text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                  <div>
                    <Label className="text-foreground text-sm">{isAr ? "البريد الإلكتروني" : "Email"}</Label>
                    <Input
                      className={`mt-1.5 bg-background text-base ${errors.email ? "border-destructive" : ""}`}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      dir="ltr"
                      maxLength={255}
                    />
                    {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label className="text-foreground text-sm">{isAr ? "رقم الجوال" : "Phone"}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none pointer-events-none" dir="ltr">
                        00966
                      </span>
                      <Input
                        className={`mt-1.5 bg-background text-base pl-[52px] ${errors.phone ? "border-destructive" : ""}`}
                        value={phone}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 9);
                          setPhone(v);
                        }}
                        placeholder="5XXXXXXXX"
                        dir="ltr"
                        maxLength={9}
                        inputMode="numeric"
                      />
                    </div>
                    {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="md:col-span-2">
              <div className="bg-card rounded-xl border border-border p-3 sm:p-5 md:sticky md:top-28">
                <h2 className="font-display text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
                  {isAr ? "ملخص الطلب" : "Order Summary"}
                </h2>

                {bookingState && (bookingState.restaurant || bookingState.table) && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4 space-y-2">
                    {bookingState.restaurant && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span className="text-foreground font-medium">{bookingState.restaurant}</span>
                      </div>
                    )}
                    {bookingState.table && (
                      <div className="flex items-center gap-2 text-sm">
                        <Armchair className="w-3.5 h-3.5 text-primary" />
                        <span className="text-foreground font-medium">
                          {isAr ? "طاولة" : "Table"} {bookingState.table.label}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          • {bookingState.table.seats} {isAr ? "مقاعد" : "seats"} • {
                            bookingState.table.zone === "indoor"  ? (isAr ? "داخلي"  : "Indoor")  :
                            bookingState.table.zone === "outdoor" ? (isAr ? "خارجي" : "Outdoor") : "VIP"
                          }
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  {tickets.map((t) => (
                    <div key={t.id} className="flex justify-between text-muted-foreground">
                      <span>{t.name} × {t.qty}</span>
                      <span>{t.price * t.qty} {isAr ? "ر.س" : "SAR"}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                    <span>{subtotal} {isAr ? "ر.س" : "SAR"}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{isAr ? "ضريبة القيمة المضافة (15%)" : "VAT (15%)"}</span>
                    <span>{vat} {isAr ? "ر.س" : "SAR"}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-bold text-foreground text-lg">
                  <span>{isAr ? "الإجمالي" : "Total"}</span>
                  <span>{total} {isAr ? "ر.س" : "SAR"}</span>
                </div>

                {/* ✅ الزر الصح - يمرر كل البيانات لـ CardPayment */}
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!validate()) {
                      toast({
                        title: isAr ? "⚠️ يرجى تعبئة جميع الحقول" : "⚠️ Please fill all fields",
                        description: isAr ? "تحقق من البيانات المطلوبة وحاول مرة أخرى" : "Check the required fields and try again",
                        variant: "destructive",
                      });
                      return;
                    }
                    navigate("/card-payment", {
                      state: {
                        tickets,
                        firstName,
                        lastName,
                        email,
                        phone,
                        total,
                        vat,
                        subtotal,
                      },
                    });
                  }}
                  className="w-full mt-6 h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isAr ? "إتمام الطلب" : "Complete Order"}
                </Button>

                <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isAr ? "دفع آمن ومشفر" : "Secure & encrypted payment"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
