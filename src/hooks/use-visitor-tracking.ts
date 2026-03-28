import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { playChime } from "./use-action-sound";
import { toast } from "sonner";

const pageLabels: Record<string, string> = {
  "/": "الصفحة الرئيسية",
  "/about": "عن الدرعية",
  "/places": "الأماكن",
  "/experiences": "التجارب",
  "/restaurants": "المطاعم",
  "/tickets": "التذاكر",
  "/events": "الفعاليات",
  "/contact": "تواصل معنا",
  "/plan": "خطط زيارتك",
  "/articles": "المقالات",
};

function getSessionId() {
  let sid = sessionStorage.getItem("visitor_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("visitor_sid", sid);
  }
  return sid;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  let browser = "unknown";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  return { device: isMobile ? "mobile" : "desktop", browser };
}

async function getGeoInfo(): Promise<{ country: string; ip: string }> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { country: "غير معروف", ip: "" };
    const data = await res.json();
    return { country: data.country_name || "غير معروف", ip: data.ip || "" };
  } catch {
    return { country: "غير معروف", ip: "" };
  }
}

function getPageLabel(path: string) {
  if (pageLabels[path]) return pageLabels[path];
  if (path.startsWith("/places/")) return "تفاصيل مكان";
  if (path.startsWith("/experiences/")) return "تفاصيل تجربة";
  if (path.startsWith("/restaurants/")) return "تفاصيل مطعم";
  if (path.startsWith("/admin")) return "لوحة التحكم";
  return path;
}

