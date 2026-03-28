import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { playChime } from "@/hooks/use-action-sound";

const BackButton = () => {
  const navigate = useNavigate();
  const { isRtl } = useLanguage();
  const Icon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <button
      onClick={() => {
        playChime("click");
        navigate(-1);
      }}
      className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs sm:text-sm transition-colors group mb-3"
    >
      <Icon className="w-3.5 h-3.5 transition-transform group-hover:rtl:translate-x-0.5 group-hover:ltr:-translate-x-0.5" />
      <span>{isRtl ? "رجوع إلى الصفحة السابقة" : "Back to previous page"}</span>
    </button>
  );
};

export default BackButton;
