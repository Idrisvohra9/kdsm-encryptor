"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { unstable_ViewTransition as ViewTransition } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react"; // Import an icon for the toggle button

const Scrollspy = ({ sections }) => {
  const [activeSection, setActiveSection] = useState("");
  const observerRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility

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
        top: element.offsetTop,
        behavior: "smooth",
      });
      setIsSidebarOpen(false); // Close sidebar on item click
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Toggle button for small screens */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-background/80 backdrop-blur-md lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay for small screens when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar content */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          bg-background/50 backdrop-blur-md border-r lg:border-primary
          lg:fixed lg:left-4 lg:top-1/2 lg:transform lg:-translate-y-1/2 lg:z-40 lg:max-h-fit lg:overflow-y-auto lg:block lg:w-auto lg:border-none lg:rounded-3xl lg:translate-x-0
        `}
      >
        <nav className="p-4">
          <div className="flex justify-between items-center w-full mb-5 lg:hidden">
             <ViewTransition name="kdsm-logo">
              <Image
                src="/dark/1.png"
                width={48}
                height={48}
                className="me-2 object-cover"
                alt="KDSM Logo"
              />
            </ViewTransition>
            <button onClick={toggleSidebar} className="p-2 rounded-md">
               <X className="h-6 w-6" />
            </button>
          </div>
           <div className="justify-center w-full mb-5 hidden lg:flex">
              <Image
                src="/dark/1.png"
                width={48}
                height={48}
                className="me-2 object-cover"
                alt="KDSM Logo"
              />
          </div>
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => handleClick(section.id)}
                  className={`text-sm transition-all duration-300 cursor-pointer ${activeSection === section.id ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"}`}
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
    </>
  );
};

export default Scrollspy;
