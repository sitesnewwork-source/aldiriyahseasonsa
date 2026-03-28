import { motion } from "framer-motion";
import { Ticket, UtensilsCrossed } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const FloatingActions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();

  const hiddenPages = ["/admin", "/checkout", "/card-payment", "/card-otp"];
  if (hiddenPages.some(p => location.pathname.startsWith(p))) return null;

  const ticketsLabel = lang === "ar" ? "التذاكر" : "Tickets";
  const restaurantsLabel = lang === "ar" ? "المطاعم" : "Restaurants";

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
    >
      <motion.button
        whileHover={{ x: 6, scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => navigate("/tickets")}
        className="group relative flex items-center gap-2 pl-3 pr-4 py-3 rounded-r-2xl shadow-xl text-sm font-bold overflow-hidden transition-shadow duration-300 hover:shadow-2xl hover:shadow-[hsl(var(--accent))/0.3]"
        style={{
          background: "linear-gradient(135deg, hsl(var(--accent)), hsl(36 40% 55%), hsl(43 56% 58%))",
          color: "hsl(var(--accent-foreground))",
        }}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <Ticket className="w-5 h-5 relative z-10" />
        <span className="hidden sm:inline relative z-10">{ticketsLabel}</span>
      </motion.button>

      <motion.button
        whileHover={{ x: 6, scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => navigate("/restaurants")}
        className="group relative flex items-center gap-2 pl-3 pr-4 py-3 rounded-r-2xl shadow-xl text-sm font-bold overflow-hidden transition-shadow duration-300 hover:shadow-2xl hover:shadow-[hsl(var(--primary))/0.3]"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(30 30% 42%), hsl(36 40% 55%))",
          color: "hsl(var(--primary-foreground))",
        }}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <UtensilsCrossed className="w-5 h-5 relative z-10" />
        <span className="hidden sm:inline relative z-10">{restaurantsLabel}</span>
      </motion.button>
    </motion.div>
  );
};

export default FloatingActions;
