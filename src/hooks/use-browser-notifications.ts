// Browser Notification API + Vibration support for admin alerts

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

interface BrowserNotifyOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  vibrate?: boolean;
}

export function sendBrowserNotification({ title, body, icon, tag, vibrate = true }: BrowserNotifyOptions) {
  // Vibrate on mobile if supported
  if (vibrate && "vibrate" in navigator) {
    navigator.vibrate([200, 100, 200]);
  }

  // Only show browser notification if page is hidden (background/minimized)
  if (document.visibilityState !== "hidden") return;

  if (!("Notification" in window) || Notification.permission !== "granted") return;

  try {
    const notif = new Notification(title, {
      body,
      icon: icon || "/favicon.png",
      tag: tag || "admin-notification",
      badge: "/favicon.png",
      requireInteraction: true,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => notif.close(), 10000);
  } catch {
    // SW notifications fallback for mobile
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: icon || "/favicon.png",
          tag: tag || "admin-notification",
          badge: "/favicon.png",
        });
      });
    }
  }
}
