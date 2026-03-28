import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface ParallaxHeroProps {
  image: string;
  alt: string;
  height?: string;
  minHeight?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
  speed?: number;
}

const ParallaxHero = ({
  image,
  alt,
  height = "h-[45vh] sm:h-[55vh] md:h-[65vh]",
  minHeight = "min-h-[300px]",
  overlayClassName = "bg-gradient-to-t from-black/70 via-black/30 to-transparent dark:from-black/80",
  children,
  speed = 0.3,
}: ParallaxHeroProps) => {
  const isMobile = useIsMobile();
  const mobileSpeed = isMobile ? speed * 0.4 : speed;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${mobileSpeed * 100}%`]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, isMobile ? 1.04 : 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.6, 0.3]);

  return (
    <section ref={ref} className={`relative ${height} ${minHeight} overflow-hidden`}>
      <motion.img
        src={image}
        alt={alt}
        style={{ y, scale, opacity }}
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
        width={1920}
        height={900}
      />
      <div className={`absolute inset-0 ${overlayClassName}`} />
      {children}
    </section>
  );
};

export default ParallaxHero;
