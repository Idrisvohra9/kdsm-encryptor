import Silk from "@/components/ui/Silk";

export const metadata = {
  title: "Docs",
  description:
    "Read the KDSM Encryptor docs for an overview of the project, its features, and how to get started.",
  keywords: [
    "KDSM",
    "docs",
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
    title: "Docs - KDSM Encryptor",
    description:
      "Read the KDSM Encryptor docs for an overview of the project, its features, and how to get started.",
    url: "https://kdsm.tech/docs",
    siteName: "KDSM Encryptor",
    images: [
      {
        url: "https://kdsm.tech/icons/encryptor.webp",
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
    <>
      <Silk
        speed={5}
        scale={1}
        color={"#1d1d1b"}
        noiseIntensity={1.5}
        rotation={0}
      />
      {children}
    </>
  );
}