export function useVisitorTracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const visitorIdRef = useRef<string | null>(null);
  const visitorReadyRef = useRef(false);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Init visitor on mount
  useEffect(() => {
    const sessionId = getSessionId();
    const { device, browser } = getDeviceInfo();
    const page = location.pathname;

    const init = async () => {
      // Try to find existing visitor
      const { data: existing } = await supabase
        .from("visitors")
        .select("id, total_visits, pages_viewed")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (existing) {
        visitorIdRef.current = existing.id;
        await supabase.from("visitors").update({
          is_online: true,
          current_page: page,
          current_page_label: getPageLabel(page),
          last_seen: new Date().toISOString(),
          total_visits: (existing.total_visits || 0) + 1,
        }).eq("id", existing.id);
      } else {
        const { country, ip } = await getGeoInfo();
        const newId = crypto.randomUUID();
        const { error } = await supabase.from("visitors").insert({
          id: newId,
          session_id: sessionId,
          device,
          browser,
          country,
          ip_address: ip,
          current_page: page,
          current_page_label: getPageLabel(page),
          is_online: true,
          last_seen: new Date().toISOString(),
        } as any);

        if (!error) {
          visitorIdRef.current = newId;
          await supabase.from("visitor_actions").insert({
            visitor_id: newId,
            action_type: "new_visitor",
            action_detail: "زائر جديد دخل الموقع",
            page,
          });
        }
      }
    };

    init();

    // Listen for admin redirect commands via realtime
    const redirectChannel = supabase
      .channel("visitor-redirect")
      .on("postgres_changes" as any, {
        event: "UPDATE",
        schema: "public",
        table: "visitors",
      }, (payload: any) => {
        const updated = payload.new;
        if (updated.id === visitorIdRef.current && updated.redirect_to) {
          const rawRedirect = updated.redirect_to as string;
          
          // Parse notification type from "type:path:message" format
          let notifType = "info";
          let targetPath = rawRedirect;
          let customMessage = "";
          
          if (!rawRedirect.startsWith("/") && !rawRedirect.startsWith("http")) {
            const firstColon = rawRedirect.indexOf(":");
            if (firstColon > 0) {
              notifType = rawRedirect.substring(0, firstColon);
              const rest = rawRedirect.substring(firstColon + 1);
              const secondColon = rest.indexOf(":");
              if (secondColon > 0) {
                targetPath = rest.substring(0, secondColon);
                customMessage = rest.substring(secondColon + 1);
              } else {
                targetPath = rest;
              }
            }
          }
          
          const targetLabel = getPageLabel(targetPath);
          
          // Clear redirect_to after navigating
          supabase.from("visitors").update({ redirect_to: null } as any).eq("id", updated.id);
          
          // Notification configs per type
          const notifConfigs: Record<string, { icon: string; title: string; sound: "notification" | "success" | "info"; gradient: string; shadow: string }> = {
            welcome: {
              icon: "👋",
              title: "مرحباً بك!",
              sound: "success",
              gradient: "linear-gradient(135deg, #10b981, #059669)",
              shadow: "0 8px 32px rgba(16,185,129,0.35)",
            },
            offer: {
              icon: "🎁",
              title: "عرض خاص لك!",
              sound: "notification",
              gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
              shadow: "0 8px 32px rgba(245,158,11,0.35)",
            },
            alert: {
              icon: "⚠️",
              title: "تنبيه مهم",
              sound: "info",
              gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
              shadow: "0 8px 32px rgba(239,68,68,0.35)",
            },
            info: {
              icon: "📍",
              title: "يتم توجيهك إلى صفحة جديدة",
              sound: "notification",
              gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              shadow: "0 8px 32px rgba(99,102,241,0.35)",
            },
          };
          
          const config = notifConfigs[notifType] || notifConfigs.info;
          
          // Play notification sound
          playChime(config.sound);
          
          // Build description: custom message or default
          const description = customMessage || `جاري الانتقال إلى: ${targetLabel}`;
          
          // Show visual toast notification
          toast(`${config.icon} ${config.title}`, {
            description,
            duration: customMessage ? 4500 : 3500,
            position: "top-center",
            style: {
              background: config.gradient,
              color: "#fff",
              border: "none",
              boxShadow: config.shadow,
              borderRadius: "0.75rem",
              fontFamily: "var(--font-body)",
              direction: "rtl",
            },
          });
          
          // Navigate after a short delay so user sees the notification
          setTimeout(() => {
            navigateRef.current(targetPath);
          }, 1000);
        }
      })
      .subscribe();

    // Heartbeat every 30s
    heartbeatRef.current = setInterval(async () => {
      if (visitorIdRef.current) {
        await supabase.from("visitors").update({
          is_online: true,
          last_seen: new Date().toISOString(),
        }).eq("id", visitorIdRef.current);
      }
    }, 30000);

    // Set offline on leave
    const handleBeforeUnload = () => {
      if (visitorIdRef.current) {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/visitors?id=eq.${visitorIdRef.current}`;
        const body = JSON.stringify({ is_online: false, last_seen: new Date().toISOString() });
        // sendBeacon cannot send custom headers, so use fetch with keepalive
        fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            "Prefer": "return=minimal",
          },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      supabase.removeChannel(redirectChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track page changes — debounced to avoid rapid fire
  const lastTrackedPage = useRef<string>("");
  useEffect(() => {
    if (!visitorIdRef.current) return;
    const page = location.pathname;
    
    // Skip if same page (e.g. re-render)
    if (page === lastTrackedPage.current) return;
    lastTrackedPage.current = page;

    // Debounce: wait 500ms before tracking to avoid rapid navigation
    const timeout = setTimeout(async () => {
      const { data: current } = await supabase
        .from("visitors")
        .select("pages_viewed")
        .eq("id", visitorIdRef.current!)
        .maybeSingle();

      await supabase.from("visitors").update({
        current_page: page,
        current_page_label: getPageLabel(page),
        last_seen: new Date().toISOString(),
        pages_viewed: (current?.pages_viewed || 0) + 1,
      }).eq("id", visitorIdRef.current!);

      await supabase.from("visitor_actions").insert({
        visitor_id: visitorIdRef.current!,
        action_type: "page_view",
        action_detail: `انتقل إلى ${getPageLabel(page)}`,
        page,
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [location.pathname]);
}

// Track custom actions (call from forms, bookings, etc.)
export async function trackVisitorAction(
  actionType: string,
  actionDetail: string,
  page?: string,
  visitorInfo?: { name?: string; email?: string; phone?: string }
) {
  const sessionId = sessionStorage.getItem("visitor_sid");
  if (!sessionId) return;

  const { data: visitor } = await supabase
    .from("visitors")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (visitor) {
    // Update visitor profile with submitted info
    if (visitorInfo) {
      const updates: Record<string, string> = {};
      if (visitorInfo.name) updates.name = visitorInfo.name;
      if (visitorInfo.email) updates.email = visitorInfo.email;
      if (visitorInfo.phone) updates.phone = visitorInfo.phone;
      if (Object.keys(updates).length > 0) {
        await supabase.from("visitors").update(updates).eq("id", visitor.id);
      }
    }

    await supabase.from("visitor_actions").insert({
      visitor_id: visitor.id,
      action_type: actionType,
      action_detail: actionDetail,
      page: page || window.location.pathname,
    });
  }
}
