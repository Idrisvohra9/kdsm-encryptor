import { FloatingDock } from "./ui/floating-dock";
import Image from "next/image";

export function Dock() {
  const links = [
    {
      title: "Encryptor",
      icon: (
        <Image
          src="/light/1.png"
          width={55}
          height={55}
          alt="KDSM icon"
        />
      ),
      href: "/",
    },
    {
      title: "Profile",
      icon: (
        <Image
          src="/light/3.png"
          width={55}
          height={55}
          alt="Profile icon"
        />
      ),
      href: "/profile",
    },
    {
      title: "Messaging",
      icon: (
        <Image
          src="/light/2.png"
          width={55}
          height={55}
          alt="KDSM messaging Logo"
        />
      ),
      href: "/messaging",
    },
  ];
  return (
    <div className="flex items-center justify-center h-[35rem] w-full">
      <FloatingDock
        mobileClassName="fixed bottom-4 right-4 z-30"
        desktopClassName="fixed bottom-4 z-30"
        items={links}
      />
    </div>
  );
}
