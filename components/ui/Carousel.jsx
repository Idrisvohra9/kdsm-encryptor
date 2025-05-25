import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

const BREAKPOINTS = {
  xl: { width: 1280, container: 720 },
  lg: { width: 1024, container: 620 },
  md: { width: 768, container: 550 },
  sm: { width: 640, container: 330 },
};

const CarouselItem = ({ item, itemWidth, rotateY, effectiveTransition, theme, mounted }) => (
  <motion.div
    className={`relative shrink-0 flex flex-col items-start justify-between ${item.gradient} border border-secondary-foreground/20 rounded-[12px] overflow-hidden cursor-grab active:cursor-grabbing backdrop-blur-sm`}
    style={{ width: itemWidth, rotateY }}
    transition={effectiveTransition}
  >
    <div className="mb-4 p-5">
      <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-accent/30 backdrop-blur-sm">
        {mounted && (
          <Image
            src={`/${theme || "light"}/${item.imageNumber}.png`}
            width={65}
            height={65}
            alt={`${item.title} Logo`}
            className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300 object-cover"
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

export default function Carousel({
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
}) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const items = useMemo(() => [
    {
      title: "KDSM Messaging",
      description: "A simple and secure messaging app, for u to take control!",
      id: 1,
      imageNumber: "2",
      link: "/messaging",
      gradient: "bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/40 dark:to-purple-950/40",
    },
    {
      title: "KDSM Encryptor",
      description: "Secure your messages with Keyed Dynamic Shift Matrix encryption",
      id: 2,
      imageNumber: "1",
      link: "/",
      gradient: "bg-gradient-to-br from-emerald-50/80 to-cyan-50/80 dark:from-emerald-950/40 dark:to-cyan-950/40",
    },
    {
      title: "KDSM Developer API",
      description: "Integrate KDSM encyption for your projects.",
      id: 3,
      imageNumber: "5",
      link: "/readme/developer",
      gradient: "bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/40",
    },
    {
      title: "KDSM Profile Management",
      description: "Manage your profile and account settings and sync to your devices.",
      id: 4,
      imageNumber: "3",
      link: "/profile",
      gradient: "bg-gradient-to-br from-rose-50/80 to-pink-50/80 dark:from-rose-950/40 dark:to-pink-950/40",
    },
  ], []);

  useEffect(() => setMounted(true), []);

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const updateWidth = useCallback(() => {
    if (!containerRef.current) return;
    
    const width = containerRef.current.offsetWidth;
    for (const [, value] of Object.entries(BREAKPOINTS)) {
      if (window.innerWidth >= value.width) {
        setContainerWidth(value.container);
        return;
      }
    }
    setContainerWidth(width);
  }, []);

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  const containerPadding = 16;
  const itemWidth = containerWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const carouselItems = loop ? [...items, items[0]] : items;
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!pauseOnHover || !containerRef.current) return;
    
    const container = containerRef.current;
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);
    
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [pauseOnHover]);

  useEffect(() => {
    if (!autoplay || (pauseOnHover && isHovered)) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev === items.length - 1 && loop) return prev + 1;
        if (prev === carouselItems.length - 1) return loop ? 0 : prev;
        return prev + 1;
      });
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, loop, items.length, carouselItems.length, pauseOnHover]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = useCallback(() => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  }, [loop, currentIndex, carouselItems.length, x]);

  const handleDragEnd = useCallback((_, info) => {
    const { offset, velocity } = info;
    if (offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  }, [loop, currentIndex, items.length, carouselItems.length]);

  const dragProps = useMemo(() => loop ? {} : {
    dragConstraints: {
      left: -trackItemOffset * (carouselItems.length - 1),
      right: 0,
    }
  }, [loop, trackItemOffset, carouselItems.length]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden p-4 rounded-[24px] border border-secondary-foreground w-full"
    >
      <motion.div
        className="flex"
        drag="x"
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          const range = [
            -(index + 1) * trackItemOffset,
            -index * trackItemOffset,
            -(index - 1) * trackItemOffset,
          ];
          const rotateY = useTransform(x, range, [90, 0, -90], { clamp: false });
          return (
            <CarouselItem
              key={index}
              item={item}
              itemWidth={itemWidth}
              rotateY={rotateY}
              effectiveTransition={effectiveTransition}
              theme={theme}
              mounted={mounted}
            />
          );
        })}
      </motion.div>
      <div className="flex w-full justify-center">
        <div className="mt-4 flex w-[150px] justify-between px-8">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className="h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 bg-secondary-foreground hover:scale-125 hover:bg-primary"
              animate={{
                scale: currentIndex % items.length === index ? 1.2 : 1,
              }}
              onClick={() => setCurrentIndex(index)}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
