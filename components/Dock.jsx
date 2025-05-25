"use client";
import { useTheme } from "next-themes";
import { FloatingDock } from "./ui/floating-dock";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Dock() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    {
      title: "Encryptor",
      icon: mounted ? (
          <Image
            src={`/${theme || "light"}/1.png`}
            width={55}
            height={55}
            alt="KDSM icon"
            className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300"
          />
      ) : null,
      href: "/",
    },
    {
      title: "README",
      icon: mounted ? (
        <Image
          src={`/${theme || "light"}/4.png`}
          width={55}
          height={55}
          alt="KDSM icon"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300"
        />
      ) : null,
      href: "/readme",
    },
    {
      title: "Profile",
      icon: mounted ? (
        <Image
          src={`/${theme || "light"}/3.png`}
          width={55}
          height={55}
          alt="Profile icon"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300"
        />
      ) : null,
      href: "/profile",
    },
    {
      title: "Messaging",
      icon: mounted ? (
        <Image
          src={`/${theme || "light"}/2.png`}
          width={55}
          height={55}
          alt="KDSM messaging Logo"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300"
        />
      ) : null,
      href: "/messaging",
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center justify-center w-full">
      <FloatingDock
        mobileClassName="fixed bottom-4 right-4 z-30"
        desktopClassName="fixed bottom-4 z-30"
        items={links}
      />
    </div>
  );
}
