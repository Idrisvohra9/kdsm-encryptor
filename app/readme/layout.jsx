import Silk from "@/components/ui/Silk";

export const metadata = {
  title: "README",
  description:
    "Read the KDSM Encryptor README for an overview of the project, its features, and how to get started.",
  keywords: [
    "KDSM",
    "docs",
    "readme",
    "documentation",
    "account",
    "encryption",
    "security",
    "message encryption",
    "cryptography",
    "javascript",
    "react",
    "nextjs",
    "messaging",
    "messenger",
  ],
  openGraph: {
    title: "Authenticate - KDSM Encryptor",
    description:
      "Authenticate to your KDSM Encryptor account to access secure message encryption",
    url: "https://kdsm.vercel.app/auth/login",
    siteName: "KDSM Encryptor",
    images: [
      {
        url: "https://kdsm.vercel.app/icons/1.png",
        width: 1200,
        height: 630,
        alt: "KDSM Encryptor Authenticate Page",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};
export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen font-tomorrow">
      <Silk
        speed={5}
        scale={1}
        color={"#1d1d1b"}
        noiseIntensity={1.5}
        rotation={0}
      />
      {children}
    </div>
  );
}
