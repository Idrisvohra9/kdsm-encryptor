import Beams from "@/components/ui/Beams";

export const metadata = {
  title: "Pricing",
  description:
    "Upgrade your KDSM Encryptor account to access premium features and enhanced security.",
  keywords: [
    "KDSM",
    "pricing",
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
    <div className="relative min-h-screen">
      <Beams />
      {children}
    </div>
  );
}
