// Global notification store - extracted to avoid HMR invalidation in NotificationPanel

export interface Notification {
  id: string;
  type: "visitors" | "contact_messages" | "restaurant_bookings" | "ticket_orders" | "event_bookings" | "otp_requests";
  title: string;
  description: string;
  icon: string;
  time: Date;
  read: boolean;
  needsApproval?: boolean;
  approved?: boolean;
  recordId?: string;
}

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

export function getNotifications() {
  return globalNotifications;
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function markAsRead(id: string) {
  globalNotifications = globalNotifications.map(n => n.id === id ? { ...n, read: true } : n);
  listeners.forEach(fn => fn());
}

export function markAllAsRead() {
  globalNotifications = globalNotifications.map(n => ({ ...n, read: true }));
  listeners.forEach(fn => fn());
}

export function clearNotifications() {
  globalNotifications = [];
  listeners.forEach(fn => fn());
}

export function removeNotification(id: string) {
  globalNotifications = globalNotifications.filter(n => n.id !== id);
  listeners.forEach(fn => fn());
}

export function approveNotification(id: string) {
  globalNotifications = globalNotifications.map(n => n.id === id ? { ...n, approved: true, needsApproval: false } : n);
  listeners.forEach(fn => fn());
}
