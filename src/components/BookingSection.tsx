import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { actionNotify } from "@/hooks/use-action-notify";
import { supabase } from "@/integrations/supabase/client";
import { trackVisitorAction } from "@/hooks/use-visitor-tracking";

const BookingSection = () => {
  const [form, setForm] = useState({ name: "", phone: "", restaurant: "", date: "", guests: "1", notes: "" });

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.restaurant || !form.date) {
      actionNotify({ message: "يرجى تعبئة جميع الحقول المطلوبة", icon: "⚠️", sound: "soft" });
      return;
    }
    await supabase.from("restaurant_bookings").insert({
      name: form.name,
      phone: form.phone,
      restaurant: form.restaurant,
      booking_date: form.date,
      guests: parseInt(form.guests),
      notes: form.notes || null,
    });
    actionNotify({ message: "تم تأكيد الحجز بنجاح", icon: "✅", sound: "success" });
    trackVisitorAction("restaurant_booking", `حجز مطعم ${form.restaurant} — ${form.name} (${form.guests} أشخاص)`, undefined, { name: form.name, phone: form.phone });
    setForm({ name: "", phone: "", restaurant: "", date: "", guests: "1", notes: "" });
  };

  return (
    <section id="booking" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-gold text-sm tracking-[0.2em] uppercase mb-3 block">
              حجز
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              احجز طاولتك
            </h2>
            <div className="w-16 h-[2px] bg-gradient-gold mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              احجز مقعدك في أحد مطاعمنا المميزة واستمتع بتجربة طعام استثنائية
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-sm p-6 md:p-8 border border-border space-y-5"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">الاسم</label>
                <input
                  type="text"
                  placeholder="أدخل اسمك"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">رقم الجوال</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none pointer-events-none" dir="ltr">00966</span>
                  <input
                    type="tel"
                    placeholder="5XXXXXXXX"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 9) }))}
                    className="w-full bg-background border border-border rounded-sm pl-[52px] pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={9}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">المطعم</label>
                <select value={form.restaurant} onChange={(e) => setForm(f => ({ ...f, restaurant: e.target.value }))} className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold transition-colors">
                  <option value="">اختر المطعم</option>
                  <option>دار النخيل</option>
                  <option>لا تيرازا</option>
                  <option>لو جاردان</option>
                  <option>سطح الدرعية</option>
                  <option>ساكورا</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">التاريخ</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">عدد الأشخاص</label>
                <select value={form.guests} onChange={(e) => setForm(f => ({ ...f, guests: e.target.value }))} className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold transition-colors">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "شخص" : "أشخاص"}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">ملاحظات إضافية</label>
              <textarea
                rows={3}
                placeholder="أي طلبات خاصة..."
                value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-accent text-accent-foreground font-bold py-3 rounded-sm hover:bg-accent/90 transition-colors text-sm tracking-wide"
            >
              تأكيد الحجز
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
