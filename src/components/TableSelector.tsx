import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { actionNotify } from "@/hooks/use-action-notify";

interface Table {
  id: string;
  label: string;
  seats: number;
  zone: "indoor" | "outdoor" | "vip";
  available: boolean;
}

const TABLES: Table[] = [
  { id: "A1", label: "A1", seats: 2, zone: "indoor", available: true },
  { id: "A2", label: "A2", seats: 2, zone: "indoor", available: false },
  { id: "A3", label: "A3", seats: 4, zone: "indoor", available: true },
  { id: "A4", label: "A4", seats: 4, zone: "indoor", available: true },
  { id: "B1", label: "B1", seats: 6, zone: "indoor", available: false },
  { id: "B2", label: "B2", seats: 6, zone: "indoor", available: true },
  { id: "C1", label: "C1", seats: 2, zone: "outdoor", available: true },
  { id: "C2", label: "C2", seats: 4, zone: "outdoor", available: true },
  { id: "C3", label: "C3", seats: 4, zone: "outdoor", available: false },
  { id: "C4", label: "C4", seats: 6, zone: "outdoor", available: true },
  { id: "V1", label: "V1", seats: 8, zone: "vip", available: true },
  { id: "V2", label: "V2", seats: 10, zone: "vip", available: true },
];

interface TableSelectorProps {
  onSelect?: (table: Table | null) => void;
}

const TableSelector = ({ onSelect }: TableSelectorProps) => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<"all" | "indoor" | "outdoor" | "vip">("all");

  const zones = [
    { key: "all" as const, label: isAr ? "الكل" : "All" },
    { key: "indoor" as const, label: isAr ? "داخلي" : "Indoor" },
    { key: "outdoor" as const, label: isAr ? "خارجي" : "Outdoor" },
    { key: "vip" as const, label: "VIP" },
  ];

  const filtered = activeZone === "all" ? TABLES : TABLES.filter((t) => t.zone === activeZone);

  const handleSelect = (table: Table) => {
    if (!table.available) return;
    const newId = selectedTable === table.id ? null : table.id;
    setSelectedTable(newId);
    onSelect?.(newId ? table : null);
    if (newId) {
      actionNotify({ message: isAr ? `تم اختيار الطاولة ${table.label}` : `Table ${table.label} selected`, icon: "🪑", sound: "success" });
    }
  };

  const selected = TABLES.find((t) => t.id === selectedTable);

  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden">
      <div className="bg-foreground text-background px-6 py-4">
        <h3 className="font-display text-lg font-bold">
          {isAr ? "اختيار الطاولة" : "Select a Table"}
        </h3>
      </div>

      <div className="p-5 space-y-5">
        {/* Zone Filter */}
        <div className="flex gap-2 flex-wrap">
          {zones.map((z) => (
            <button
              key={z.key}
              onClick={() => { setActiveZone(z.key); actionNotify({ message: z.label, icon: "📍", sound: "soft" }); }}
              className={cn(
                "px-3 py-1.5 rounded-sm text-xs font-medium transition-all border",
                activeZone === z.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40"
              )}
            >
              {z.label}
            </button>
          ))}
        </div>

        {/* Table Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {filtered.map((table) => {
            const isSelected = selectedTable === table.id;
            return (
              <button
                key={table.id}
                onClick={() => handleSelect(table)}
                disabled={!table.available}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-all text-center",
                  !table.available && "opacity-40 cursor-not-allowed bg-muted border-border line-through",
                  table.available && !isSelected && "border-border bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer",
                  isSelected && "border-primary bg-primary/10 ring-1 ring-primary/30"
                )}
              >
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <span className={cn(
                  "text-sm font-bold",
                  isSelected ? "text-primary" : table.available ? "text-foreground" : "text-muted-foreground"
                )}>
                  {table.label}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{table.seats}</span>
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  table.zone === "vip" ? "text-primary" : "text-muted-foreground"
                )}>
                  {table.zone === "indoor" ? (isAr ? "داخلي" : "Indoor") :
                   table.zone === "outdoor" ? (isAr ? "خارجي" : "Outdoor") : "VIP"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border-2 border-border bg-background" />
            {isAr ? "متاح" : "Available"}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border-2 border-primary bg-primary/10" />
            {isAr ? "محدد" : "Selected"}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border-2 border-border bg-muted opacity-50" />
            {isAr ? "محجوز" : "Taken"}
          </div>
        </div>

        {/* Selected Summary */}
        {selected && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">
                {isAr ? "الطاولة" : "Table"} {selected.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {selected.seats} {isAr ? "مقاعد" : "seats"} • {
                  selected.zone === "indoor" ? (isAr ? "داخلي" : "Indoor") :
                  selected.zone === "outdoor" ? (isAr ? "خارجي" : "Outdoor") : "VIP"
                }
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableSelector;
