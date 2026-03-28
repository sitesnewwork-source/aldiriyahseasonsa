import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Check, X, Clock, Search, UtensilsCrossed, Users, Calendar, Phone, StickyNote } from "lucide-react";

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

const statusConfig: Record<string, { label: string; cls: string; dotCls: string }> = {
  pending: { label: "قيد الانتظار", cls: "bg-amber-100 text-amber-600", dotCls: "bg-amber-400" },
  confirmed: { label: "مؤكد", cls: "bg-emerald-100 text-emerald-600", dotCls: "bg-emerald-400" },
  cancelled: { label: "ملغي", cls: "bg-red-100 text-red-600", dotCls: "bg-red-400" },
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

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
    { key: "all", label: "الكل", count: counts.all },
    { key: "pending", label: "قيد الانتظار", count: counts.pending },
    { key: "confirmed", label: "مؤكد", count: counts.confirmed },
    { key: "cancelled", label: "ملغي", count: counts.cancelled },
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث في الحجوزات..."
          className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-[16px] sm:text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-shrink-0 flex-1 min-w-[70px] py-2 rounded-lg text-[11px] sm:text-[12px] font-medium transition-all ${
              filter === tab.key
                ? "bg-blue-500 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Status dots legend */}
      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        {Object.entries(statusConfig).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${val.dotCls}`} />
            {val.label}
          </span>
        ))}
        <span className="mr-auto">{filtered.length} حجز</span>
      </div>

      {/* Booking Cards */}
      <div className="space-y-2.5">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="w-1/3 h-3.5 bg-slate-100 rounded" />
                  <div className="w-2/3 h-3 bg-slate-50 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400 text-sm">
            لا توجد حجوزات
          </div>
        ) : (
          filtered.map((b) => {
            const st = statusConfig[b.status] || statusConfig.pending;
            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md hover:shadow-slate-200/50 ${
                  b.status === "pending" ? "border-amber-200" : b.status === "cancelled" ? "border-red-100" : "border-slate-100"
                }`}
              >
                {/* Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-[15px]">
                        {b.name.charAt(0)}
                      </div>
                      <span className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-white ${st.dotCls}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[14px] font-semibold text-slate-800">{b.name}</span>
                        <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${st.cls}`}>
                          {st.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                        <Phone className="w-3 h-3" />
                        <span dir="ltr">{b.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="border-t border-slate-50 mx-4" />
                <div className="px-4 py-3">
                  <div className="border border-blue-100 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 px-3 py-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-blue-600">تفاصيل الحجز</span>
                      <span className="text-[10px] text-blue-400">
                        {format(new Date(b.created_at), "dd MMM، HH:mm", { locale: ar })}
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
                {b.status === "pending" && (
                  <div className="border-t border-slate-50 px-4 py-2.5 flex gap-2">
                    <button
                      onClick={() => updateStatus(b.id, "confirmed")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[12px] font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> تأكيد
                    </button>
                    <button
                      onClick={() => updateStatus(b.id, "cancelled")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-500 text-[12px] font-medium hover:bg-red-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> إلغاء
                    </button>
                  </div>
                )}
                {b.status === "confirmed" && (
                  <div className="border-t border-slate-50 px-4 py-2.5">
                    <button
                      onClick={() => updateStatus(b.id, "pending")}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 text-slate-500 text-[12px] font-medium hover:bg-slate-100 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" /> إعادة للانتظار
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
