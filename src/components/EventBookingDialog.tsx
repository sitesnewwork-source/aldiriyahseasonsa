import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { trackVisitorAction } from "@/hooks/use-visitor-tracking";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarCheck, Users, Loader2 } from "lucide-react";

interface EventBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
  eventTitleEn: string;
}

const EventBookingDialog = ({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  eventTitleEn,
}: EventBookingDialogProps) => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    guests: 1,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({
        title: isAr ? "خطأ" : "Error",
        description: isAr ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("event_bookings").insert({
      event_id: eventId,
      event_title: isAr ? eventTitle : eventTitleEn,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      guests: form.guests,
      notes: form.notes.trim() || null,
    });
    setLoading(false);

    if (error) {
      toast({
        title: isAr ? "خطأ" : "Error",
        description: isAr ? "حدث خطأ، يرجى المحاولة لاحقاً" : "Something went wrong, please try again",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: isAr ? "تم الحجز بنجاح! 🎉" : "Booking Confirmed! 🎉",
      description: isAr ? "سنتواصل معك قريباً لتأكيد الحجز" : "We'll contact you soon to confirm",
    });
    setForm({ name: "", phone: "", email: "", guests: 1, notes: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={isAr ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CalendarCheck className="w-5 h-5 text-primary" />
            {isAr ? "حجز فعالية" : "Book Event"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr ? eventTitle : eventTitleEn}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {isAr ? "الاسم الكامل *" : "Full Name *"}
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={isAr ? "أدخل اسمك الكامل" : "Enter your full name"}
              className="text-base"
              style={{ fontSize: "16px" }}
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {isAr ? "رقم الجوال *" : "Phone Number *"}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none pointer-events-none" dir="ltr">00966</span>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 9) })}
                placeholder="5XXXXXXXX"
                className="text-base pl-[52px]"
                style={{ fontSize: "16px" }}
                type="tel"
                inputMode="numeric"
                maxLength={9}
                dir="ltr"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {isAr ? "البريد الإلكتروني" : "Email"}
            </label>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={isAr ? "اختياري" : "Optional"}
              className="text-base"
              style={{ fontSize: "16px" }}
              type="email"
              maxLength={255}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {isAr ? "عدد الأشخاص" : "Number of Guests"}
            </label>
            <Input
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })}
              type="number"
              min={1}
              max={50}
              className="text-base"
              style={{ fontSize: "16px" }}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {isAr ? "ملاحظات" : "Notes"}
            </label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={isAr ? "أي ملاحظات إضافية..." : "Any additional notes..."}
              className="text-base resize-none"
              style={{ fontSize: "16px" }}
              rows={3}
              maxLength={500}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              isAr ? "تأكيد الحجز" : "Confirm Booking"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventBookingDialog;
