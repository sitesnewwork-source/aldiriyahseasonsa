import { useState, useEffect, useCallback, useMemo } from "react";
import { Bell, X, User, MessageSquare, UtensilsCrossed, Ticket, Trash2, CheckCircle2, Clock, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { playChime } from "@/hooks/use-action-sound";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  type: "visitors" | "contact_messages" | "restaurant_bookings" | "ticket_orders" | "event_bookings";
  title: string;
  description: string;
  icon: string;
  time: Date;
  read: boolean;
  needsApproval?: boolean;
  approved?: boolean;
  recordId?: string;
}

const typeIcons: Record<string, typeof User> = {
  visitors: User,
  contact_messages: MessageSquare,
  restaurant_bookings: UtensilsCrossed,
  event_bookings: CalendarCheck,
  ticket_orders: Ticket,
};

const typeColors: Record<string, string> = {
  visitors: "bg-emerald-50 text-emerald-600",
  contact_messages: "bg-blue-50 text-blue-600",
  restaurant_bookings: "bg-amber-50 text-amber-600",
  event_bookings: "bg-pink-50 text-pink-600",
  ticket_orders: "bg-purple-50 text-purple-600",
};

// Global notification store
let globalNotifications: Notification[] = [];
let listeners: Set<() => void> = new Set();

export function pushNotification(n: Omit<Notification, "id" | "time" | "read">) {
  const notif: Notification = {
    ...n,
    id: crypto.randomUUID(),
    time: new Date(),
    read: false,
  };
  globalNotifications = [notif, ...globalNotifications].slice(0, 50);
  listeners.forEach((fn) => fn());
}

function useNotificationStore() {
  const [notifications, setNotifications] = useState<Notification[]>(globalNotifications);

  useEffect(() => {
    const update = () => setNotifications([...globalNotifications]);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  const clear = useCallback(() => {
    globalNotifications = [];
    listeners.forEach((fn) => fn());
  }, []);

  const markAllRead = useCallback(() => {
    globalNotifications = globalNotifications.map((n) => ({ ...n, read: true }));
    listeners.forEach((fn) => fn());
  }, []);

  const approveNotification = useCallback((notifId: string) => {
    globalNotifications = globalNotifications.map((n) =>
      n.id === notifId ? { ...n, approved: true, needsApproval: false } : n
    );
    listeners.forEach((fn) => fn());
  }, []);

  return { notifications, clear, markAllRead, approveNotification };
}

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const { notifications, clear, markAllRead, approveNotification } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const pendingCount = notifications.filter((n) => n.needsApproval && !n.approved).length;
  const [prevCount, setPrevCount] = useState(notifications.length);
  const { toast } = useToast();

  const handleApprove = async (notif: Notification) => {
    if (!notif.recordId) return;

    const table = notif.type === "ticket_orders" ? "ticket_orders"
      : notif.type === "restaurant_bookings" ? "restaurant_bookings"
      : null;

    if (!table) return;

    const { error } = await supabase
      .from(table)
      .update({ status: "confirmed" })
      .eq("id", notif.recordId);

    if (error) {
      toast({ title: "خطأ", description: "فشل في تأكيد الطلب", variant: "destructive" });
      return;
    }

    playChime("success");
    approveNotification(notif.id);
    toast({ title: "✅ تمت الموافقة", description: "تم تأكيد الطلب بنجاح" });
  };

  // Auto-open briefly on new notification with sound
  useEffect(() => {
    if (notifications.length > prevCount) {
      setOpen(true);
      playChime("notification");
    }
    setPrevCount(notifications.length);
  }, [notifications.length, prevCount]);

  const getTimeAgo = (d: Date) => {
    const secs = Math.floor((Date.now() - d.getTime()) / 1000);
    if (secs < 60) return `منذ ${secs} ث`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `منذ ${mins} د`;
    return `منذ ${Math.floor(mins / 60)} س`;
  };

  // Tick every second to update elapsed timers for pending items
  const [, setTick] = useState(0);
  const hasPending = notifications.some((n) => n.needsApproval && !n.approved);
  useEffect(() => {
    if (!hasPending) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [hasPending]);

  const getElapsed = (d: Date) => {
    const secs = Math.floor((Date.now() - d.getTime()) / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m > 0) return `${m}:${String(s).padStart(2, "0")}`;
    return `0:${String(s).padStart(2, "0")}`;
  };

  return (
    <>
      {/* Toggle Button - fixed left */}
      <button
        onClick={() => {
          playChime("click");
          setOpen(!open);
          if (!open) markAllRead();
        }}
        className="fixed left-4 top-20 z-[60] w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-slate-50 transition-all btn-press"
      >
        <Bell className={cn("w-4.5 h-4.5 text-slate-600 transition-transform", unreadCount > 0 && "animate-[wiggle_0.5s_ease-in-out]")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      <div
        className={cn(
          "fixed left-0 top-0 z-[55] h-full w-[320px] bg-white border-r border-slate-200 shadow-2xl transform transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="text-[14px] font-semibold text-slate-800">التنبيهات</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {pendingCount} بانتظار
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                onClick={() => { playChime("delete"); clear(); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors btn-press"
                title="مسح الكل"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => { playChime("whoosh"); setOpen(false); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors btn-press"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                <Bell className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-[13px] text-slate-400">لا توجد تنبيهات حتى الآن</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((n, idx) => {
                const Icon = typeIcons[n.type] || Bell;
                const colorClass = typeColors[n.type] || "bg-slate-50 text-slate-600";
                const isPending = n.needsApproval && !n.approved;
                const isApproved = n.approved;
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl transition-all cursor-default",
                      isPending
                        ? "bg-amber-50/60 border border-amber-200/60"
                        : isApproved
                        ? "bg-emerald-50/40 border border-emerald-200/50"
                        : n.read
                        ? "bg-white"
                        : "bg-blue-50/40",
                      idx === 0 && !n.read && "animate-slide-in-bounce"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", colorClass)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[12px] font-semibold text-slate-700">{n.title}</p>
                        {isPending && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-100 rounded-full px-1.5 py-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            بانتظار
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-100 rounded-full px-1.5 py-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            تمت الموافقة
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{n.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-slate-400">{getTimeAgo(n.time)}</p>
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5 animate-pulse">
                            ⏱ {getElapsed(n.time)}
                          </span>
                        )}
                        {isPending && (
                          <button
                            onClick={() => handleApprove(n)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-md px-2 py-0.5 transition-colors btn-press"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            موافقة
                          </button>
                        )}
                      </div>
                    </div>
                    {!n.read && !isPending && !isApproved && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[54] bg-black/10 backdrop-blur-[2px]"
          onClick={() => { playChime("whoosh"); setOpen(false); }}
        />
      )}
    </>
  );
}
