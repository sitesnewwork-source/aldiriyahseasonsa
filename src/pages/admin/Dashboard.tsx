import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, UtensilsCrossed, Ticket, TrendingUp, ArrowUpRight, Clock, CalendarCheck, Newspaper } from "lucide-react";
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

    // Build recent activity
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
      .on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "contact_messages" }, () => fetchStats())
      .on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "restaurant_bookings" }, () => fetchStats())
      .on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "ticket_orders" }, () => fetchStats())
      .on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "event_bookings" }, () => fetchStats())
      .on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "newsletter_subscribers" }, () => fetchStats())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Pull to refresh support
  useEffect(() => {
    const handler = () => fetchStats();
    window.addEventListener("admin-pull-refresh", handler);
    return () => window.removeEventListener("admin-pull-refresh", handler);
  }, []);

  const cards = [
    { title: "رسائل التواصل", value: stats.totalMessages, sub: `${stats.unreadMessages} غير مقروءة`, icon: MessageSquare, color: "from-blue-500 to-blue-600", lightBg: "bg-blue-50", textColor: "text-blue-600", link: "/admin/messages" },
    { title: "حجوزات المطاعم", value: stats.totalBookings, sub: `${stats.pendingBookings} قيد الانتظار`, icon: UtensilsCrossed, color: "from-amber-500 to-orange-500", lightBg: "bg-amber-50", textColor: "text-amber-600", link: "/admin/bookings" },
    { title: "حجوزات الفعاليات", value: stats.totalEventBookings, sub: `${stats.pendingEventBookings} قيد الانتظار`, icon: CalendarCheck, color: "from-pink-500 to-rose-500", lightBg: "bg-pink-50", textColor: "text-pink-600", link: "/admin/event-bookings" },
    { title: "طلبات التذاكر", value: stats.totalOrders, sub: `${stats.totalRevenue} ر.س`, icon: Ticket, color: "from-emerald-500 to-green-600", lightBg: "bg-emerald-50", textColor: "text-emerald-600", link: "/admin/orders" },
    { title: "إجمالي الإيرادات", value: `${stats.totalRevenue}`, sub: "ريال سعودي", icon: TrendingUp, color: "from-violet-500 to-purple-600", lightBg: "bg-violet-50", textColor: "text-violet-600", link: "/admin/orders" },
    { title: "مشتركي النشرة", value: stats.totalSubscribers, sub: "مشترك", icon: Newspaper, color: "from-cyan-500 to-teal-500", lightBg: "bg-cyan-50", textColor: "text-cyan-600", link: "/admin/settings" },
  ];

  const typeIcon = { message: MessageSquare, booking: UtensilsCrossed, order: Ticket, event_booking: CalendarCheck };
  const typeColor = { message: "text-blue-500 bg-blue-50", booking: "text-amber-500 bg-amber-50", order: "text-emerald-500 bg-emerald-50", event_booking: "text-pink-500 bg-pink-50" };
  const statusBadge: Record<string, { label: string; cls: string }> = {
    unread: { label: "جديد", cls: "bg-red-100 text-red-600" },
    read: { label: "مقروء", cls: "bg-slate-100 text-slate-500" },
    pending: { label: "قيد الانتظار", cls: "bg-amber-100 text-amber-600" },
    confirmed: { label: "مؤكد", cls: "bg-emerald-100 text-emerald-600" },
    cancelled: { label: "ملغي", cls: "bg-red-100 text-red-600" },
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link key={card.title} to={card.link} className="group">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <p className="text-[28px] font-bold text-slate-800 leading-none">
                {loading ? (
                  <span className="inline-block w-12 h-7 bg-slate-100 rounded-lg animate-pulse" />
                ) : card.value}
              </p>
              <p className="text-[13px] text-slate-500 mt-1.5">{card.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="text-[15px] font-semibold text-slate-800">آخر النشاطات</h2>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-9 h-9 bg-slate-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="w-1/3 h-3 bg-slate-100 rounded" />
                  <div className="w-1/2 h-2.5 bg-slate-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">لا توجد نشاطات بعد</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map((item) => {
              const Icon = typeIcon[item.type];
              const colorCls = typeColor[item.type];
              const badge = statusBadge[item.status || ""];
              return (
                <div key={item.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorCls}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-700 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {badge && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
                        {badge.label}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
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
