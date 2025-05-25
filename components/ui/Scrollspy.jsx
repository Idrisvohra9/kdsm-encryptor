"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { unstable_ViewTransition as ViewTransition } from "react";
import Image from "next/image";

const Scrollspy = ({ sections }) => {
  const [activeSection, setActiveSection] = useState("");
  const observerRef = useRef(null);

  useEffect(() => {
    // Set up intersection observer
    const options = {
      rootMargin: "-10% 0% -80% 0%",
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    // Observe all section elements
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observerRef.current.observe(element);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sections]);

  const handleClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  return (
    <aside className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 max-h-[80vh] overflow-y-auto hidden lg:block">
      <nav className="p-4 rounded-lg backdrop-blur-md bg-background/30 border border-primary/10">
        <div className="flex justify-center w-full mb-5">
          <ViewTransition name="kdsm-logo">
            <Image
              src="/dark/1.png"
              width={48}
              height={48}
              className="me-2 object-cover"
              alt="KDSM Logo"
            />
          </ViewTransition>
        </div>
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => handleClick(section.id)}
                className={`text-sm transition-all duration-300 cursor-pointer ${
                  activeSection === section.id
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {activeSection === section.id && (
                  <motion.span
                    layoutId="indicator"
                    className="absolute left-0 w-1 h-5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative pl-4">{section.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Scrollspy;
