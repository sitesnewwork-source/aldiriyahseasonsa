import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare, UtensilsCrossed, Ticket, TrendingUp, ArrowUpRight, Clock,
  CalendarCheck, Newspaper, Sparkles, DollarSign, Users, BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Stats {
  totalMessages: number;
  unreadMessages: number;
  totalBookings: number;
  pendingBookings: number;
  totalOrders: number;
  totalRevenue: number;
  totalEventBookings: number;
  pendingEventBookings: number;
  totalSubscribers: number;
}

interface RecentItem {
  id: string;
  type: "message" | "booking" | "order" | "event_booking";
  title: string;
  subtitle: string;
  time: string;
  status?: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0, unreadMessages: 0,
    totalBookings: 0, pendingBookings: 0,
    totalOrders: 0, totalRevenue: 0,
    totalEventBookings: 0, pendingEventBookings: 0,
    totalSubscribers: 0,
  });
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const [messages, bookings, orders, eventBookings, subscribers,
           msgCount, bookCount, orderCount, eventCount] = await Promise.all([
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("restaurant_bookings").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("ticket_orders").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("event_bookings").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id, is_read", { count: "exact" }),
      supabase.from("restaurant_bookings").select("id, status", { count: "exact" }),
      supabase.from("ticket_orders").select("id, total, status", { count: "exact" }),
      supabase.from("event_bookings").select("id, status", { count: "exact" }),
    ]);

    const allMessages = messages.data || [];
    const allBookings = bookings.data || [];
    const allOrders = orders.data || [];
    const allEventBookings = eventBookings.data || [];

    const allMsgData = msgCount.data || [];
    const allBookData = bookCount.data || [];
    const allOrderData = orderCount.data || [];
    const allEventData = eventCount.data || [];

    setStats({
      totalMessages: msgCount.count || allMsgData.length,
      unreadMessages: allMsgData.filter((m: any) => !m.is_read).length,
      totalBookings: bookCount.count || allBookData.length,
      pendingBookings: allBookData.filter((b: any) => b.status === "pending").length,
      totalOrders: orderCount.count || allOrderData.length,
      totalRevenue: allOrderData.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
      totalEventBookings: eventCount.count || allEventData.length,
      pendingEventBookings: allEventData.filter((e: any) => e.status === "pending").length,
      totalSubscribers: subscribers.count || 0,
    });

    const items: RecentItem[] = [
      ...allMessages.slice(0, 3).map((m: any) => ({
        id: m.id, type: "message" as const,
        title: m.name, subtitle: m.subject || "رسالة جديدة",
        time: m.created_at, status: m.is_read ? "read" : "unread",
      })),
      ...allBookings.slice(0, 3).map((b: any) => ({
        id: b.id, type: "booking" as const,
        title: b.name, subtitle: `${b.restaurant} — ${b.guests} أشخاص`,
        time: b.created_at, status: b.status,
      })),
      ...allOrders.slice(0, 3).map((o: any) => ({
        id: o.id, type: "order" as const,
        title: o.email, subtitle: `${o.total} ر.س`,
        time: o.created_at, status: o.status,
      })),
      ...allEventBookings.slice(0, 3).map((e: any) => ({
        id: e.id, type: "event_booking" as const,
        title: e.name, subtitle: `${e.event_title} — ${e.guests} أشخاص`,
        time: e.created_at, status: e.status,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

    setRecent(items);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    const channel = supabase
      .channel("dashboard-stats")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "contact_messages" }, () => fetchStats())
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "restaurant_bookings" }, () => fetchStats())
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "ticket_orders" }, () => fetchStats())
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "event_bookings" }, () => fetchStats())
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "newsletter_subscribers" }, () => fetchStats())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const handler = () => fetchStats();
    window.addEventListener("admin-pull-refresh", handler);
    return () => window.removeEventListener("admin-pull-refresh", handler);
  }, []);

  const cards = [
    {
      title: "رسائل التواصل", value: stats.totalMessages,
      sub: `${stats.unreadMessages} غير مقروءة`,
      icon: MessageSquare,
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      shadow: "shadow-blue-500/30",
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : null,
      link: "/admin/messages",
    },
    {
      title: "حجوزات المطاعم", value: stats.totalBookings,
      sub: `${stats.pendingBookings} قيد الانتظار`,
      icon: UtensilsCrossed,
      gradient: "from-amber-400 via-orange-500 to-red-500",
      shadow: "shadow-orange-500/30",
      badge: stats.pendingBookings > 0 ? stats.pendingBookings : null,
      link: "/admin/bookings",
    },
    {
      title: "حجوزات الفعاليات", value: stats.totalEventBookings,
      sub: `${stats.pendingEventBookings} قيد الانتظار`,
      icon: CalendarCheck,
      gradient: "from-pink-500 via-rose-500 to-red-400",
      shadow: "shadow-pink-500/30",
      badge: stats.pendingEventBookings > 0 ? stats.pendingEventBookings : null,
      link: "/admin/event-bookings",
    },
    {
      title: "طلبات التذاكر", value: stats.totalOrders,
      sub: `${stats.totalRevenue} ر.س`,
      icon: Ticket,
      gradient: "from-emerald-400 via-green-500 to-teal-600",
      shadow: "shadow-emerald-500/30",
      badge: null,
      link: "/admin/orders",
    },
    {
      title: "إجمالي الإيرادات", value: stats.totalRevenue,
      sub: "ريال سعودي",
      icon: DollarSign,
      gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
      shadow: "shadow-purple-500/30",
      badge: null,
      link: "/admin/orders",
    },
    {
      title: "مشتركي النشرة", value: stats.totalSubscribers,
      sub: "مشترك",
      icon: Newspaper,
      gradient: "from-cyan-400 via-sky-500 to-blue-500",
      shadow: "shadow-sky-500/30",
      badge: null,
      link: "/admin/settings",
    },
  ];

  const typeIcon = { message: MessageSquare, booking: UtensilsCrossed, order: Ticket, event_booking: CalendarCheck };
  const typeGradient = {
    message: "from-blue-500 to-indigo-500",
    booking: "from-amber-500 to-orange-500",
    order: "from-emerald-500 to-teal-500",
    event_booking: "from-pink-500 to-rose-500",
  };
  const statusBadge: Record<string, { label: string; cls: string }> = {
    unread: { label: "جديد", cls: "bg-gradient-to-r from-red-500 to-rose-500 text-white" },
    read: { label: "مقروء", cls: "bg-slate-100 text-slate-500" },
    pending: { label: "قيد الانتظار", cls: "bg-gradient-to-r from-amber-400 to-orange-400 text-white" },
    confirmed: { label: "مؤكد", cls: "bg-gradient-to-r from-emerald-400 to-green-500 text-white" },
    cancelled: { label: "ملغي", cls: "bg-red-100 text-red-600" },
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 sm:p-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZyIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIvPjwvc3ZnPg==')] opacity-50" />
        <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] text-amber-400/80 font-medium">لوحة التحكم</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">مرحباً بك في الدرعية</h1>
            <p className="text-[12px] sm:text-[13px] text-slate-400 mt-1">إدارة الحجوزات والتذاكر والرسائل</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-left bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
              <p className="text-[20px] font-bold text-white">{loading ? "..." : stats.totalOrders + stats.totalBookings + stats.totalEventBookings}</p>
              <p className="text-[10px] text-slate-400">إجمالي العمليات</p>
            </div>
            <div className="text-left bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
              <p className="text-[20px] font-bold text-emerald-400">{loading ? "..." : stats.totalRevenue}</p>
              <p className="text-[10px] text-slate-400">ريال سعودي</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card) => (
          <Link key={card.title} to={card.link} className="group">
            <div className="relative bg-white rounded-2xl border border-slate-100/80 p-4 sm:p-5 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              {/* Decorative gradient blob */}
              <div className={`absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br ${card.gradient} rounded-full blur-2xl opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500`} />

              <div className="relative">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow} transition-transform duration-300 group-hover:scale-110`}>
                    <card.icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {card.badge && (
                      <span className="bg-red-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {card.badge}
                      </span>
                    )}
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-all duration-300" />
                  </div>
                </div>
                <p className="text-[22px] sm:text-[28px] font-bold text-slate-800 leading-none">
                  {loading ? (
                    <span className="inline-block w-12 h-7 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg animate-pulse" />
                  ) : card.value}
                </p>
                <p className="text-[12px] sm:text-[13px] text-slate-500 mt-1.5 font-medium">{card.title}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-100/80 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-l from-slate-50/80 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-[15px] font-bold text-slate-800">آخر النشاطات</h2>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{recent.length} نشاط</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-9 h-9 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="w-1/3 h-3 bg-slate-100 rounded" />
                  <div className="w-1/2 h-2.5 bg-slate-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm">لا توجد نشاطات بعد</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50/80">
            {recent.map((item, index) => {
              const Icon = typeIcon[item.type];
              const gradient = typeGradient[item.type];
              const badge = statusBadge[item.status || ""];
              return (
                <div
                  key={item.id}
                  className="px-5 py-3.5 flex items-center gap-3 hover:bg-gradient-to-l hover:from-slate-50/50 hover:to-transparent transition-all duration-200 group/item"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover/item:shadow-md group-hover/item:scale-105 transition-all duration-200`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {badge && (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm ${badge.cls}`}>
                        {badge.label}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {format(new Date(item.time), "dd MMM", { locale: ar })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
