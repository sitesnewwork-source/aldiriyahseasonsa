import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Share, Smartphone, CheckCircle, QrCode, Shield, Bell, Zap, Globe } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import BackButton from "@/components/BackButton";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const ADMIN_URL = "https://aldiriyahseasonsa.lovable.app/admin";

const AdminInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const features = [
    { icon: Bell, label: "إشعارات فورية", desc: "تنبيهات لحظية للطلبات والحجوزات" },
    { icon: Zap, label: "وصول سريع", desc: "افتح اللوحة مباشرة بدون متصفح" },
    { icon: Shield, label: "آمن ومحمي", desc: "تسجيل دخول محمي بالكامل" },
    { icon: Globe, label: "يعمل بدون إنترنت", desc: "عرض البيانات المحفوظة محلياً" },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8" dir="rtl">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <BackButton />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-400/30 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">تثبيت لوحة التحكم</h1>
          <p className="text-slate-500 text-sm">ثبّت لوحة التحكم على جهازك للوصول السريع</p>
        </motion.div>

        {/* Status */}
        {isInstalled ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center mb-6"
          >
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-lg font-bold text-emerald-700">التطبيق مثبّت بالفعل! 🎉</p>
          </motion.div>
        ) : (
          <>
            {/* Install Action */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              {deferredPrompt ? (
                <button
                  onClick={handleInstall}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-l from-amber-500 to-yellow-600 text-white py-4 px-6 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <Download className="w-6 h-6" />
                  تثبيت لوحة التحكم
                </button>
              ) : isIOS ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Share className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-slate-800">التثبيت على iPhone</h3>
                  </div>
                  <ol className="space-y-2.5 text-sm text-slate-600">
                    {[
                      <>اضغط على زر المشاركة <Share className="inline w-3.5 h-3.5" /> في أسفل Safari</>,
                      <>اختر <strong>"إضافة إلى الشاشة الرئيسية"</strong></>,
                      <>اضغط <strong>"إضافة"</strong> للتأكيد</>,
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h3 className="font-bold text-slate-800 mb-3">طريقة التثبيت</h3>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div>
                      <p className="font-semibold text-slate-700 mb-1">📱 على الجوال:</p>
                      <p>افتح الرابط من متصفح Chrome وسيظهر زر التثبيت تلقائياً</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 mb-1">💻 على الكمبيوتر:</p>
                      <p>في Chrome، اضغط على أيقونة التثبيت ⬇️ في شريط العنوان</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-50/50 to-yellow-50/50 border border-amber-200/40 rounded-2xl p-6 text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800">شارك رابط لوحة التحكم</h3>
          </div>
          <div className="inline-block p-3 bg-white rounded-xl shadow-md border border-amber-100">
            <QRCodeSVG
              value={ADMIN_URL}
              size={160}
              bgColor="#ffffff"
              fgColor="#1a1a2e"
              level="H"
            />
          </div>
          <p className="text-xs text-slate-400 mt-3">امسح الرمز للوصول للوحة التحكم</p>
          <button
            onClick={() => navigator.clipboard.writeText(ADMIN_URL)}
            className="mt-3 text-xs font-medium text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg px-4 py-2 transition-colors"
          >
            📋 نسخ الرابط
          </button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2.5"
        >
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <f.icon className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{f.label}</p>
                <p className="text-xs text-slate-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminInstall;
