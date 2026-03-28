import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Search, CreditCard, Mail, Phone, Hash, Receipt, Ticket, CheckCircle, XCircle, Filter } from "lucide-react";

interface Order {
  id: string;
  email: string;
  phone: string;
  tickets: any[];
  subtotal: number;
  vat: number;
  total: number;
  payment_method: string;
  status: string;
  confirmation_number: string | null;
  created_at: string;
  card_last4: string | null;
  card_brand: string | null;
  cardholder_name: string | null;
  bank_name: string | null;
}

const statusConfig: Record<string, { label: string; cls: string; dotCls: string }> = {
  confirmed: { label: "مقبول", cls: "bg-emerald-100 text-emerald-600", dotCls: "bg-emerald-400" },
  pending: { label: "بانتظار موافقة البطاقة", cls: "bg-amber-100 text-amber-600", dotCls: "bg-amber-400" },
  approved_card: { label: "تمت موافقة البطاقة", cls: "bg-blue-100 text-blue-600", dotCls: "bg-blue-400" },
  pending_otp: { label: "بانتظار موافقة OTP", cls: "bg-orange-100 text-orange-600", dotCls: "bg-orange-400" },
  rejected: { label: "مرفوض", cls: "bg-red-100 text-red-600", dotCls: "bg-red-400" },
  cancelled: { label: "ملغي", cls: "bg-slate-100 text-slate-500", dotCls: "bg-slate-400" },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("ticket_orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "ticket_orders" }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const handler = () => fetchOrders();
    window.addEventListener("admin-pull-refresh", handler);
    return () => window.removeEventListener("admin-pull-refresh", handler);
  }, []);

  const updateStatus = async (id: string, currentStatus: string, action: "approve" | "reject") => {
    let newStatus = "rejected";
    if (action === "approve") {
      if (currentStatus === "pending") newStatus = "approved_card";
      else if (currentStatus === "pending_otp") newStatus = "confirmed";
      else newStatus = "confirmed";
    }
    await supabase.from("ticket_orders").update({ status: newStatus }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const filtered = orders.filter(o => {
    // Status filter
    if (statusFilter === "confirmed" && o.status !== "confirmed") return false;
    if (statusFilter === "unconfirmed" && o.status === "confirmed") return false;
    // Search filter
    if (!search) return true;
    const q = search.toLowerCase();
    return o.email.toLowerCase().includes(q) || o.phone.includes(q) || (o.confirmation_number || "").includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالبريد أو رقم الجوال أو رقم التأكيد..."
          className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-[16px] sm:text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        {[
          { key: "all", label: "الكل" },
          { key: "confirmed", label: "تم التحقق" },
          { key: "unconfirmed", label: "لم يتم التحقق" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
              statusFilter === f.key
                ? f.key === "confirmed"
                  ? "bg-emerald-100 text-emerald-700"
                  : f.key === "unconfirmed"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-700"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          مقبول
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          بانتظار البطاقة
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          بانتظار OTP
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          تمت موافقة البطاقة
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          مرفوض
        </span>
        <span className="mr-auto">{filtered.length} طلب</span>
      </div>

      {/* Order Cards */}
      <div className="space-y-2.5">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="w-1/3 h-3.5 bg-slate-100 rounded" />
                  <div className="w-1/2 h-3 bg-slate-50 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400 text-sm">
            لا توجد طلبات
          </div>
        ) : (
          filtered.map((o) => {
            const st = statusConfig[o.status] || statusConfig.pending;
            return (
              <div key={o.id} className="bg-white rounded-2xl border border-slate-100 hover:shadow-md hover:shadow-slate-200/50 transition-all duration-200">
                {/* Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <span className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-white ${st.dotCls}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[14px] font-semibold text-slate-800" dir="ltr">{o.email}</span>
                        <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${st.cls}`}>
                          {st.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                        <Phone className="w-3 h-3" />
                        <span dir="ltr">{o.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="border-t border-slate-50 mx-4" />
                <div className="px-4 py-3 space-y-2.5">
                  {/* Payment Card */}
                  <div className="border border-blue-100 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 px-3 py-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-blue-600">تفاصيل الطلب</span>
                      <span className="text-[10px] text-blue-400">
                        {format(new Date(o.created_at), "dd MMM، HH:mm", { locale: ar })}
                      </span>
                    </div>
                    <div className="p-3 space-y-2 text-[12px]">
                      {o.confirmation_number && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1.5"><Hash className="w-3 h-3" /> رقم التأكيد</span>
                          <span className="text-blue-600 font-mono font-medium">{o.confirmation_number}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5"><Receipt className="w-3 h-3" /> المجموع الفرعي</span>
                        <span className="text-slate-700">{o.subtotal} ر.س</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">ضريبة القيمة المضافة</span>
                        <span className="text-slate-700">{o.vat} ر.س</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className="text-slate-600 font-semibold">الإجمالي</span>
                        <span className="text-slate-800 font-bold text-[14px]">{o.total} ر.س</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="border border-emerald-100 rounded-xl overflow-hidden">
                    <div className="bg-emerald-50 px-3 py-1.5">
                      <span className="text-[11px] font-semibold text-emerald-600">الدفع</span>
                    </div>
                    <div className="p-3 space-y-2 text-[12px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700 font-medium">
                            {o.payment_method === "card" ? "بطاقة ائتمان" : o.payment_method}
                          </span>
                        </div>
                        {o.card_last4 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-semibold text-slate-400">{o.card_brand || "card"}</span>
                            <span className="font-mono text-slate-600" dir="ltr">•••• {o.card_last4}</span>
                          </div>
                        )}
                      </div>
                      {o.cardholder_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">حامل البطاقة</span>
                          <span className="text-slate-700 font-medium">{o.cardholder_name}</span>
                        </div>
                      )}
                      {o.bank_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">البنك</span>
                          <span className="text-slate-700 font-medium">{o.bank_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Accept / Reject Buttons */}
                  {(o.status === "pending" || o.status === "pending_otp") ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(o.id, o.status, "approve")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 text-[12px] font-semibold hover:bg-emerald-100 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {o.status === "pending" ? "موافقة البطاقة" : "موافقة OTP"}
                      </button>
                      <button
                        onClick={() => updateStatus(o.id, o.status, "reject")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-500 text-[12px] font-semibold hover:bg-red-100 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        رفض
                      </button>
                    </div>
                  ) : (
                    <div className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold ${
                      o.status === "confirmed" ? "bg-emerald-50 text-emerald-600" 
                      : o.status === "approved_card" ? "bg-blue-50 text-blue-600"
                      : "bg-red-50 text-red-500"
                    }`}>
                      {o.status === "confirmed" ? <CheckCircle className="w-4 h-4" /> 
                       : o.status === "approved_card" ? <CheckCircle className="w-4 h-4" />
                       : <XCircle className="w-4 h-4" />}
                      {o.status === "confirmed" ? "تم القبول" 
                       : o.status === "approved_card" ? "تمت موافقة البطاقة — بانتظار OTP"
                       : "تم الرفض"}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
