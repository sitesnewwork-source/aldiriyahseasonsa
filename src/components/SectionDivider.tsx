const SectionDivider = ({ variant = "default" }: { variant?: "default" | "gold" | "earth" }) => {
  const colors = {
    default: "border-border",
    gold: "border-gold/20",
    earth: "border-earth/10",
  };

  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center gap-3 w-full max-w-xs mx-auto">
        <div className={`flex-1 h-px ${colors[variant]}`} />
        <div className="w-1.5 h-1.5 rotate-45 bg-gold/40" />
        <div className={`flex-1 h-px ${colors[variant]}`} />
      </div>
    </div>
  );
};

export default SectionDivider;
