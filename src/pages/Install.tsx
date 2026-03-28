import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Share, Smartphone, CheckCircle, ArrowRight, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const { lang, isRtl } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsInstalled(isStandalone);

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

  const content = {
    ar: {
      title: "حمّل تطبيق الدرعية",
      subtitle: "استمتع بتجربة سلسة مباشرة من شاشتك الرئيسية",
      installed: "التطبيق مثبّت بالفعل! 🎉",
      installBtn: "تثبيت التطبيق",
      iosTitle: "التثبيت على iPhone",
      iosSteps: [
        "اضغط على زر المشاركة في أسفل المتصفح",
        'اختر "إضافة إلى الشاشة الرئيسية"',
        'اضغط "إضافة" للتأكيد',
      ],
      androidTitle: "التثبيت على Android",
      androidSteps: [
        "اضغط على زر القائمة ⋮ في المتصفح",
        'اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"',
        'اضغط "تثبيت" للتأكيد',
      ],
      features: [
        "يعمل بدون إنترنت",
        "إشعارات فورية",
        "تحميل سريع",
        "بدون متجر تطبيقات",
      ],
    },
    en: {
      title: "Install Diriyah App",
      subtitle: "Enjoy a seamless experience right from your home screen",
      installed: "App is already installed! 🎉",
      installBtn: "Install App",
      iosTitle: "Install on iPhone",
      iosSteps: [
        "Tap the Share button at the bottom of Safari",
        'Select "Add to Home Screen"',
        'Tap "Add" to confirm',
      ],
      androidTitle: "Install on Android",
      androidSteps: [
        "Tap the menu button ⋮ in your browser",
        'Select "Install app" or "Add to Home Screen"',
        'Tap "Install" to confirm',
      ],
      features: [
        "Works offline",
        "Instant notifications",
        "Fast loading",
        "No app store needed",
      ],
    },
  };

  const c = content[lang];

  return (
    <>
      <SEOHead
        title={lang === "ar" ? "تحميل التطبيق | الدرعية" : "Install App | Diriyah"}
        description={c.subtitle}
      />
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background" dir={isRtl ? "rtl" : "ltr"}>
        <div className="container mx-auto px-4 max-w-2xl">
          <BackButton />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-accent/10 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              {c.title}
            </h1>
            <p className="text-foreground/60 text-lg">{c.subtitle}</p>
          </motion.div>

          {isInstalled ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-accent/10 border border-accent/30 rounded-2xl p-8 text-center"
            >
              <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
              <p className="text-lg font-bold text-accent">{c.installed}</p>
            </motion.div>
          ) : (
            <>
              {/* Install button for Android/Desktop */}
              {deferredPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <button
                    onClick={handleInstall}
                    className="w-full flex items-center justify-center gap-3 bg-accent text-accent-foreground py-4 px-6 rounded-xl text-lg font-bold shadow-lg hover:bg-accent/90 transition-colors"
                  >
                    <Download className="w-6 h-6" />
                    {c.installBtn}
                  </button>
                </motion.div>
              )}

              {/* iOS Instructions */}
              {isIOS && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted/50 rounded-2xl p-6 mb-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Share className="w-6 h-6 text-accent" />
                    <h2 className="text-xl font-bold text-foreground">{c.iosTitle}</h2>
                  </div>
                  <ol className="space-y-3">
                    {c.iosSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-foreground/80 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </motion.div>
              )}

              {/* Android Instructions */}
              {!isIOS && !deferredPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted/50 rounded-2xl p-6 mb-8"
                >
                  <h2 className="text-xl font-bold text-foreground mb-4">{c.androidTitle}</h2>
                  <ol className="space-y-3">
                    {c.androidSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-foreground/80 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </motion.div>
              )}

              {/* QR Code */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-8 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-6 text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <QrCode className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">
                    {lang === "ar" ? "شارك رابط التثبيت" : "Share Install Link"}
                  </h3>
                </div>
                <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border border-primary/10">
                  <QRCodeSVG
                    value="https://aldiriyahseasonsa.lovable.app/admin"
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#1a1a2e"
                    level="H"
                    imageSettings={{
                      src: "/placeholder.svg",
                      x: undefined,
                      y: undefined,
                      height: 30,
                      width: 30,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="text-sm text-foreground/50 mt-3">
                  {lang === "ar" ? "امسح الرمز لتحميل التطبيق على جهازك" : "Scan to install the app on your device"}
                </p>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-3"
              >
                {c.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-muted/30 rounded-xl px-4 py-3"
                  >
                    <ArrowRight className={`w-4 h-4 text-accent shrink-0 ${isRtl ? "rotate-180" : ""}`} />
                    <span className="text-sm font-medium text-foreground/80">{feature}</span>
                  </div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Install;
