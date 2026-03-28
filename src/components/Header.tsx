import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronLeft, ChevronDown, Search, BookOpen, Moon, Sun, Globe } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { scrollToSection } from "@/lib/scroll";
import { places } from "@/data/places";
import SearchDialog from "./SearchDialog";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/hooks/use-theme";

const Header = () => {
  const { lang, toggleLanguage, t, isRtl } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [placesOpen, setPlacesOpen] = useState(false);
  const [mobilePlacesOpen, setMobilePlacesOpen] = useState(false);
  const placesRef = useRef<HTMLLIElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: t("nav.about"), page: "/about" },
    { label: t("nav.places"), page: "/places", hasDropdown: true },
    { label: t("nav.experiences"), page: "/experiences" },
    { label: t("nav.plan"), page: "/plan" },
    { label: t("nav.articles"), page: "/articles" },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (placesRef.current && !placesRef.current.contains(e.target as Node)) {
        setPlacesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // Ctrl+K / Cmd+K shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleNavClick = (link: { label: string; sectionId?: string; page?: string }) => {
    setIsOpen(false);
    if (link.page) {
      navigate(link.page);
      return;
    }
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToSection(link.sectionId!), 400);
    } else {
      scrollToSection(link.sectionId!);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Gold accent top bar */}
      <div className="h-[2px] bg-gradient-gold" />

      <nav
        className={`transition-all duration-500 ${
          scrolled || isOpen
            ? "bg-background/95 backdrop-blur-md shadow-[0_2px_20px_-4px_hsl(var(--gold)/0.15)]"
            : "bg-background"
        }`}
      >
        {/* Bottom gold animated line */}
        <div className={`absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}>
          <div className="w-full h-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16 md:h-[72px]">
          {/* Left side */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-foreground p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="القائمة"
            >
              {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="text-foreground/70 hover:text-foreground transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="بحث"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="text-foreground/70 hover:text-foreground transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={theme === "dark" ? "الوضع الفاتح" : "الوضع المظلم"}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleLanguage}
              className="text-foreground/70 hover:text-foreground transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center gap-1 text-xs font-bold"
              aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
            >
              <Globe className="w-4 h-4" />
              {lang === "ar" ? "EN" : "ع"}
            </button>
            <button
              onClick={() => handleNavClick({ label: "", sectionId: "places" })}
              className="hidden sm:flex text-foreground/70 hover:text-foreground transition-colors p-2 min-w-[44px] min-h-[44px] items-center justify-center"
              aria-label="خريطة"
            >
              <BookOpen className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Nav links */}
          <ul className="hidden lg:flex items-center gap-7 xl:gap-9">
            {navLinks.map((link) => (
              <li key={link.label} ref={link.hasDropdown ? placesRef : undefined} className="relative">
                <button
                  onClick={() => {
                    if (link.hasDropdown) {
                      setPlacesOpen((v) => !v);
                    } else {
                      handleNavClick(link);
                    }
                  }}
                  className="flex items-center gap-1.5 text-foreground/80 hover:text-foreground transition-colors text-sm font-medium relative group"
                >
                  {link.hasDropdown && (
                    <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${placesOpen ? "rotate-180" : ""}`} />
                  )}
                  <span>{link.label}</span>
                  <span className="absolute -bottom-1 right-0 w-0 h-[1.5px] bg-gradient-to-r from-gold to-gold-light transition-all duration-300 group-hover:w-full" />
                </button>
                {link.hasDropdown && (
                  <AnimatePresence>
                    {placesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-full ${isRtl ? "right-0" : "left-0"} mt-3 w-56 bg-background border border-border/50 rounded-lg shadow-lg overflow-hidden z-50`}
                      >
                        {places.map((place) => (
                          <Link
                            key={place.id}
                            to={`/place/${place.id}`}
                            onClick={() => setPlacesOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors border-b border-border/20"
                          >
                            <img src={place.image} alt={place.name} className="w-8 h-8 rounded object-cover" />
                            <span className="font-medium">{place.name}</span>
                          </Link>
                        ))}
                        <Link
                          to="/places"
                          onClick={() => setPlacesOpen(false)}
                          className="block px-4 py-3 text-sm text-primary hover:bg-muted/50 transition-colors text-center font-medium"
                        >
                          عرض الكل
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </li>
            ))}
          </ul>

          {/* Right side: Logo */}
          <Link to="/" className={`flex flex-col ${isRtl ? "items-end" : "items-start"} group`}>
            <span className="font-display text-xl sm:text-2xl md:text-[28px] font-bold leading-none tracking-tight text-shimmer-gold">
              {t("nav.logo")}
            </span>
            <span className="text-[9px] sm:text-[10px] text-gold/40 mt-0.5 tracking-wider group-hover:text-gold/70 transition-colors">
              {t("nav.tagline")}
            </span>
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed inset-x-0 top-[calc(theme(spacing.14)+theme(spacing.1))] sm:top-[calc(theme(spacing.16)+theme(spacing.1))] bottom-0 bg-background overflow-y-auto"
          >
            <ul className="flex flex-col py-6 px-6 gap-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => {
                      if (link.hasDropdown) {
                        setMobilePlacesOpen((v) => !v);
                      } else {
                        handleNavClick(link);
                      }
                    }}
                    className="w-full flex items-center justify-between text-foreground/80 hover:text-foreground text-base py-4 border-b border-border/30"
                  >
                    <ChevronLeft className={`w-4 h-4 opacity-30 transition-transform ${link.hasDropdown && mobilePlacesOpen ? "rotate-90" : ""}`} />
                    <span className="font-medium">{link.label}</span>
                  </button>
                  {link.hasDropdown && mobilePlacesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {places.map((place) => (
                        <Link
                          key={place.id}
                          to={`/place/${place.id}`}
                          onClick={() => { setIsOpen(false); setMobilePlacesOpen(false); }}
                          className={`flex items-center gap-3 py-3 ${isRtl ? "pr-4 pl-2" : "pl-4 pr-2"} text-sm text-foreground/70 hover:text-foreground transition-colors`}
                        >
                          <img src={place.image} alt={place.name} className="w-7 h-7 rounded object-cover" />
                          <span>{place.name}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default Header;
