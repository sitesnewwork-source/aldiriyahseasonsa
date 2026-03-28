import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackVisitorAction } from "@/hooks/use-visitor-tracking";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, ChevronLeft, ChevronRight, MessageSquare, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";
import BackButton from "@/components/BackButton";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";
import { actionNotify } from "@/hooks/use-action-notify";

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/diraborjAlDiriyah" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com/AlDiriyah" },
];

const ContactPage = () => {
  const { t, isRtl } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const contactInfo = [
    { icon: Phone, label: t("contact.phoneLabel"), value: "+966 92 0021 727", href: "tel:+966920021727" },
    { icon: Mail, label: t("contact.emailLabel"), value: "info@diriyah.sa", href: "mailto:info@diriyah.sa" },
    { icon: MapPin, label: t("contact.addressLabel"), value: t("contact.addressValue"), href: "#map" },
    { icon: Clock, label: t("contact.hoursLabel"), value: t("contact.hoursValue"), href: undefined },
  ];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t("contact.nameRequired");
    if (!form.email.trim()) errs.email = t("contact.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t("contact.emailInvalid");
    if (!form.message.trim()) errs.message = t("contact.messageRequired");
    else if (form.message.trim().length < 10) errs.message = t("contact.messageTooShort");
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      await supabase.from("contact_messages").insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        subject: form.subject || null,
        message: form.message,
      });
      setSubmitted(true);
      trackVisitorAction("contact_message", `رسالة من ${form.name} — ${form.subject || "بدون موضوع"}`, undefined, { name: form.name, email: form.email, phone: form.phone || undefined });
      actionNotify({ message: isRtl ? "تم إرسال رسالتك بنجاح" : "Message sent successfully", icon: "✅", sound: "success" });
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const BreadcrumbChevron = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="تواصل معنا" description="تواصل مع فريق الدرعية - معلومات الاتصال والعنوان وساعات العمل." path="/contact" />
      <Header />

      {/* Hero */}
      <section className="pt-20 sm:pt-28 pb-6 sm:pb-8 bg-gradient-to-b from-gold/5 to-background dark:from-gold/10 dark:to-background">
        <div className="container mx-auto px-4">
          <BackButton />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={isRtl ? "text-right" : "text-left"}>
            <div className={cn("flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mb-4", isRtl ? "" : "flex-row")}>
              <Link to="/" className="hover:text-foreground transition-colors">{t("common.home")}</Link>
              <BreadcrumbChevron className="w-3 h-3" />
              <span className="text-foreground">{t("contact.title")}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3">
              {t("contact.title")}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
              {t("contact.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-10 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">

          {/* Contact Form */}
          <div className={cn("lg:col-span-2", isRtl ? "order-2 lg:order-1" : "order-2 lg:order-1")}>
            <ScrollReveal animation="fade-up">
            <div
              className="bg-card rounded-lg border border-border p-5 sm:p-8"
            >
              <div className="flex items-center gap-2 mb-5">
                <MessageSquare className="w-5 h-5 text-gold" />
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">{t("contact.inquiryForm")}</h2>
              </div>
              <div className="h-px bg-border mb-6" />

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{t("contact.sent")}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{t("contact.sentDesc")}</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                    className="text-sm text-gold hover:text-gold/80 font-medium transition-colors"
                  >
                    {t("contact.sendAnother")}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">{t("contact.name")} *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder={t("contact.namePlaceholder")}
                        maxLength={100}
                        className="w-full bg-background dark:bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                      />
                      {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">{t("contact.email")} *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="example@email.com"
                        maxLength={255}
                        className="w-full bg-background dark:bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                      />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">{t("contact.phone")}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none pointer-events-none" dir="ltr">00966</span>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updateField("phone", e.target.value.replace(/[^0-9]/g, "").slice(0, 9))}
                          placeholder="5XXXXXXXX"
                          maxLength={9}
                          inputMode="numeric"
                          dir="ltr"
                          className="w-full bg-background dark:bg-muted/50 border border-border rounded-lg pl-[52px] pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">{t("contact.subject")}</label>
                      <select
                        value={form.subject}
                        onChange={(e) => updateField("subject", e.target.value)}
                        className="w-full bg-background dark:bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                      >
                        <option value="">{t("contact.selectSubject")}</option>
                        <option value="inquiry">{t("contact.subjectInquiry")}</option>
                        <option value="booking">{t("contact.subjectBooking")}</option>
                        <option value="events">{t("contact.subjectEvents")}</option>
                        <option value="complaint">{t("contact.subjectComplaint")}</option>
                        <option value="media">{t("contact.subjectMedia")}</option>
                        <option value="partnership">{t("contact.subjectPartnership")}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{t("contact.message")} *</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      placeholder={t("contact.messagePlaceholder")}
                      rows={5}
                      maxLength={1000}
                      className="w-full bg-background dark:bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.message ? (
                        <p className="text-xs text-destructive">{errors.message}</p>
                      ) : <span />}
                      <span className="text-[10px] text-muted-foreground">{form.message.length}/1000</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-accent text-accent-foreground font-bold py-3.5 rounded-lg hover:bg-accent/90 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {t("contact.send")}
                  </button>
                </form>
              )}
            </div>
            </ScrollReveal>

            {/* Map */}
            <ScrollReveal animation="fade-up" delay={0.1}>
            <div
              className="bg-card rounded-lg border border-border p-5 sm:p-8 mt-6"
              id="map"
            >
              <h2 className={cn("font-display text-lg sm:text-xl font-bold text-foreground mb-4", isRtl ? "text-right" : "text-left")}>{t("contact.ourLocation")}</h2>
              <div className="h-px bg-border mb-4" />
              <div className="rounded-lg overflow-hidden aspect-video">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.5!2d46.5747979!3d24.7373233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQ0JzE0LjQiTiA0NsKwMzQnMjkuMyJF!5e0!3m2!1sar!2ssa!4v1600000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 280 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={t("contact.ourLocation")}
                />
              </div>
            </div>
            </ScrollReveal>
          </div>

          {/* Sidebar */}
          <div className={cn("lg:col-span-1", isRtl ? "order-1 lg:order-2" : "order-1 lg:order-2")}>
            <ScrollReveal animation="fade-left" delay={0.15}>
            <div
              className="bg-card rounded-lg border border-border p-5 sm:p-6 sticky top-28 space-y-5"
            >
              <h3 className="font-display text-lg font-bold text-foreground">{t("contact.contactInfo")}</h3>
              <div className="h-px bg-border" />

              <div className="space-y-4">
                {contactInfo.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-medium text-foreground hover:text-gold transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-foreground">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-border" />

              <div>
                <p className="text-xs text-muted-foreground mb-3">{t("contact.followUs")}</p>
                <div className="flex gap-2">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-gold/10 hover:border-gold/30 transition-colors"
                    >
                      <social.icon className="w-4 h-4 text-foreground" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border" />

              <Link
                to="/tickets"
                className="block w-full bg-accent text-accent-foreground font-bold py-3.5 rounded-lg hover:bg-accent/90 transition-colors text-sm text-center"
              >
                {t("contact.bookTicket")}
              </Link>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
