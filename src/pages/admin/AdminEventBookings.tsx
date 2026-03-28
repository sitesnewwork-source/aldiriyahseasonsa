import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarCheck, Trash2, Check, X, Users, Phone, Mail, Clock, StickyNote, Sparkles } from "lucide-react";
import ExportButtons from "@/components/admin/ExportButtons";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

const statusConfig: Record<string, { label: string; gradient: string; bg: string; text: string; dot: string }> = {
  pending: { label: "قيد المراجعة", gradient: "from-amber-400 to-orange-500", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
  confirmed: { label: "مؤكد", gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  cancelled: { label: "ملغي", gradient: "from-red-500 to-rose-500", bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400" },
};

const AdminEventBookings = () => {
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showClearAll, setShowClearAll] = useState(false);

  const clearAllEventBookings = async () => {
    try {
      await supabase.from("event_bookings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      setBookings([]);
      setShowClearAll(false);
      toast({ title: "تم المسح", description: "تم مسح جميع حجوزات الفعاليات بنجاح" });
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ أثناء المسح", variant: "destructive" });
    }
  };

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
    return () => { supabase.removeChannel(ch); window.removeEventListener("admin-pull-refresh", handleRefresh); };
  }, [fetchBookings]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("event_bookings").update({ status }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    toast({ title: "تم التحديث", description: `تم تغيير الحالة إلى ${statusConfig[status]?.label || status}` });
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

  const statCards = [
    { label: "إجمالي الحجوزات", value: stats.total, gradient: "from-blue-500 to-indigo-500", shadow: "shadow-blue-500/20" },
    { label: "قيد المراجعة", value: stats.pending, gradient: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/20" },
    { label: "مؤكدة", value: stats.confirmed, gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/20" },
    { label: "إجمالي الضيوف", value: stats.totalGuests, gradient: "from-violet-500 to-purple-500", shadow: "shadow-violet-500/20" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-3 border-pink-500/30 rounded-full" />
          <div className="absolute inset-0 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <CalendarCheck className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">حجوزات الفعاليات</h2>
            <p className="text-[10px] text-slate-400">{stats.total} حجز • {stats.totalGuests} ضيف</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
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
              { key: "status", label: "الحالة", format: (v) => statusConfig[v]?.label || v },
              { key: "created_at", label: "التاريخ", format: (v) => new Date(v).toLocaleDateString("ar-SA") },
            ]}
          />
          {bookings.length > 0 && (
            <button
              onClick={() => setShowClearAll(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-[11px] font-medium hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              مسح الكل
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="relative bg-white rounded-xl p-3 sm:p-4 border border-slate-100/80 overflow-hidden group hover:shadow-md transition-all">
            <div className={`absolute -top-4 -left-4 w-14 h-14 bg-gradient-to-br ${s.gradient} rounded-full blur-2xl opacity-[0.08] group-hover:opacity-[0.15] transition-opacity`} />
            <p className="text-[10px] text-slate-400 font-medium relative">{s.label}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1 relative">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "الكل", gradient: "from-slate-600 to-slate-700" },
          { key: "pending", label: "قيد المراجعة", gradient: "from-amber-500 to-orange-500" },
          { key: "confirmed", label: "مؤكدة", gradient: "from-emerald-500 to-teal-500" },
          { key: "cancelled", label: "ملغية", gradient: "from-red-500 to-rose-500" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200",
              filter === f.key
                ? `bg-gradient-to-r ${f.gradient} text-white shadow-sm`
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200/80"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100/80 p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
            <CalendarCheck className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-slate-400 text-sm">لا توجد حجوزات فعاليات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const st = statusConfig[booking.status] || statusConfig.pending;
            const isPending = booking.status === "pending";
            return (
              <div
                key={booking.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                  isPending ? "border-amber-200/80 shadow-sm shadow-amber-100/50" : "border-slate-100/80 hover:shadow-slate-200/60"
                }`}
              >
                {/* Gradient top strip */}
                <div className={`h-1 bg-gradient-to-r ${st.gradient}`} />

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${st.gradient} flex items-center justify-center shadow-md shrink-0`}>
                        <CalendarCheck className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-[13px]">{booking.event_title}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(booking.created_at), "dd MMM yyyy - hh:mm a", { locale: ar })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r ${st.gradient} text-white shadow-sm whitespace-nowrap`}>
                      {st.label}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="rounded-xl overflow-hidden border border-slate-100/80 mb-3">
                    <div className="bg-gradient-to-l from-pink-50/80 to-transparent px-3 py-2 border-b border-slate-100/50">
                      <span className="text-[11px] font-bold text-pink-600 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        معلومات الحجز
                      </span>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-2 text-[12px]">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="text-slate-400">👤</span> {booking.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400" /> <span dir="ltr">{booking.phone}</span>
                      </div>
                      {booking.email && (
                        <div className="flex items-center gap-1.5 text-slate-600 col-span-2">
                          <Mail className="w-3 h-3 text-slate-400" /> <span dir="ltr">{booking.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users className="w-3 h-3 text-slate-400" /> {booking.guests} {booking.guests > 1 ? "أشخاص" : "شخص"}
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="bg-slate-50 rounded-xl p-2.5 mb-3 flex items-start gap-1.5">
                      <StickyNote className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-slate-500">{booking.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 justify-end">
                    {isPending && (
                      <>
                        <button
                          onClick={() => updateStatus(booking.id, "confirmed")}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-bold shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                          <Check className="w-3.5 h-3.5" /> تأكيد
                        </button>
                        <button
                          onClick={() => updateStatus(booking.id, "cancelled")}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-[11px] font-bold shadow-md shadow-red-500/20 hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                          <X className="w-3.5 h-3.5" /> إلغاء
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteBooking(booking.id)}
                      className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 text-[11px] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      <AlertDialog open={showClearAll} onOpenChange={setShowClearAll}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>مسح جميع حجوزات الفعاليات</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من مسح جميع حجوزات الفعاليات؟ سيتم حذف {bookings.length} حجز نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllEventBookings} className="bg-red-500 hover:bg-red-600">
              مسح الكل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminEventBookings;
