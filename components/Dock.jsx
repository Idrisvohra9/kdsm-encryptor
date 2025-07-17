"use client";
import { FloatingDock } from "./ui/floating-dock";
import Image from "next/image";

export function Dock() {
  const links = [
    {
      title: "Encryptor",
      icon: (
        <Image
          src="/icons/1.png"
          width={55}
          height={55}
          alt="KDSM icon"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300"
        />
      ),
      href: "/",
    },
    {
      title: "README",
      icon: (
        <Image
          src="/icons/4.png"
          width={55}
          height={55}
          alt="KDSM icon"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300"
        />
      ),
      href: "/readme",
    },
    {
      title: "Profile",
      icon: (
        <Image
          src="/icons/3.png"
          width={55}
          height={55}
          alt="Profile icon"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300"
        />
      ),
      href: "/profile",
    },
    {
      title: "Chats",
      icon: (
        <Image
          src="/icons/2.png"
          width={55}
          height={55}
          alt="KDSM chats Logo"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300"
        />
      ),
      href: "/chats",
    },
    {
      title: "Password Generator",
      icon: (
        <Image
          src="/icons/6.png"
          width={55}
          height={55}
          alt="KDSM Password generator Logo"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-shadow duration-300"
        />
      ),
      href: "/password-generator",
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
