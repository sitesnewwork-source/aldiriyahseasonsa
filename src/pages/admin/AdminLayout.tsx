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
  { label: "الإعدادات", icon: Settings, path: "/admin/settings", gradient: "from-slate-500 to-slate-700" },
];

const bottomNavItems = navItems;
const swipePages = ["/admin", ...navItems.map(i => i.path)];

// Swipeable wrapper for mobile gesture navigation
const SwipeableContent = ({ children, navigate, currentPath, swipeDirRef }: { children: React.ReactNode; navigate: (path: string) => void; currentPath: string; swipeDirRef: React.MutableRefObject<string> }) => {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(dx) < 80 || Math.abs(dy) > Math.abs(dx) * 0.7) return;

    const currentIndex = swipePages.indexOf(currentPath);
    if (currentIndex === -1) return;

    if (dx < 0 && currentIndex < swipePages.length - 1) {
      swipeDirRef.current = "left";
      navigate(swipePages[currentIndex + 1]);
    } else if (dx > 0 && currentIndex > 0) {
      swipeDirRef.current = "right";
      navigate(swipePages[currentIndex - 1]);
    }
  }, [currentPath, navigate, swipeDirRef]);

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
  const [unreadCount, setUnreadCount] = useState(0);
  const swipeDirRef = useRef("");
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
    <div className="min-h-screen bg-[#f0f2f5] flex overflow-x-hidden" dir="rtl">

      <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-[56px] flex items-center px-3 sm:px-4 gap-2 sm:gap-3 shadow-sm">
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

        <SwipeableContent navigate={navigate} currentPath={location.pathname} swipeDirRef={swipeDirRef}>
          <AdminInstallPrompt variant="banner" />
          <div className="p-3 sm:p-4 md:p-6 pb-20 lg:pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onAnimationComplete={() => { swipeDirRef.current = ""; }}
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
