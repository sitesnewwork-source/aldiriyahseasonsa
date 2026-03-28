import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, Utensils, Compass, Ticket, CalendarDays, Clock, Trash2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { actionNotify } from "@/hooks/use-action-notify";
import { useLanguage } from "@/i18n/LanguageContext";
import { places } from "@/data/places";
import { experiences } from "@/data/experiences";
import { restaurants } from "@/data/restaurants";
import { articles } from "@/data/articles";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

type ResultType = "place" | "experience" | "restaurant" | "ticket" | "event" | "article";

interface SearchResult {
  id: string;
  title: string;
  titleEn?: string;
  subtitle: string;
  type: ResultType;
  image: string;
  link: string;
}

const typeConfig: Record<ResultType, { label: string; labelEn: string; icon: typeof MapPin; color: string }> = {
  place: { label: "مكان", labelEn: "Place", icon: MapPin, color: "bg-emerald-500/20 text-emerald-400" },
  experience: { label: "تجربة", labelEn: "Experience", icon: Compass, color: "bg-blue-500/20 text-blue-400" },
  restaurant: { label: "مطعم", labelEn: "Restaurant", icon: Utensils, color: "bg-amber-500/20 text-amber-400" },
  ticket: { label: "تذكرة", labelEn: "Ticket", icon: Ticket, color: "bg-violet-500/20 text-violet-400" },
  event: { label: "فعالية", labelEn: "Event", icon: CalendarDays, color: "bg-rose-500/20 text-rose-400" },
  article: { label: "مقال", labelEn: "Article", icon: FileText, color: "bg-teal-500/20 text-teal-400" },
};

const ticketItems: SearchResult[] = [
  {
    id: "standard",
    title: "تذكرة عادية",
    titleEn: "Standard Ticket",
    subtitle: "50 ريال — دخول عام",
    type: "ticket",
    image: "",
    link: "/checkout",
  },
  {
    id: "vip",
    title: "تذكرة VIP",
    titleEn: "VIP Ticket",
    subtitle: "150 ريال — جولة خاصة + هدية",
    type: "ticket",
    image: "",
    link: "/checkout",
  },
];

const eventItems: SearchResult[] = [
  {
    id: "calligraphy",
    title: "ورشة الخط العربي",
    titleEn: "Arabic Calligraphy Workshop",
    subtitle: "فنون وتراث",
    type: "event",
    image: "",
    link: "/events",
  },
  {
    id: "kids-art",
    title: "ورشة الفنون للأطفال",
    titleEn: "Kids Art Workshop",
    subtitle: "أنشطة عائلية",
    type: "event",
    image: "",
    link: "/events",
  },
  {
    id: "ardah",
    title: "عرض العرضة السعودية",
    titleEn: "Saudi Ardah Show",
    subtitle: "فنون شعبية",
    type: "event",
    image: "",
    link: "/events",
  },
];

const RECENT_KEY = "diriyah_recent_searches";
const MAX_RECENT = 5;

const getRecentSearches = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch { return []; }
};

const saveRecentSearch = (term: string) => {
  const trimmed = term.trim();
  if (!trimmed) return;
  const recent = getRecentSearches().filter((s) => s !== trimmed);
  recent.unshift(trimmed);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
};

const clearRecentSearches = () => localStorage.removeItem(RECENT_KEY);

const SearchDialog = ({ open, onClose }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ResultType | "all">("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const { isRtl } = useLanguage();

  // Load recent searches when dialog opens
  useEffect(() => {
    if (open) setRecentSearches(getRecentSearches());
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const allItems: SearchResult[] = useMemo(() => [
    ...places.map((p) => ({
      id: p.id, title: p.name, subtitle: p.subtitle, type: "place" as const,
      image: p.image, link: `/place/${p.id}`,
    })),
    ...experiences.map((e) => ({
      id: e.id, title: e.title, subtitle: e.category, type: "experience" as const,
      image: e.image, link: `/experience/${e.id}`,
    })),
    ...restaurants.map((r) => ({
      id: r.id, title: r.name, subtitle: r.cuisine, type: "restaurant" as const,
      image: r.image, link: `/restaurant/${r.id}`,
    })),
    ...ticketItems,
    ...eventItems,
    ...articles.map((a) => ({
      id: a.id, title: a.title, titleEn: a.titleEn, subtitle: a.excerpt.slice(0, 60) + "…",
      type: "article" as const, image: a.image, link: `/article/${a.id}`,
    })),
  ], []);

  const results = useMemo(() => {
    let items = allItems;
    if (activeFilter !== "all") {
      items = items.filter((i) => i.type === activeFilter);
    }
    if (!query.trim()) return activeFilter !== "all" ? items : [];
    const q = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.titleEn && item.titleEn.toLowerCase().includes(q))
    );
  }, [query, allItems, activeFilter]);

  const handleSelect = (result: SearchResult) => {
    saveRecentSearch(query.trim() || result.title);
    actionNotify({ message: result.title, icon: "🔍", sound: "soft" });
    navigate(result.link);
    setQuery("");
    setActiveFilter("all");
    onClose();
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const filters: { key: ResultType | "all"; label: string; labelEn: string }[] = [
    { key: "all", label: "الكل", labelEn: "All" },
    { key: "place", label: "أماكن", labelEn: "Places" },
    { key: "experience", label: "تجارب", labelEn: "Experiences" },
    { key: "restaurant", label: "مطاعم", labelEn: "Restaurants" },
    { key: "ticket", label: "تذاكر", labelEn: "Tickets" },
    { key: "event", label: "فعاليات", labelEn: "Events" },
    { key: "article", label: "مقالات", labelEn: "Articles" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[92%] max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isRtl ? "ابحث عن أماكن، تجارب، مطاعم، تذاكر..." : "Search places, experiences, restaurants, tickets..."}
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 outline-none text-sm"
                dir={isRtl ? "rtl" : "ltr"}
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 px-5 py-3 border-b border-border overflow-x-auto scrollbar-none">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                    activeFilter === f.key
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {isRtl ? f.label : f.labelEn}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {query.trim() && results.length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  {isRtl ? `لا توجد نتائج لـ "${query}"` : `No results for "${query}"`}
                </div>
              )}

              {!query.trim() && activeFilter === "all" && recentSearches.length === 0 && (
                <div className="py-8 text-center text-muted-foreground/60 text-xs">
                  {isRtl ? "اكتب للبحث أو اختر فئة" : "Type to search or select a category"}
                </div>
              )}

              {/* Recent Searches */}
              {!query.trim() && activeFilter === "all" && recentSearches.length > 0 && (
                <div className="px-5 py-3">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={handleClearRecent}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      {isRtl ? "مسح" : "Clear"}
                    </button>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {isRtl ? "عمليات البحث الأخيرة" : "Recent Searches"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleRecentClick(term)}
                        className="text-xs px-3 py-1.5 rounded-full bg-muted/70 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border/50 transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.map((result) => {
                const config = typeConfig[result.type];
                const Icon = config.icon;
                return (
                  <motion.button
                    key={`${result.type}-${result.id}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors text-right"
                  >
                    {result.image ? (
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm font-medium truncate">{result.title}</p>
                      <p className="text-muted-foreground text-xs truncate">{result.subtitle}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full flex-shrink-0 ${config.color}`}>
                      <Icon className="w-3 h-3" />
                      {isRtl ? config.label : config.labelEn}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border flex justify-between text-muted-foreground/40 text-[10px]">
              <span>ESC {isRtl ? "للإغلاق" : "to close"}</span>
              <span>{results.length} {isRtl ? "نتيجة" : "results"}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchDialog;
