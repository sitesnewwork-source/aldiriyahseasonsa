import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarCheck, Trash2, Check, X, Users, Phone, Mail, Clock } from "lucide-react";
import ExportButtons from "@/components/admin/ExportButtons";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface EventBooking {
  id: string;
  event_id: string;
  event_title: string;
  name: string;
  phone: string;
  email: string | null;
  guests: number;
  notes: string | null;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  cancelled: "ملغي",
};

const AdminEventBookings = () => {
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchBookings = useCallback(async () => {
    const { data } = await supabase
      .from("event_bookings")
      .select("*")
      .order("created_at", { ascending: false });
    setBookings((data as EventBooking[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
    const ch = supabase
      .channel("event-bookings-admin")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "event_bookings" }, () => fetchBookings())
      .subscribe();

    const handleRefresh = () => fetchBookings();
    window.addEventListener("admin-pull-refresh", handleRefresh);

    return () => {
      supabase.removeChannel(ch);
      window.removeEventListener("admin-pull-refresh", handleRefresh);
    };
  }, [fetchBookings]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("event_bookings").update({ status }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    toast({ title: "تم التحديث", description: `تم تغيير الحالة إلى ${statusLabels[status]}` });
  };

  const deleteBooking = async (id: string) => {
    await supabase.from("event_bookings").delete().eq("id", id);
    setBookings(prev => prev.filter(b => b.id !== id));
    toast({ title: "تم الحذف" });
  };

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    totalGuests: bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.guests, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Export */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-slate-700">حجوزات الفعاليات</span>
        <ExportButtons
          data={filtered}
          filename="event-bookings"
          title="حجوزات الفعاليات"
          columns={[
            { key: "event_title", label: "الفعالية" },
            { key: "name", label: "الاسم" },
            { key: "phone", label: "الهاتف" },
            { key: "email", label: "البريد" },
            { key: "guests", label: "الأشخاص" },
            { key: "notes", label: "ملاحظات" },
            { key: "status", label: "الحالة", format: (v) => v === "confirmed" ? "مؤكد" : v === "cancelled" ? "ملغي" : "قيد المراجعة" },
            { key: "created_at", label: "التاريخ", format: (v) => new Date(v).toLocaleDateString("ar-SA") },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "إجمالي الحجوزات", value: stats.total, color: "bg-blue-50 text-blue-700" },
          { label: "قيد المراجعة", value: stats.pending, color: "bg-amber-50 text-amber-700" },
          { label: "مؤكدة", value: stats.confirmed, color: "bg-emerald-50 text-emerald-700" },
          { label: "إجمالي الضيوف", value: stats.totalGuests, color: "bg-purple-50 text-purple-700" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl p-3 sm:p-4", s.color)}>
            <p className="text-[11px] font-medium opacity-70">{s.label}</p>
            <p className="text-xl sm:text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "الكل" },
          { key: "pending", label: "قيد المراجعة" },
          { key: "confirmed", label: "مؤكدة" },
          { key: "cancelled", label: "ملغية" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filter === f.key ? "bg-blue-500 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">لا توجد حجوزات فعاليات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{booking.event_title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <Clock className="w-3 h-3 inline ml-1" />
                    {format(new Date(booking.created_at), "dd MMM yyyy - hh:mm a", { locale: ar })}
                  </p>
                </div>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", statusColors[booking.status])}>
                  {statusLabels[booking.status] || booking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                <p className="flex items-center gap-1.5">
                  <span className="font-medium">👤</span> {booking.name}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> {booking.phone}
                </p>
                {booking.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> {booking.email}
                  </p>
                )}
                <p className="flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> {booking.guests} {booking.guests > 1 ? "أشخاص" : "شخص"}
                </p>
              </div>

              {booking.notes && (
                <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 mb-3">💬 {booking.notes}</p>
              )}

              <div className="flex items-center gap-2 justify-end">
                {booking.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(booking.id, "confirmed")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors"
                    >
                      <Check className="w-3 h-3" /> تأكيد
                    </button>
                    <button
                      onClick={() => updateStatus(booking.id, "cancelled")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-xs font-medium hover:bg-red-200 transition-colors"
                    >
                      <X className="w-3 h-3" /> إلغاء
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteBooking(booking.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 text-xs transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEventBookings;
