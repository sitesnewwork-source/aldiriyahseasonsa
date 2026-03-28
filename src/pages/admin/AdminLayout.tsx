import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare, LogOut, Menu, X, Home, User, Settings, Users,
  Ticket, UtensilsCrossed, CalendarCheck, LayoutDashboard, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminLogin from "./AdminLogin";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import NotificationPanel from "@/components/NotificationPanel";
import PullToRefresh from "@/components/PullToRefresh";
import AdminInstallPrompt from "@/components/admin/AdminInstallPrompt";

const navItems = [
  { label: "الزوار", icon: Users, path: "/admin/visitors", gradient: "from-violet-500 to-purple-600" },
  { label: "طلبات التذاكر", icon: Ticket, path: "/admin/orders", gradient: "from-emerald-500 to-teal-600" },
  { label: "حجوزات المطاعم", icon: UtensilsCrossed, path: "/admin/bookings", gradient: "from-amber-500 to-orange-500" },
  { label: "حجوزات الفعاليات", icon: CalendarCheck, path: "/admin/event-bookings", gradient: "from-pink-500 to-rose-500" },
  { label: "رسائل التواصل", icon: MessageSquare, path: "/admin/messages", gradient: "from-blue-500 to-indigo-500" },
  { label: "الإعدادات", icon: Settings, path: "/admin/settings", gradient: "from-slate-500 to-slate-700" },
];

const bottomNavItems = navItems.slice(0, 4);
const swipePages = ["/admin", ...bottomNavItems.map(i => i.path)];

// Swipeable wrapper for mobile gesture navigation
const SwipeableContent = ({ children, navigate, currentPath }: { children: React.ReactNode; navigate: (path: string) => void; currentPath: string }) => {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiping = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    swiping.current = false;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;

    // Only horizontal swipe (dx > dy, min 80px)
    if (Math.abs(dx) < 80 || Math.abs(dy) > Math.abs(dx) * 0.7) return;

    const currentIndex = swipePages.indexOf(currentPath);
    if (currentIndex === -1) return;

    // RTL: swipe left = next, swipe right = prev (reversed)
    if (dx < 0 && currentIndex < swipePages.length - 1) {
      navigate(swipePages[currentIndex + 1]);
    } else if (dx > 0 && currentIndex > 0) {
      navigate(swipePages[currentIndex - 1]);
    }
  }, [currentPath, navigate]);

  return (
    <PullToRefresh onRefresh={async () => {
      window.dispatchEvent(new CustomEvent("admin-pull-refresh"));
      await new Promise(r => setTimeout(r, 600));
    }}>
      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {children}
      </div>
    </PullToRefresh>
  );
};

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
    if (themeTag) themeTag.setAttribute("content", "#0f172a");
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-3 border-blue-500/30 rounded-full" />
            <div className="absolute inset-0 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-sm text-slate-400">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (!session) return <AdminLogin onLogin={() => {}} />;

  const currentPage = navItems.find(i => i.path === location.pathname);
  const isDashboard = location.pathname === "/admin" || location.pathname === "/admin/";

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex" dir="rtl">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-[260px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-l border-slate-800/50 shadow-2xl transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-[15px]">الدرعية</h2>
                <p className="text-[10px] text-slate-500">لوحة الإدارة</p>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-200",
              isDashboard
                ? "bg-white/10 text-white font-semibold backdrop-blur-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )}
          >
            <LayoutDashboard className={cn("w-[18px] h-[18px]", isDashboard ? "text-amber-400" : "")} />
            لوحة التحكم
          </Link>

          <div className="pt-2 pb-1 px-3">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">الإدارة</span>
          </div>

          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-200",
                  active
                    ? "bg-white/10 text-white font-semibold backdrop-blur-sm"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                  active
                    ? `bg-gradient-to-br ${item.gradient} shadow-sm`
                    : "bg-white/5"
                )}>
                  <item.icon className={cn("w-3.5 h-3.5", active ? "text-white" : "text-slate-400")} />
                </div>
                {item.label}
                {item.path === "/admin/messages" && unreadCount > 0 && (
                  <span className="mr-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-sm shadow-red-500/30">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/5 space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
          >
            <Home className="w-[18px] h-[18px]" />
            العودة للموقع
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-[56px] flex items-center px-3 sm:px-4 gap-2 sm:gap-3 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {currentPage && (
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${currentPage.gradient} flex items-center justify-center shadow-sm`}>
                <currentPage.icon className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            {isDashboard && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                <LayoutDashboard className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <h1 className="text-[14px] sm:text-[15px] font-bold text-slate-800 truncate">
              {currentPage?.label || "لوحة التحكم"}
            </h1>
          </div>
          <div className="mr-auto flex items-center gap-1.5 sm:gap-2">
            <NotificationPanel inline />
            {unreadCount > 0 && (
              <Link to="/admin/messages" className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100/80 hover:bg-red-100 transition-colors">
                <MessageSquare className="w-3 h-3" />
                <span className="text-[11px] font-bold">{unreadCount}</span>
                <span className="text-[10px] hidden sm:inline">غير مقروءة</span>
              </Link>
            )}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100/80">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold">{onlineCount}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100/80">
              <Users className="w-3 h-3" />
              <span className="text-[11px] font-bold">{totalCount}</span>
              <span className="text-[10px] hidden sm:inline">إجمالي</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-default border border-slate-100/80">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              </div>
              <span className="text-[11px] sm:text-[12px] text-slate-600 font-medium hidden md:inline" dir="ltr">{session?.user?.email}</span>
            </div>
          </div>
        </header>

        <SwipeableContent navigate={navigate} currentPath={location.pathname}>
          <AdminInstallPrompt variant="banner" />
          <div className="p-3 sm:p-4 md:p-6 pb-20 lg:pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: swipeDirection === "left" ? 40 : swipeDirection === "right" ? -40 : 0, y: swipeDirection ? 0 : 8 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: swipeDirection === "left" ? -40 : swipeDirection === "right" ? 40 : 0, y: swipeDirection ? 0 : -8 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </SwipeableContent>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-[60px] px-1">
          {bottomNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
                  active ? "text-white" : "text-slate-400 active:text-slate-600"
                )}
              >
                <div className={cn(
                  "relative w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                  active ? `bg-gradient-to-br ${item.gradient} shadow-md` : ""
                )}>
                  <item.icon className={cn("w-[18px] h-[18px]", active ? "text-white" : "")} />
                  {item.path === "/admin/messages" && unreadCount > 0 && (
                    <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className={cn("text-[10px] leading-none", active ? "font-bold text-slate-800" : "font-medium")}>
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      
    </div>
  );
};

export default AdminLayout;
