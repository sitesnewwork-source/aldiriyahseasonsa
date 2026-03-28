import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Check, X, Clock, Search, UtensilsCrossed, Users, Calendar, Phone, StickyNote, Trash2 } from "lucide-react";
import ExportButtons from "@/components/admin/ExportButtons";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Booking {
  id: string;
  name: string;
  phone: string;
  restaurant: string;
  booking_date: string;
  guests: number;
  notes: string | null;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; gradient: string; bg: string; text: string; dot: string }> = {
  pending: { label: "قيد الانتظار", gradient: "from-amber-400 to-orange-500", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
  confirmed: { label: "مؤكد", gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  cancelled: { label: "ملغي", gradient: "from-red-500 to-rose-500", bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400" },
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [showClearAll, setShowClearAll] = useState(false);

  const clearAllBookings = async () => {
    try {
      await supabase.from("restaurant_bookings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      setBookings([]);
      setShowClearAll(false);
      toast.success("تم مسح جميع الحجوزات بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء المسح");
    }
  };

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("restaurant_bookings")
      .select("*")
      .order("created_at", { ascending: false });
    setBookings((data as Booking[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
    const channel = supabase
      .channel("bookings-realtime")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "restaurant_bookings" }, () => fetchBookings())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const handler = () => fetchBookings();
    window.addEventListener("admin-pull-refresh", handler);
    return () => window.removeEventListener("admin-pull-refresh", handler);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("restaurant_bookings").update({ status }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const filtered = bookings.filter(b => {
    if (filter !== "all" && b.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.restaurant.toLowerCase().includes(q) || b.phone.includes(q);
    }
    return true;
  });

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  const tabs = [
    { key: "all", label: "الكل", count: counts.all, gradient: "from-slate-600 to-slate-700" },
    { key: "pending", label: "قيد الانتظار", count: counts.pending, gradient: "from-amber-500 to-orange-500" },
    { key: "confirmed", label: "مؤكد", count: counts.confirmed, gradient: "from-emerald-500 to-teal-500" },
    { key: "cancelled", label: "ملغي", count: counts.cancelled, gradient: "from-red-500 to-rose-500" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <UtensilsCrossed className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">حجوزات المطاعم</h2>
            <p className="text-[10px] text-slate-400">{filtered.length} حجز • {counts.pending} قيد الانتظار</p>
          </div>
        </div>
        <ExportButtons
          data={filtered}
          filename="bookings"
          title="حجوزات المطاعم"
          columns={[
            { key: "name", label: "الاسم" },
            { key: "phone", label: "الهاتف" },
            { key: "restaurant", label: "المطعم" },
            { key: "booking_date", label: "التاريخ" },
            { key: "guests", label: "الأشخاص" },
            { key: "notes", label: "ملاحظات" },
            { key: "status", label: "الحالة", format: (v) => v === "confirmed" ? "مؤكد" : v === "cancelled" ? "ملغي" : "قيد الانتظار" },
            { key: "created_at", label: "تاريخ الطلب", format: (v) => new Date(v).toLocaleDateString("ar-SA") },
          ]}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث في الحجوزات..."
          className="w-full bg-white border border-slate-200/80 rounded-xl pr-10 pl-4 py-2.5 text-[16px] sm:text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all shadow-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
              filter === tab.key
                ? `bg-gradient-to-r ${tab.gradient} text-white shadow-sm`
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap text-[10px] text-slate-400 bg-white/60 rounded-xl px-3 py-2 border border-slate-100/80">
        {Object.entries(statusConfig).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${val.dot}`} />
            {val.label}
          </span>
        ))}
      </div>

      {/* Booking Cards */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100/80 p-5 animate-pulse">
              <div className="flex gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl" />
                <div className="flex-1 space-y-2.5">
                  <div className="w-1/3 h-3.5 bg-slate-100 rounded-lg" />
                  <div className="w-2/3 h-3 bg-slate-50 rounded-lg" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100/80 p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <UtensilsCrossed className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm">لا توجد حجوزات</p>
          </div>
        ) : (
          filtered.map((b) => {
            const st = statusConfig[b.status] || statusConfig.pending;
            const isPending = b.status === "pending";
            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                  isPending ? "border-amber-200/80 shadow-sm shadow-amber-100/50" : b.status === "cancelled" ? "border-red-100/80" : "border-slate-100/80 hover:shadow-slate-200/60"
                }`}
              >
                {/* Gradient top strip */}
                <div className={`h-1 bg-gradient-to-r ${st.gradient}`} />

                {/* Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${st.gradient} flex items-center justify-center text-white font-bold text-[15px] shadow-md shrink-0`}>
                      {b.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-slate-800">{b.name}</span>
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r ${st.gradient} text-white shadow-sm whitespace-nowrap`}>
                          {st.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Phone className="w-3 h-3" />
                          <span dir="ltr">{b.phone}</span>
                        </span>
                        <span className="text-[10px] text-slate-300">
                          {format(new Date(b.created_at), "dd MMM، HH:mm", { locale: ar })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="px-4 pb-4">
                  <div className="rounded-xl overflow-hidden border border-slate-100/80">
                    <div className="bg-gradient-to-l from-amber-50/80 to-transparent px-3 py-2 flex items-center justify-between border-b border-slate-100/50">
                      <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        تفاصيل الحجز
                      </span>
                    </div>
                    <div className="p-3 space-y-2 text-[12px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5"><UtensilsCrossed className="w-3 h-3" /> المطعم</span>
                        <span className="text-slate-700 font-medium">{b.restaurant}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> التاريخ</span>
                        <span className="text-slate-700 font-medium">{format(new Date(b.booking_date), "dd MMM yyyy", { locale: ar })}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5"><Users className="w-3 h-3" /> الأشخاص</span>
                        <span className="text-slate-700 font-medium">{b.guests}</span>
                      </div>
                      {b.notes && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-slate-400 flex items-center gap-1.5 shrink-0"><StickyNote className="w-3 h-3" /> ملاحظات</span>
                          <span className="text-slate-600 text-left">{b.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isPending && (
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={() => updateStatus(b.id, "confirmed")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[12px] font-bold shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      <Check className="w-4 h-4" /> تأكيد
                    </button>
                    <button
                      onClick={() => updateStatus(b.id, "cancelled")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-[12px] font-bold shadow-md shadow-red-500/20 hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      <X className="w-4 h-4" /> إلغاء
                    </button>
                  </div>
                )}
                {b.status === "confirmed" && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => updateStatus(b.id, "pending")}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 text-slate-500 text-[12px] font-semibold hover:bg-slate-100 transition-colors border border-slate-200/80"
                    >
                      <Clock className="w-4 h-4" /> إعادة للانتظار
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
