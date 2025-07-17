import { gsap } from 'gsap';
import { Fragment, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';

const ITEMS = [
  {
    title: "KDSM Chats",
    imageNumber: "2",
    link: "/chats",
  },
  {
    title: "KDSM Encryptor",
    imageNumber: "1",
    link: "/",
  },
  {
    title: "KDSM Developer API",
    imageNumber: "5",
    link: "/readme#api-documentation",
  },
  {
    title: "KDSM Profile Management",
    imageNumber: "3",
    link: "/profile",
  },
];

function FlowingMenu() {
  // Memoize the menu items to prevent unnecessary re-renders
  const menuItems = useMemo(() => 
    ITEMS.map((item, idx) => (
      <MenuItem key={idx} {...item} />
    )), 
    []
  );

  return (
    <div className="menu-wrap">
      <nav className="menu">
        {menuItems}
      </nav>
    </div>
  );
}

function MenuItem({ link, title, imageNumber }) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);

  // Memoize animation defaults to prevent object recreation
  const animationDefaults = useMemo(() => ({ 
    duration: 0.6, 
    ease: 'expo' 
  }), []);

  // Memoize utility functions to prevent recreation on each render
  const findClosestEdge = useCallback((mouseX, mouseY, width, height) => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  }, []);

  const distMetric = useCallback((x, y, x2, y2) => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
  }, []);

  // Memoize mouse event handlers to prevent unnecessary re-renders of child components
  const handleMouseEnter = useCallback((ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap.timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  }, [findClosestEdge, animationDefaults]);

  const handleMouseLeave = useCallback((ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap.timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  }, [findClosestEdge, animationDefaults]);

  // Memoize the repeated marquee content to prevent array recreation
  const repeatedMarqueeContent = useMemo(() => 
    Array.from({ length: 4 }).map((_, idx) => (
      <Fragment key={idx}>
        <span className="mb-2">{title}</span>
        <div className="w-10 h-10 relative overflow-hidden">
          <Image
            src={`/icons/${imageNumber}.png`}
            alt={`${title} icon`}
            fill
            className="object-cover object-center"
            sizes="40px"
            priority={false}
          />
        </div>
      </Fragment>
    )), 
    [title, imageNumber]
  );

  return (
    <div className="menu__item" ref={itemRef}>
      <a
        className="menu__item-link"
        href={link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {title}
      </a>
      <div className="marquee" ref={marqueeRef}>
        <div className="marquee__inner-wrap" ref={marqueeInnerRef}>
          <div className="marquee__inner" aria-hidden="true">
            {repeatedMarqueeContent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlowingMenu;
