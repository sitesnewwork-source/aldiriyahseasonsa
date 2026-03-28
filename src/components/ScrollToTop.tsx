import { useEffect, forwardRef } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = forwardRef<HTMLDivElement>((_, ref) => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
});

ScrollToTop.displayName = "ScrollToTop";

export default ScrollToTop;