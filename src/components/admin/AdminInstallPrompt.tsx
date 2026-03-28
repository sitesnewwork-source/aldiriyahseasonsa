import { useState, useEffect } from "react";
import { Download, X, Smartphone, Share } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Props {
  variant?: "banner" | "full";
}

const AdminInstallPrompt = ({ variant = "banner" }: Props) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsInstalled(isStandalone);

    const wasDismissed = sessionStorage.getItem("admin-install-dismissed");
    if (wasDismissed) setDismissed(true);

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

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("admin-install-dismissed", "1");
  };

  if (isInstalled || dismissed) return null;
  // For banner variant, hide if no install prompt available
  if (variant === "banner" && !deferredPrompt && !isIOS) return null;

  // Full variant for login page
  if (variant === "full") {
    return (
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
          <Smartphone className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">ثبّت لوحة التحكم على جهازك</h3>
        <p className="text-[12px] text-slate-500 mb-3">وصول سريع من الشاشة الرئيسية بدون متصفح</p>

        {deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            تثبيت التطبيق
          </button>
        ) : isIOS ? (
          <div className="space-y-2">
            <button
              onClick={() => setShowIOSGuide(!showIOSGuide)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors"
            >
              <Share className="w-4 h-4" />
              طريقة التثبيت
            </button>
            {showIOSGuide && (
              <ol className="text-right text-[12px] text-slate-600 space-y-1.5 mt-2 bg-white rounded-lg p-3">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  اضغط على زر المشاركة <Share className="inline w-3 h-3" /> في أسفل المتصفح
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  اختر "إضافة إلى الشاشة الرئيسية"
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  اضغط "إضافة" للتأكيد
                </li>
              </ol>
            )}
          </div>
        ) : (
          <div className="text-right text-[12px] text-slate-600 space-y-1.5 bg-white rounded-lg p-3">
            <p className="font-semibold text-slate-700 text-[13px] mb-2">📱 على الجوال:</p>
            <p>افتح الرابط من متصفح الجوال وسيظهر زر التثبيت تلقائياً</p>
            <p className="font-semibold text-slate-700 text-[13px] mt-3 mb-2">💻 على الكمبيوتر:</p>
            <p>في Chrome، اضغط على أيقونة التثبيت ⬇️ في شريط العنوان أعلى المتصفح</p>
          </div>
        )}
      </div>
    );
  }

  // Banner variant for inside admin layout
  return (
    <div className="mx-3 sm:mx-4 md:mx-6 mt-3 bg-gradient-to-l from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
        <Download className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-800">ثبّت التطبيق على جهازك</p>
        <p className="text-[11px] text-slate-500">وصول أسرع بدون فتح المتصفح</p>
      </div>
      {deferredPrompt ? (
        <button
          onClick={handleInstall}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          تثبيت
        </button>
      ) : isIOS ? (
        <button
          onClick={() => setShowIOSGuide(!showIOSGuide)}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          الطريقة
        </button>
      ) : null}
      <button onClick={handleDismiss} className="shrink-0 text-slate-400 hover:text-slate-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AdminInstallPrompt;
