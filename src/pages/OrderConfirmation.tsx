import { useLocation, Link } from "react-router-dom";
import { useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Ticket, Calendar, MapPin, Download, Home, Image, FileText } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface OrderTicket {
  id: number;
  name: string;
  price: number;
  qty: number;
}

interface OrderState {
  tickets: OrderTicket[];
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  total: number;
  vat: number;
  subtotal: number;
  paymentMethod: string;
  cardLast4?: string;
  cardBrand?: string;
  orderId?: string;
}

const OrderConfirmation = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const location = useLocation();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const order = location.state as OrderState | null;

  // ✅ ثابت لا يتغير عند re-render
  const confirmationNumber = useMemo(
    () => `DIR-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    []
  );

  const orderDate = new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const downloadAsImage = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `diriyah-ticket-${confirmationNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const downloadAsPDF = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(`diriyah-ticket-${confirmationNumber}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-background font-body" dir={isAr ? "rtl" : "ltr"}>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <p className="text-muted-foreground mb-4">
            {isAr
              ? "لا توجد بيانات طلب. يرجى إتمام عملية الشراء أولاً."
              : "No order data found. Please complete a purchase first."}
          </p>
          <Link to="/checkout">
            <Button className="bg-primary text-primary-foreground">
              {isAr ? "العودة للدفع" : "Go to Checkout"}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body" dir={isAr ? "rtl" : "ltr"}>
      <Header />

      <main className="pt-20 sm:pt-28 pb-12 sm:pb-20 px-3 sm:px-4">
        <div className="max-w-2xl mx-auto">
          <BackButton />
        </div>
        <div className="max-w-2xl mx-auto">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex justify-center mb-4 sm:mb-6"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 dark:text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-5 sm:mb-8"
          >
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
              {isAr ? "تم استلام طلبك!" : "Order Received!"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              {isAr
                ? "شكراً لك! طلبك قيد المراجعة وسيتم تأكيده من قبل الإدارة."
                : "Thank you! Your order is under review and will be confirmed by admin."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 sm:space-y-5"
          >
            {/* Order Info */}
            <div className="bg-card rounded-xl border border-border p-3 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 flex-wrap">
                <h2 className="font-display text-base sm:text-lg font-semibold text-foreground">
                  {isAr ? "تفاصيل الطلب" : "Order Details"}
                </h2>
                <span className="text-[10px] sm:text-xs font-mono bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full font-bold">
                  {confirmationNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm mb-3 sm:mb-4">
                <div>
                  <p className="text-muted-foreground text-[11px] sm:text-xs mb-0.5">
                    {isAr ? "تاريخ الطلب" : "Order Date"}
                  </p>
                  <p className="font-medium text-foreground text-xs sm:text-sm">{orderDate}</p>
                </div>
                {(order.firstName || order.lastName) && (
                  <div>
                    <p className="text-muted-foreground text-[11px] sm:text-xs mb-0.5">
                      {isAr ? "الاسم" : "Name"}
                    </p>
                    <p className="font-medium text-foreground text-xs sm:text-sm">
                      {order.firstName} {order.lastName}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-[11px] sm:text-xs mb-0.5">
                    {isAr ? "البريد الإلكتروني" : "Email"}
                  </p>
                  <p className="font-medium text-foreground text-xs sm:text-sm truncate" dir="ltr">
                    {order.email}
                  </p>
                </div>
                {/* ✅ إضافة رقم الجوال */}
                {order.phone && (
                  <div>
                    <p className="text-muted-foreground text-[11px] sm:text-xs mb-0.5">
                      {isAr ? "رقم الجوال" : "Phone"}
                    </p>
                    <p className="font-medium text-foreground text-xs sm:text-sm" dir="ltr">
                      {order.phone}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-[11px] sm:text-xs mb-0.5">
                    {isAr ? "طريقة الدفع" : "Payment"}
                  </p>
                  <p className="font-medium text-foreground text-xs sm:text-sm">
                    {order.paymentMethod === "card"
                      ? isAr
                        ? `بطاقة ائتمان${order.cardLast4 ? ` •••• ${order.cardLast4}` : ""}`
                        : `Credit Card${order.cardLast4 ? ` •••• ${order.cardLast4}` : ""}`
                      : "Apple Pay"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] sm:text-xs mb-0.5">
                    {isAr ? "الحالة" : "Status"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium text-xs sm:text-sm">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 animate-pulse" />
                    {isAr ? "قيد المراجعة" : "Pending Review"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div className="bg-card rounded-xl border border-border p-3 sm:p-5">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h2 className="font-display text-base sm:text-lg font-semibold text-foreground">
                  {isAr ? "التذاكر" : "Tickets"}
                </h2>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {order.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-lg bg-background"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-xs sm:text-sm leading-tight">
                        {ticket.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span>{isAr ? "الدرعية" : "Diriyah"}</span>
                        <Calendar className="w-3 h-3 ms-1 flex-shrink-0" />
                        <span>2026-04-15</span>
                      </div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground">
                        {ticket.price * ticket.qty} {isAr ? "ر.س" : "SAR"}
                      </p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground">× {ticket.qty}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-3 sm:my-4" />

              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span>
                    {order.subtotal} {isAr ? "ر.س" : "SAR"}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{isAr ? "ضريبة القيمة المضافة (15%)" : "VAT (15%)"}</span>
                  <span>
                    {order.vat} {isAr ? "ر.س" : "SAR"}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-foreground text-base sm:text-lg">
                  <span>{isAr ? "الإجمالي" : "Total"}</span>
                  <span>
                    {order.total} {isAr ? "ر.س" : "SAR"}
                  </span>
                </div>
              </div>
            </div>

            {/* Digital Ticket QR */}
            <div ref={ticketRef} className="bg-card rounded-xl border border-border p-4 sm:p-6 text-center">
              <h2 className="font-display text-base sm:text-lg font-semibold text-foreground mb-1">
                {isAr ? "التذكرة الرقمية" : "Digital Ticket"}
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
                {isAr ? "امسح رمز QR عند الدخول" : "Scan QR code at entry"}
              </p>
              <div className="text-[11px] sm:text-xs text-muted-foreground mb-3 sm:mb-4 space-y-0.5">
                {order.tickets.map((t) => (
                  <p key={t.id}>
                    {t.name} × {t.qty}
                  </p>
                ))}
                <p>
                  {isAr ? "الإجمالي:" : "Total:"} {order.total} {isAr ? "ر.س" : "SAR"}
                </p>
              </div>
              <div className="inline-flex p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-border">
                <QRCodeSVG
                  value={`https://diriyah.sa/ticket/${confirmationNumber}`}
                  size={140}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#1a1a1a"
                />
              </div>
              <p className="text-[10px] sm:text-xs font-mono text-muted-foreground mt-3 sm:mt-4 tracking-wider">
                {confirmationNumber}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
              <Button
                onClick={downloadAsImage}
                disabled={downloading}
                className="flex-1 h-10 sm:h-12 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <Image className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {isAr ? "تحميل صورة" : "Save Image"}
              </Button>
              <Button
                onClick={downloadAsPDF}
                disabled={downloading}
                variant="outline"
                className="flex-1 h-10 sm:h-12 gap-1.5 sm:gap-2 border-primary text-primary text-xs sm:text-sm"
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {isAr ? "تحميل PDF" : "Save PDF"}
              </Button>
            </div>
            <div className="flex justify-center pt-0 sm:pt-1">
              <Link to="/">
                <Button variant="ghost" className="gap-2 text-muted-foreground text-xs sm:text-sm">
                  <Home className="w-4 h-4" />
                  {isAr ? "العودة للرئيسية" : "Back to Home"}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
