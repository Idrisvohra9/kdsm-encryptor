import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

const GAP = 16;
const SPRING_OPTIONS = {
  type: "easeIn",
  stiffness: 200, // Reduced stiffness for smoother motion
  damping: 25,    // Adjusted damping
  mass: 2,      // Added mass for more fluid movement
  velocity: 0.5   // Controlled initial velocity
};

const BREAKPOINTS = {
  xl: { width: 1280, container: 720 },
  lg: { width: 1024, container: 680 },
  md: { width: 768, container: 550 },
  sm: { width: 640, container: 370 },
};

const CarouselItem = ({ item, width, theme, mounted }) => (
  <motion.div
    className={`relative shrink-0 flex flex-col items-start justify-between ${item.gradient} border border-secondary-foreground/20 rounded-[12px] overflow-hidden`}
    style={{ width }}
    initial={{ opacity: 0.8, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0.8, scale: 0.95 }}
    transition={{ duration: 0.3 }}
  >
    <div className="mb-4 p-5">
      <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-accent/30">
        {mounted && (
          <Image
            src={`/${theme || "light"}/${item.imageNumber}.png`}
            width={65}
            height={65}
            alt={`${item.title} Logo`}
            className="drop-shadow-lg object-cover"
          />
        )}
      </span>
    </div>
    <div className="p-5 w-full">
      <div className="mb-1 font-black text-lg text-secondary-foreground">
        {item.title}
      </div>
      <p className="text-sm text-secondary-foreground/80 mb-4">
        {item.description}
      </p>
      <Link
        href={item.link}
        className="inline-flex items-center px-4 py-2 rounded-lg bg-secondary-foreground/10 hover:bg-secondary-foreground/20 text-secondary-foreground text-sm font-medium transition-colors duration-200"
      >
        Learn More
      </Link>
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
    gradient:
      "bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/40 dark:to-purple-950/40",
  },
  {
    title: "KDSM Encryptor",
    description:
      "Secure your messages with Keyed Dynamic Shift Matrix encryption",
    id: 2,
    imageNumber: "1",
    link: "/",
    gradient:
      "bg-gradient-to-br from-emerald-50/80 to-cyan-50/80 dark:from-emerald-950/40 dark:to-cyan-950/40",
  },
  {
    title: "KDSM Developer API",
    description: "Integrate KDSM encyption for your projects.",
    id: 3,
    imageNumber: "5",
    link: "/readme/developer",
    gradient:
      "bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/40",
  },
  {
    title: "KDSM Profile Management",
    description:
      "Manage your profile and account settings and sync to your devices.",
    id: 4,
    imageNumber: "3",
    link: "/profile",
    gradient:
      "bg-gradient-to-br from-rose-50/80 to-pink-50/80 dark:from-rose-950/40 dark:to-pink-950/40",
  },
];

export default function Carousel({
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
}) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);

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
        setTimeout(() => setIsTransitioning(false), 500);
      }
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, pauseOnHover, isTransitioning]);

  const itemWidth = containerWidth - 32;
  const offset = -(currentIndex * (itemWidth + GAP));

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden p-4 rounded-[24px] border border-secondary-foreground w-full"
    >
      <AnimatePresence mode="wait">
        <motion.div
          className="flex"
          animate={{ 
            x: offset,
            transition: { ...SPRING_OPTIONS, duration: 0.6 }
          }}
          style={{ gap: GAP, width: itemWidth }}
        >
          {ITEMS.map((item, index) => (
            <CarouselItem
              key={item.id}
              item={item}
              width={itemWidth}
              theme={theme}
              mounted={mounted}
            />
          ))}
        </motion.div>
      </AnimatePresence>
      <div className="flex w-full justify-center">
        <div className="mt-4 flex w-[150px] justify-between px-8">
          {ITEMS.map((_, index) => (
            <motion.button
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 bg-secondary-foreground hover:scale-125 hover:bg-primary ${
                currentIndex === index ? "scale-120" : ""
              }`}
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => !isTransitioning && setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
