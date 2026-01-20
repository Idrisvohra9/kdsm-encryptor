"use client";
import { FloatingDock } from "./ui/floating-dock";
import Image from "next/image";

export function Dock() {
  const links = [
    {
      title: "Encryptor",
      icon: (
        <Image
          src="/icons/encryptor.webp"
          width={55}
          height={55}
          alt="KDSM icon"
          loading="eager"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300 pointer-events-none"
        />
      ),
      href: "/encryptor",
    },
    {
      title: "DOCS",
      icon: (
        <Image
          src="/icons/docs.webp"
          width={55}
          height={55}
          alt="KDSM icon"
          loading="eager"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300 pointer-events-none"
        />
      ),
      href: "/docs",
    },
    {
      title: "Profile",
      icon: (
        <Image
          src="/icons/profile.webp"
          width={55}
          height={55}
          alt="Profile icon"
          loading="eager"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300 pointer-events-none"
        />
      ),
      href: "/profile",
    },
    {
      title: "Chats",
      icon: (
        <Image
          src="/icons/messaging.webp"
          width={55}
          height={55}
          alt="KDSM chats Logo"
          loading="eager"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300 pointer-events-none"
        />
      ),
      href: "/chats",
    },
    {
      title: "Password Generator",
      icon: (
        <Image
          src="/icons/pass.webp"
          width={55}
          height={55}
          alt="KDSM Password generator Logo"
          loading="eager"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300 pointer-events-none"
        />
      ),
      href: "/password-generator",
    },
    {
      title: "Contribute",
      icon: (
        <Image
          src="/icons/github.webp"
          width={55}
          height={55}
          alt="KDSM Contribute Logo"
          loading="eager"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300 pointer-events-none"
        />
      ),
      href: "/contribute",
    },
  ];

  return (
    <div className="flex items-center justify-center w-full">
      <FloatingDock
        mobileClassName="fixed bottom-2 right-2 z-30"
        desktopClassName="fixed bottom-4 z-30"
        items={links}
      />
    </div>
  );
}
