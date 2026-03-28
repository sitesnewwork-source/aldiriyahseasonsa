import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import BackButton from "@/components/BackButton";

const Privacy = () => {
  const { lang, isRtl } = useLanguage();
  const isAr = lang === "ar";
  const Chevron = isAr ? ChevronLeft : ChevronRight;

  const sections = isAr
    ? [
        {
          title: "المقدمة",
          content:
            "نلتزم في الدرعية بحماية خصوصيتكم. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتكم الشخصية عند استخدام موقعنا الإلكتروني وخدماتنا.",
        },
        {
          title: "المعلومات التي نجمعها",
          content:
            "نجمع المعلومات التالية:\n• الاسم والبريد الإلكتروني ورقم الهاتف عند الحجز أو التواصل معنا\n• معلومات الدفع عند شراء التذاكر\n• بيانات التصفح مثل عنوان IP ونوع المتصفح والصفحات المزارة\n• ملفات تعريف الارتباط (الكوكيز) لتحسين تجربة الاستخدام",
        },
        {
          title: "كيف نستخدم معلوماتكم",
          content:
            "نستخدم معلوماتكم للأغراض التالية:\n• معالجة حجوزاتكم وطلبات التذاكر\n• التواصل معكم بشأن حجوزاتكم والفعاليات\n• تحسين خدماتنا وتجربة الموقع\n• إرسال تحديثات وعروض ترويجية (بموافقتكم)\n• الامتثال للمتطلبات القانونية والتنظيمية",
        },
        {
          title: "حماية المعلومات",
          content:
            "نتخذ إجراءات أمنية مناسبة لحماية معلوماتكم الشخصية من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف، بما في ذلك التشفير وبروتوكولات الأمان المتقدمة.",
        },
        {
          title: "مشاركة المعلومات",
          content:
            "لا نبيع أو نؤجر معلوماتكم الشخصية لأطراف ثالثة. قد نشارك معلوماتكم مع:\n• مزودي الخدمات الموثوقين الذين يساعدوننا في تشغيل الموقع\n• الجهات الحكومية عند الطلب وفقاً للقوانين المعمول بها",
        },
        {
          title: "حقوقكم",
          content:
            "يحق لكم:\n• الوصول إلى بياناتكم الشخصية وطلب نسخة منها\n• تصحيح أو تحديث بياناتكم\n• طلب حذف بياناتكم الشخصية\n• إلغاء الاشتراك في الرسائل التسويقية\n• تقديم شكوى للجهات المختصة",
        },
        {
          title: "التواصل معنا",
          content:
            "لأي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر:\n• البريد الإلكتروني: privacy@diriyah.sa\n• الهاتف: 920 000 000 966+",
        },
      ]
    : [
        {
          title: "Introduction",
          content:
            "At Diriyah, we are committed to protecting your privacy. This policy explains how we collect, use, and protect your personal information when using our website and services.",
        },
        {
          title: "Information We Collect",
          content:
            "We collect the following information:\n• Name, email, and phone number when booking or contacting us\n• Payment information when purchasing tickets\n• Browsing data such as IP address, browser type, and pages visited\n• Cookies to improve user experience",
        },
        {
          title: "How We Use Your Information",
          content:
            "We use your information for the following purposes:\n• Processing your bookings and ticket orders\n• Communicating with you about reservations and events\n• Improving our services and website experience\n• Sending updates and promotional offers (with your consent)\n• Complying with legal and regulatory requirements",
        },
        {
          title: "Data Protection",
          content:
            "We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction, including encryption and advanced security protocols.",
        },
        {
          title: "Information Sharing",
          content:
            "We do not sell or rent your personal information to third parties. We may share your information with:\n• Trusted service providers who help us operate the website\n• Government authorities when required by applicable laws",
        },
        {
          title: "Your Rights",
          content:
            "You have the right to:\n• Access your personal data and request a copy\n• Correct or update your data\n• Request deletion of your personal data\n• Unsubscribe from marketing communications\n• File a complaint with relevant authorities",
        },
        {
          title: "Contact Us",
          content:
            "For any questions about this privacy policy, please contact us:\n• Email: privacy@diriyah.sa\n• Phone: +966 920 000 000",
        },
      ];

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <SEOHead
        title={isAr ? "سياسة الخصوصية" : "Privacy Policy"}
        description={isAr ? "سياسة الخصوصية لموقع الدرعية" : "Diriyah Privacy Policy"}
        path="/privacy"
      />
      <Header />

      <section className="pt-20 sm:pt-28 pb-10 md:pb-16">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <BackButton />
          <div className={`flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mb-6 ${isAr ? "" : ""}`}>
            <Link to="/" className="hover:text-foreground transition-colors">
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <Chevron className="w-3 h-3" />
            <span className="text-foreground">{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>
          <p className="text-muted-foreground text-sm mb-10">
            {isAr ? "آخر تحديث: مارس 2026" : "Last updated: March 2026"}
          </p>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3">
                  {i + 1}. {section.title}
                </h2>
                <p className="text-muted-foreground text-sm md:text-base leading-[1.9] whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
