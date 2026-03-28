import { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, LogOut, Menu, X, Home, User, Settings, Users, Ticket, UtensilsCrossed, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import AdminLogin from "./AdminLogin";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import NotificationPanel from "@/components/NotificationPanel";
import PullToRefresh from "@/components/PullToRefresh";
import AdminInstallPrompt from "@/components/admin/AdminInstallPrompt";

const navItems = [
  { label: "الزوار", icon: Users, path: "/admin/visitors" },
  { label: "طلبات التذاكر", icon: Ticket, path: "/admin/orders" },
  { label: "حجوزات المطاعم", icon: UtensilsCrossed, path: "/admin/bookings" },
  { label: "حجوزات الفعاليات", icon: CalendarCheck, path: "/admin/event-bookings" },
  { label: "رسائل التواصل", icon: MessageSquare, path: "/admin/messages" },
  { label: "الإعدادات", icon: Settings, path: "/admin/settings" },
];

const bottomNavItems = navItems.slice(0, 4);

const AdminLayout = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  useRealtimeNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const originalManifest = document.querySelector('link[rel="manifest"]');
    const originalHref = originalManifest?.getAttribute("href") || "";
    if (originalManifest) {
      originalManifest.setAttribute("href", "/admin-manifest.json");
    } else {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/admin-manifest.json";
      document.head.appendChild(link);
    }
    let themeTag = document.querySelector('meta[name="theme-color"]');
    const originalTheme = themeTag?.getAttribute("content") || "";
    if (themeTag) themeTag.setAttribute("content", "#3B82F6");
    const originalTitle = document.title;
    document.title = "لوحة التحكم - الدرعية";
    return () => {
      if (originalManifest && originalHref) originalManifest.setAttribute("href", originalHref);
      if (themeTag && originalTheme) themeTag.setAttribute("content", originalTheme);
      document.title = originalTitle;
    };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      const { data } = await supabase.from("contact_messages").select("id").eq("is_read", false);
      setUnreadCount(data?.length || 0);
    };
    fetchUnread();
    const ch = supabase.channel("unread-counter")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "contact_messages" }, () => fetchUnread())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const [onlineCount, setOnlineCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchVisitorStats = useCallback(async () => {
    const { data } = await supabase.from("visitors").select("is_online, last_seen");
    if (data) {
      const now = Date.now();
      const online = data.filter(v => v.is_online && (now - new Date(v.last_seen).getTime() < 60000)).length;
      setOnlineCount(online);
      setTotalCount(data.length);
    }
  }, []);

  useEffect(() => {
    fetchVisitorStats();
    const interval = setInterval(fetchVisitorStats, 15000);
    const ch = supabase.channel("header-visitors")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "visitors" }, () => fetchVisitorStats())
      .subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(ch); };
  }, [fetchVisitorStats]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (!session) return <AdminLogin onLogin={() => {}} />;

  const currentPage = navItems.find(i => i.path === location.pathname);

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex" dir="rtl">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-[260px] bg-white border-l border-slate-200 shadow-lg transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25">
                <span className="text-white font-bold text-sm">د</span>
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-[15px]">الدرعية</h2>
                <p className="text-[10px] text-slate-400">لوحة الإدارة</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-200",
                  active ? "bg-blue-50 text-blue-600 font-semibold shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px]", active ? "text-blue-500" : "")} />
                {item.label}
                {item.path === "/admin/messages" && unreadCount > 0 && (
                  <span className="mr-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <Home className="w-[18px] h-[18px]" />
            العودة للموقع
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 h-[56px] flex items-center px-3 sm:px-4 gap-2 sm:gap-3 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-[14px] sm:text-[15px] font-semibold text-slate-800 truncate">{currentPage?.label || "لوحة التحكم"}</h1>
          <div className="mr-auto flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold">{onlineCount}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700">
              <Users className="w-3 h-3" />
              <span className="text-[11px] font-semibold">{totalCount}</span>
              <span className="text-[10px] hidden sm:inline">إجمالي</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-default">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              </div>
              <span className="text-[11px] sm:text-[12px] text-slate-600 hidden md:inline" dir="ltr">{session?.user?.email}</span>
            </div>
          </div>
        </header>

        <PullToRefresh onRefresh={async () => {
          window.dispatchEvent(new CustomEvent("admin-pull-refresh"));
          await new Promise(r => setTimeout(r, 600));
        }}>
          <AdminInstallPrompt variant="banner" />
          <div className="p-3 sm:p-4 md:p-6 pb-20 lg:pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </PullToRefresh>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-[60px] px-1">
          {bottomNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
                  active ? "text-blue-600" : "text-slate-400 active:text-slate-600"
                )}
              >
                <div className={cn(
                  "relative w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                  active ? "bg-blue-50 shadow-sm" : ""
                )}>
                  <item.icon className={cn("w-[18px] h-[18px]", active ? "text-blue-500" : "")} />
                  {item.path === "/admin/messages" && unreadCount > 0 && (
                    <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className={cn("text-[10px] leading-none", active ? "font-semibold" : "font-medium")}>
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <NotificationPanel />
    </div>
  );
};

export default AdminLayout;
