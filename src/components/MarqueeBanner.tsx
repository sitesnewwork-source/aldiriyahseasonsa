import { useLanguage } from "@/i18n/LanguageContext";

const MarqueeBanner = () => {
  const { isRtl } = useLanguage();
  
  const words = isRtl
    ? ["الدرعية", "✦", "تاريخ", "✦", "ثقافة", "✦", "تراث", "✦", "أصالة", "✦", "حضارة", "✦", "إبداع", "✦", "جمال", "✦"]
    : ["DIRIYAH", "✦", "HISTORY", "✦", "CULTURE", "✦", "HERITAGE", "✦", "BEAUTY", "✦", "LEGACY", "✦", "VISION", "✦", "ART", "✦"];

  const text = words.join("  ");

  return (
    <div className="py-5 bg-foreground overflow-hidden relative">
      {/* Top & bottom gold lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      
      <div className="flex whitespace-nowrap animate-marquee">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="font-display text-lg sm:text-xl md:text-2xl text-gold/30 tracking-[0.3em] mx-8 select-none"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
