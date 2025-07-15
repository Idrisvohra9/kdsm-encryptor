import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const GAP = 20;
const SMOOTH_TRANSITION = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.6,
};

const BREAKPOINTS = {
  xl: { width: 1280, container: 720 },
  lg: { width: 1024, container: 680 },
  md: { width: 768, container: 550 },
  sm: { width: 640, container: 370 },
};

const CarouselItem = ({ item, width, isActive }) => (
  <motion.div
    className={`relative shrink-0 flex flex-col items-start justify-between ${item.gradient} border border-primary/30 rounded-lg overflow-hidden shadow-xl shadow-primary/10 backdrop-blur-sm w-full`}
    style={{ width }}
    initial={{ opacity: 0.7, scale: 0.95, y: 20 }}
    animate={{ 
      opacity: isActive ? 1 : 0.8, 
      scale: isActive ? 1 : 0.98,
      y: isActive ? 0 : 5
    }}
    exit={{ opacity: 0.7, scale: 0.95, y: 20 }}
    transition={SMOOTH_TRANSITION}
    whileHover={{ 
      scale: 1.02, 
      y: -3,
      boxShadow: "0 20px 40px -10px rgba(var(--primary), 0.2)"
    }}
  >
    {/* Retro gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
    
    {/* Subtle animated glow */}
    <motion.div 
      className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0"
      animate={{ opacity: isActive ? [0, 0.2, 0] : 0 }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />

    <div className="mb-4 p-4 relative z-10">
      <motion.span 
        className="flex h-[48px] w-[48px] items-center justify-center rounded-lg bg-card/60 border border-primary/40 shadow-lg"
        whileHover={{ scale: 1.1 }}
        transition={SMOOTH_TRANSITION}
      >
        <Image
          src={`/icons/${item.imageNumber}.png`}
          width={65}
          height={65}
          alt={`${item.title} Logo`}
          className="drop-shadow-lg object-cover filter brightness-110"
        />
      </motion.span>
    </div>

    <div className="p-4 w-full relative z-10">
      <motion.div 
        className="mb-2 font-bold text-xl text-secondary-foreground tracking-wide"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...SMOOTH_TRANSITION, delay: 0.2 }}
      >
        {item.title}
      </motion.div>
      
      <motion.p 
        className="text-sm text-muted-foreground mb-6 leading-relaxed"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...SMOOTH_TRANSITION, delay: 0.3 }}
      >
        {item.description}
      </motion.p>
      
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={SMOOTH_TRANSITION}
      >
        <Link
          href={item.link}
          className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-primary/30 to-secondary/30 hover:from-primary/40 hover:to-secondary/40 text-primary-foreground text-sm font-semibold transition-all duration-300 border border-primary/40 hover:border-primary/60 shadow-lg hover:shadow-xl backdrop-blur-sm"
        >
          <span className="mr-2">→</span>
          Learn More
        </Link>
      </motion.div>
    </div>
  </motion.div>
);

const ITEMS = [
  {
    title: "KDSM Messaging",
    description: "A simple and secure messaging app, for u to take control!",
    id: 1,
    imageNumber: "2",
    link: "/messaging",
    gradient: "bg-gradient-to-br from-background/80 via-card/90 to-primary/40",
  },
  {
    title: "KDSM Encryptor",
    description: "Secure your messages with Keyed Dynamic Shift Matrix encryption",
    id: 2,
    imageNumber: "1",
    link: "/",
    gradient: "bg-gradient-to-br from-secondary/40 via-card/90 to-background/80",
  },
  {
    title: "KDSM Developer API",
    description: "Integrate KDSM encyption for your projects.",
    id: 3,
    imageNumber: "5",
    link: "/readme/developer",
    gradient: "bg-gradient-to-br from-accent/40 via-card/90 to-primary/40",
  },
  {
    title: "KDSM Profile Management",
    description: "Manage your profile and account settings and sync to your devices.",
    id: 4,
    imageNumber: "3",
    link: "/profile",
    gradient: "bg-gradient-to-br from-destructive/40 via-card/90 to-secondary/40",
  },
];

export default function Carousel({
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      if (!containerRef.current) return;
      const width = window.innerWidth;
      const breakpoint = Object.values(BREAKPOINTS).find(
        (bp) => width >= bp.width
      );
      setContainerWidth(
        breakpoint
          ? breakpoint.container
          : Math.min(containerRef.current.offsetWidth - 32, 300)
      );
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (!autoplay || (pauseOnHover && containerRef.current?.matches(":hover")))
      return;

    const timer = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1) % ITEMS.length);
        setTimeout(() => setIsTransitioning(false), 600);
      }
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, pauseOnHover, isTransitioning]);

  const itemWidth = containerWidth - 40;
  const offset = -(currentIndex * (itemWidth + GAP));

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl border border-border/60  bg-gradient-to-br from-background/80 via-card/90 to-muted/80 backdrop-blur-md shadow-2xl shadow-background/50 w-full"
    >
      {/* Retro corner accents */}
      <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-primary/60 rounded-tl" />
      <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-primary/60 rounded-tr" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-primary/60 rounded-bl" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-primary/60 rounded-br" />

      <AnimatePresence mode="wait">
        <motion.div
          className="flex"
          animate={{
            x: offset,
            transition: { ...SMOOTH_TRANSITION, duration: 0.8 },
          }}
          style={{ gap: GAP, width: itemWidth }}
        >
          {ITEMS.map((item, index) => (
            <CarouselItem
              key={item.id}
              item={item}
              width={itemWidth}
              isActive={index === currentIndex}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="flex w-full justify-center">
        <div className="mt-6 flex w-[200px] justify-between px-8">
          {ITEMS.map((_, index) => (
            <motion.button
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 border border-border/40 ${
                currentIndex === index 
                  ? "bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/50 scale-110" 
                  : "bg-muted/60 hover:bg-muted-foreground/20"
              }`}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => !isTransitioning && setCurrentIndex(index)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SMOOTH_TRANSITION, delay: index * 0.1 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
