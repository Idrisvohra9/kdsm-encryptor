import BallPit from "@/components/ui/BallPit";

export const metadata = {
  title: "Contribute - KDSM Encryptor",
  description:
    "Join the KDSM Encryptor community and contribute to the future of encryption. Help build innovative Keyed Dynamic Shift Matrix algorithm with modern tech stack.",
  keywords: [
    "KDSM",
    "contribute",
    "open source",
    "encryption",
    "security",
    "github",
    "collaboration",
    "cryptography",
    "javascript",
    "react",
    "nextjs",
    "typescript",
    "tailwind",
    "developer",
    "programming",
  ],
  openGraph: {
    title: "Contribute - KDSM Encryptor",
    description:
      "Join the revolution! Contribute to KDSM Encryptor and help build the future of encryption with cutting-edge security and high performance.",
    url: "https://kdsm.vercel.app/contribute",
    siteName: "KDSM Encryptor",
    images: [
      {
        url: "https://kdsm.vercel.app/icons/7.png",
        width: 1200,
        height: 630,
        alt: "KDSM Encryptor Contribute Page",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function Layout({ children }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen h-full max-w-screen w-full overflow-x-hidden relative">
      {/* Enhanced BallPit with better colors for contribution theme */}
      <div className="absolute w-screen h-screen overflow-hidden">
        <BallPit
          count={200}
          gravity={0.9}
          friction={0.8}
          wallBounce={0.95}
          followCursor={true}
          // colors={[0x6366f1, 0x8b5cf6, 0x06b6d4, 0x10b981, 0xf59e0b, 0xef4444]} // Tech-inspired gradient
          className="fixed z-0"
        />
      </div>
      {children}
    </div>
  );
}
