import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  KeyRound, FileDown, Trash2, LogOut, Settings, ArrowRight, Mail,
  Bell, BellOff, Shield, Sparkles, AlertTriangle, Smartphone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { playChime, createRipple, isSoundMuted, setSoundMuted } from "@/hooks/use-action-sound";
import { requestNotificationPermission, getNotificationPermission, isNotificationSupported } from "@/hooks/use-browser-notifications";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [clearing, setClearing] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>(getNotificationPermission());

  useEffect(() => {
    const interval = setInterval(() => setNotifPermission(getNotificationPermission()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleNotifications = async () => {
    if (notifPermission === "granted") {
      playChime("info");
      toast({ title: "ℹ️ ملاحظة", description: "لإيقاف الإشعارات، عطّلها من إعدادات المتصفح لهذا الموقع" });
      return;
    }
    const granted = await requestNotificationPermission();
    setNotifPermission(getNotificationPermission());
    if (granted) {
      playChime("success");
      toast({ title: "✅ تم", description: "تم تفعيل إشعارات المتصفح بنجاح" });
    } else {
      playChime("error");
      toast({ title: "❌ مرفوض", description: "تم رفض الإذن. فعّل الإشعارات من إعدادات المتصفح", variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      playChime("error");
      toast({ title: "❌ خطأ", description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      playChime("error");
      toast({ title: "❌ خطأ", description: "كلمتا المرور غير متطابقتين", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      playChime("error");
      toast({ title: "❌ خطأ", description: error.message, variant: "destructive" });
    } else {
      playChime("success");
      toast({ title: "✅ تم", description: "تم تغيير كلمة المرور بنجاح" });
      setNewPassword(""); setConfirmPassword(""); setChangingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      playChime("error");
      toast({ title: "❌ خطأ", description: "أدخل بريد إلكتروني صحيح", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      playChime("error");
      toast({ title: "❌ خطأ", description: error.message, variant: "destructive" });
    } else {
      playChime("success");
      toast({ title: "✅ تم", description: "تم إرسال رابط تأكيد إلى بريدك الجديد. تحقق من صندوق الوارد" });
      setNewEmail(""); setChangingEmail(false);
    }
  };

  const handleExportPDF = async () => {
    playChime("info");
    toast({ title: "📄 جاري التصدير...", description: "يتم تجهيز ملف PDF" });
    try {
      const { data: orders } = await supabase.from("ticket_orders").select("*").order("created_at", { ascending: false });
      if (!orders || orders.length === 0) {
        playChime("error");
        toast({ title: "⚠️ تنبيه", description: "لا توجد طلبات لتصديرها" });
        return;
      }
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFont("helvetica"); doc.setFontSize(16);
      doc.text("Ticket Orders Report", 14, 20);
      doc.setFontSize(10); doc.text(`Total: ${orders.length} orders`, 14, 28);
      let y = 40;
      orders.forEach((o: any, i: number) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(11);
        doc.text(`#${i + 1} - ${o.confirmation_number || o.id.slice(0, 8)}`, 14, y);
        doc.setFontSize(9);
        doc.text(`Email: ${o.email} | Phone: ${o.phone}`, 14, y + 5);
        doc.text(`Total: ${o.total} SAR | Status: ${o.status} | ${new Date(o.created_at).toLocaleDateString()}`, 14, y + 10);
        y += 18;
      });
      doc.save("ticket-orders.pdf");
      playChime("success");
      toast({ title: "✅ تم", description: "تم تصدير الملف بنجاح" });
    } catch {
      playChime("error");
      toast({ title: "❌ خطأ", description: "حدث خطأ أثناء التصدير", variant: "destructive" });
    }
  };

  const handleClearAll = async () => {
    playChime("error");
    if (!window.confirm("⚠️ هل أنت متأكد من مسح جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه!")) return;
    setClearing(true);
    try {
      await supabase.from("visitor_actions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("visitors").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("contact_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("restaurant_bookings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("ticket_orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      playChime("delete");
      toast({ title: "✅ تم", description: "تم مسح جميع البيانات بنجاح" });
    } catch {
      playChime("error");
      toast({ title: "❌ خطأ", description: "حدث خطأ أثناء مسح البيانات", variant: "destructive" });
    }
    setClearing(false);
  };

  const handleLogout = async () => {
    playChime("whoosh");
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const notifSupported = isNotificationSupported();
  const isNotifGranted = notifPermission === "granted";
  const isNotifDenied = notifPermission === "denied";

  const settingsItems = [
    {
      icon: Mail, label: "تغيير البريد الإلكتروني",
      gradient: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/20",
      onClick: () => { playChime("pop"); setChangingEmail(!changingEmail); setChangingPassword(false); },
    },
    {
      icon: KeyRound, label: "تغيير كلمة المرور",
      gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20",
      onClick: () => { playChime("pop"); setChangingPassword(!changingPassword); setChangingEmail(false); },
    },
    {
      icon: isNotifGranted ? Bell : BellOff,
      label: "إشعارات المتصفح",
      gradient: isNotifGranted ? "from-emerald-500 to-teal-500" : isNotifDenied ? "from-red-500 to-rose-500" : "from-amber-400 to-orange-500",
      shadow: isNotifGranted ? "shadow-emerald-500/20" : isNotifDenied ? "shadow-red-500/20" : "shadow-amber-500/20",
      onClick: handleToggleNotifications,
      badge: !notifSupported ? "غير مدعوم" : isNotifGranted ? "مفعّل" : isNotifDenied ? "مرفوض" : "معطّل",
      badgeGradient: !notifSupported ? "from-slate-400 to-slate-500" : isNotifGranted ? "from-emerald-400 to-green-500" : isNotifDenied ? "from-red-400 to-rose-500" : "from-amber-400 to-orange-400",
    },
    {
      icon: FileDown, label: "تصدير التذاكر PDF",
      gradient: "from-cyan-500 to-sky-600", shadow: "shadow-cyan-500/20",
      onClick: handleExportPDF,
    },
    {
      icon: Smartphone, label: "تثبيت لوحة التحكم",
      gradient: "from-amber-500 to-yellow-600", shadow: "shadow-amber-500/20",
      onClick: () => { playChime("pop"); navigate("/admin/install"); },
    },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { playChime("click"); navigate(-1 as any); }}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </button>
        <div className="flex items-center gap-2.5">
          <h1 className="text-[16px] font-bold text-slate-800">الإعدادات</h1>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
            <Settings className="w-4.5 h-4.5 text-white" />
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white rounded-2xl border border-slate-100/80 divide-y divide-slate-50/80 overflow-hidden shadow-sm">
        {settingsItems.map((item) => (
          <button
            key={item.label}
            onClick={(e) => { createRipple(e); item.onClick(); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50/50 transition-all text-right btn-press relative overflow-hidden group"
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md ${item.shadow} shrink-0 group-hover:scale-105 transition-transform`}>
              <item.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-slate-700 flex-1">{item.label}</span>
            {"badge" in item && item.badge && (
              <span className={`text-[9px] font-bold rounded-full px-2.5 py-0.5 bg-gradient-to-r ${item.badgeGradient} text-white shadow-sm`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Change Email Form */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ display: "grid", gridTemplateRows: changingEmail ? "1fr" : "0fr", opacity: changingEmail ? 1 : 0 }}
      >
        <div className="min-h-0">
          <div className="bg-white rounded-2xl border border-violet-200/80 p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Mail className="w-3 h-3 text-white" />
              </div>
              <span className="text-[12px] font-bold text-violet-600">تغيير البريد الإلكتروني</span>
            </div>
            <input
              type="email"
              placeholder="البريد الإلكتروني الجديد"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full border border-slate-200/80 rounded-xl px-4 py-2.5 text-[16px] sm:text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
              dir="ltr"
            />
            <p className="text-[10px] text-slate-400">سيتم إرسال رابط تأكيد إلى البريد الجديد</p>
            <button
              onClick={(e) => { createRipple(e); handleChangeEmail(); }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[13px] font-bold shadow-md shadow-violet-500/20 hover:shadow-lg transition-all btn-press relative overflow-hidden active:scale-[0.98]"
            >
              تغيير البريد الإلكتروني
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ display: "grid", gridTemplateRows: changingPassword ? "1fr" : "0fr", opacity: changingPassword ? 1 : 0 }}
      >
        <div className="min-h-0">
          <div className="bg-white rounded-2xl border border-blue-200/80 p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <KeyRound className="w-3 h-3 text-white" />
              </div>
              <span className="text-[12px] font-bold text-blue-600">تغيير كلمة المرور</span>
            </div>
            <input
              type="password"
              placeholder="كلمة المرور الجديدة"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-200/80 rounded-xl px-4 py-2.5 text-[16px] sm:text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            <input
              type="password"
              placeholder="تأكيد كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-200/80 rounded-xl px-4 py-2.5 text-[16px] sm:text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            <button
              onClick={(e) => { createRipple(e); handleChangePassword(); }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[13px] font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all btn-press relative overflow-hidden active:scale-[0.98]"
            >
              حفظ كلمة المرور
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[11px] font-bold text-red-400">منطقة الخطر</span>
        </div>
        <div className="bg-white rounded-2xl border border-red-100/80 divide-y divide-red-50/50 overflow-hidden shadow-sm">
          <button
            onClick={(e) => { createRipple(e); handleClearAll(); }}
            disabled={clearing}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50/50 transition-all text-right btn-press relative overflow-hidden group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Trash2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-red-500 flex-1">
              {clearing ? "جاري المسح..." : "مسح جميع البيانات"}
            </span>
          </button>

          <button
            onClick={(e) => { createRipple(e); handleLogout(); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50/50 transition-all text-right btn-press relative overflow-hidden group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-md shadow-slate-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <LogOut className="w-4 h-4 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-slate-600 flex-1">تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
