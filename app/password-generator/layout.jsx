import LetterGlitch from "@/components/ui/LetterGlitch";

export const metadata = {
  title: "Password Generator",
  description:
    "View and manage your KDSM Encryptor account settings and API keys",
  keywords: [
    "KDSM",
    "profile",
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
    <div className="flex min-h-screen h-full flex-col items-center justify-between p-4 md:p-24">
      <LetterGlitch />
      {children}
    </div>
  );
}
