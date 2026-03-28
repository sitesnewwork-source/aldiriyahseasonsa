import { useState, useRef, useEffect, ImgHTMLAttributes, memo } from "react";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Show blur placeholder while loading */
  blur?: boolean;
}

/**
 * Lazy-loaded image with IntersectionObserver + fade-in transition.
 * Only loads the image when it enters viewport (with 200px rootMargin).
 */
const OptimizedImage = memo(({ src, alt, blur = true, className = "", style, ...props }: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    // If native lazy loading already handled it or no IntersectionObserver
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={inView ? src : undefined}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      style={style}
      {...props}
    />
  );
});

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
