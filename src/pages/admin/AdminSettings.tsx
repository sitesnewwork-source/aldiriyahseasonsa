import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { KeyRound, FileDown, Trash2, LogOut, Settings, ChevronLeft, ArrowRight, Mail, Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { playChime, createRipple } from "@/hooks/use-action-sound";
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

  // Poll permission state (user may change it in browser settings)
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
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);
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
      setNewEmail("");
      setChangingEmail(false);
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
      doc.setFont("helvetica");
      doc.setFontSize(16);
      doc.text("Ticket Orders Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Total: ${orders.length} orders`, 14, 28);

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
      icon: Mail,
      label: "تغيير البريد الإلكتروني",
      color: "text-violet-500",
      bg: "bg-violet-50",
      onClick: () => { playChime("pop"); setChangingEmail(!changingEmail); setChangingPassword(false); },
    },
    {
      icon: KeyRound,
      label: "تغيير كلمة المرور",
      color: "text-blue-500",
      bg: "bg-blue-50",
      onClick: () => { playChime("pop"); setChangingPassword(!changingPassword); setChangingEmail(false); },
    },
    {
      icon: isNotifGranted ? Bell : BellOff,
      label: "إشعارات المتصفح",
      color: isNotifGranted ? "text-emerald-500" : isNotifDenied ? "text-red-500" : "text-amber-500",
      bg: isNotifGranted ? "bg-emerald-50" : isNotifDenied ? "bg-red-50" : "bg-amber-50",
      onClick: handleToggleNotifications,
      badge: !notifSupported ? "غير مدعوم" : isNotifGranted ? "مفعّل" : isNotifDenied ? "مرفوض" : "معطّل",
      badgeColor: !notifSupported ? "bg-slate-100 text-slate-500" : isNotifGranted ? "bg-emerald-100 text-emerald-600" : isNotifDenied ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600",
    },
    {
      icon: FileDown,
      label: "استيراد التذاكر PDF",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      onClick: handleExportPDF,
    },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => { playChime("click"); navigate(-1 as any); }}
          className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors btn-press"
        >
          <ArrowRight className="w-4.5 h-4.5 text-slate-500" />
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-bold text-slate-800">لوحة التحكم</h1>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
        {settingsItems.map((item) => (
          <button
            key={item.label}
            onClick={(e) => { createRipple(e); item.onClick(); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-all text-right btn-press relative overflow-hidden"
          >
            <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
              <item.icon className={`w-4.5 h-4.5 ${item.color}`} />
            </div>
            <span className="text-[14px] font-medium text-slate-700 flex-1">{item.label}</span>
            {"badge" in item && item.badge && (
              <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${(item as any).badgeColor}`}>
                {item.badge}
              </span>
            )}
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </button>
        ))}
      </div>

      {/* Change Email Form */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          display: "grid",
          gridTemplateRows: changingEmail ? "1fr" : "0fr",
          opacity: changingEmail ? 1 : 0,
        }}
      >
        <div className="min-h-0">
          <div className="bg-white rounded-2xl border border-violet-100 p-4 space-y-3">
            <input
              type="email"
              placeholder="البريد الإلكتروني الجديد"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
              dir="ltr"
            />
            <p className="text-[11px] text-slate-400">سيتم إرسال رابط تأكيد إلى البريد الجديد</p>
            <button
              onClick={(e) => { createRipple(e); handleChangeEmail(); }}
              className="w-full py-2.5 rounded-xl bg-violet-500 text-white text-[13px] font-semibold hover:bg-violet-600 transition-all btn-press relative overflow-hidden"
            >
              تغيير البريد الإلكتروني
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          display: "grid",
          gridTemplateRows: changingPassword ? "1fr" : "0fr",
          opacity: changingPassword ? 1 : 0,
        }}
      >
        <div className="min-h-0">
          <div className="bg-white rounded-2xl border border-blue-100 p-4 space-y-3">
            <input
              type="password"
              placeholder="كلمة المرور الجديدة"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            <input
              type="password"
              placeholder="تأكيد كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            <button
              onClick={(e) => { createRipple(e); handleChangePassword(); }}
              className="w-full py-2.5 rounded-xl bg-blue-500 text-white text-[13px] font-semibold hover:bg-blue-600 transition-all btn-press relative overflow-hidden"
            >
              حفظ كلمة المرور
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
        <button
          onClick={(e) => { createRipple(e); handleClearAll(); }}
          disabled={clearing}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-all text-right btn-press relative overflow-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 className="w-4.5 h-4.5 text-red-500" />
          </div>
          <span className="text-[14px] font-medium text-red-500 flex-1">
            {clearing ? "جاري المسح..." : "مسح جميع البيانات"}
          </span>
        </button>

        <button
          onClick={(e) => { createRipple(e); handleLogout(); }}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-all text-right btn-press relative overflow-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <LogOut className="w-4.5 h-4.5 text-red-500" />
          </div>
          <span className="text-[14px] font-medium text-red-500 flex-1">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
