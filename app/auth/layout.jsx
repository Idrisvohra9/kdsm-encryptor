import LiquidChrome from "@/components/ui/LiquidChrome";

export const metadata = {
  title: "Authenticate - KDSM Encryptor",
  description:
    "Authenticate to your KDSM Encryptor account to access secure message encryption",
  keywords: [
    "KDSM",
    "login",
    "authentication",
    "encryption",
    "security",
    "message encryption",
    "cryptography",
    "javascript",
    "react",
    "nextjs",
    "idris",
    "messaging",
    "messenger",
    "register",
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
    <div className="flex justify-center items-center min-h-screen p-4">
      <LiquidChrome />
      {children}
    </div>
  );
}
