import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import BackButton from "@/components/BackButton";

const Terms = () => {
  const { lang, isRtl } = useLanguage();
  const isAr = lang === "ar";
  const Chevron = isAr ? ChevronLeft : ChevronRight;

  const sections = isAr
    ? [
        {
          title: "القبول بالشروط",
          content:
            "باستخدامك لموقع الدرعية الإلكتروني وخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع.",
        },
        {
          title: "التذاكر والحجوزات",
          content:
            "• جميع التذاكر صالحة للتاريخ المحدد فقط وتسمح بالدخول مرة واحدة\n• الأطفال (12 سنة وأقل) يدخلون مجاناً برفقة شخص بالغ\n• الأطفال (15 سنة وأقل) يجب أن يكونوا برفقة شخص بالغ مسؤول\n• يمكن طلب تغيير التاريخ حتى 24 ساعة قبل موعد الزيارة\n• لا يمكن استرداد قيمة التذاكر إلا وفقاً لسياسة الاسترداد المعمول بها",
        },
        {
          title: "قواعد الزيارة",
          content:
            "• يجب على جميع الزوار الالتزام بقواعد وتعليمات المشغل\n• لا يُسمح بإحضار الطعام والشراب من الخارج (باستثناء الأغراض الطبية وأغذية الأطفال)\n• قد تكون بطاقة الهوية الوطنية مطلوبة عند الدخول\n• يخضع جميع الزوار وممتلكاتهم للتفتيش الأمني\n• سيتم مصادرة المواد الممنوعة والخطرة",
        },
        {
          title: "المطاعم والحجز",
          content:
            "• يمكن استرداد قيمة تذكرة الدخول في مطاعم ومقاهي مطل البجيري (باستثناء بعض المطاعم)\n• حجوزات المطاعم تخضع لتوفر الأماكن\n• يُنصح بالحجز المسبق خاصة في عطلات نهاية الأسبوع والمناسبات\n• قد تُلغى الحجوزات في حال عدم الحضور في الوقت المحدد",
        },
        {
          title: "المسؤولية",
          content:
            "• دخول واستخدام المنطقة يقع على مسؤولية الزائر الشخصية\n• لا يتحمل المشغل أي مسؤولية عن الخسارة أو الإصابة أو الضرر إلى أقصى حد يسمح به القانون\n• يجب على الزوار الحفاظ على سلامتهم الشخصية واتباع إرشادات الأمان",
        },
        {
          title: "الملكية الفكرية",
          content:
            "جميع المحتويات المعروضة على الموقع بما في ذلك النصوص والصور والتصاميم والشعارات هي ملكية فكرية للدرعية ومحمية بموجب قوانين حقوق الملكية الفكرية. لا يجوز نسخها أو إعادة إنتاجها دون إذن كتابي مسبق.",
        },
        {
          title: "التعديلات",
          content:
            "نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة مع تحديث تاريخ آخر تعديل.",
        },
        {
          title: "القانون المعمول به",
          content:
            "تخضع هذه الشروط والأحكام لقوانين المملكة العربية السعودية وتُفسر وفقاً لها.",
        },
        {
          title: "التواصل",
          content:
            "لأي استفسارات حول الشروط والأحكام:\n• البريد الإلكتروني: info@diriyah.sa\n• الهاتف: 920 000 000 966+",
        },
      ]
    : [
        {
          title: "Acceptance of Terms",
          content:
            "By using the Diriyah website and our services, you agree to be bound by these terms and conditions. If you do not agree to any of these terms, please do not use the website.",
        },
        {
          title: "Tickets and Reservations",
          content:
            "• All tickets are valid for the selected date only and allow single entry\n• Children (12 and under) enter free with an accompanying adult\n• Children (15 and under) must be accompanied by a responsible adult\n• Date changes can be requested up to 24 hours before the visit\n• Ticket refunds are only available per the applicable refund policy",
        },
        {
          title: "Visit Rules",
          content:
            "• All visitors must comply with rules and operator instructions\n• No outside food or drinks allowed (except for medical purposes and baby food)\n• National ID may be required upon entry\n• All visitors and belongings are subject to security inspection\n• Prohibited and dangerous items will be confiscated",
        },
        {
          title: "Restaurants and Bookings",
          content:
            "• Entry ticket value is redeemable at Bujairi Terrace restaurants and cafés (some exceptions apply)\n• Restaurant reservations are subject to availability\n• Advance booking is recommended, especially on weekends and holidays\n• Reservations may be cancelled if not honored on time",
        },
        {
          title: "Liability",
          content:
            "• Entry and use of the venue is at the visitor's own risk\n• The operator assumes no liability for loss, injury, or damage to the fullest extent permitted by law\n• Visitors must maintain personal safety and follow safety guidelines",
        },
        {
          title: "Intellectual Property",
          content:
            "All content displayed on the website, including text, images, designs, and logos, is the intellectual property of Diriyah and is protected by intellectual property laws. No content may be copied or reproduced without prior written permission.",
        },
        {
          title: "Modifications",
          content:
            "We reserve the right to modify these terms and conditions at any time. Any changes will be posted on this page with an updated modification date.",
        },
        {
          title: "Governing Law",
          content:
            "These terms and conditions are governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia.",
        },
        {
          title: "Contact",
          content:
            "For any questions about these terms and conditions:\n• Email: info@diriyah.sa\n• Phone: +966 920 000 000",
        },
      ];

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <SEOHead
        title={isAr ? "الشروط والأحكام" : "Terms & Conditions"}
        description={isAr ? "الشروط والأحكام لموقع الدرعية" : "Diriyah Terms & Conditions"}
        path="/terms"
      />
      <Header />

      <section className="pt-20 sm:pt-28 pb-10 md:pb-16">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <BackButton />
          <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <Chevron className="w-3 h-3" />
            <span className="text-foreground">{isAr ? "الشروط والأحكام" : "Terms & Conditions"}</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
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

export default Terms;
