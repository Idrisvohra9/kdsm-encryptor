export const metadata = {
  title: "Chats - KDSM Encryptor",
  description:
    "Secure encrypted chat rooms with end-to-end KDSM encryption. Create and manage your private conversations.",
  keywords: [
    "KDSM",
    "chat",
    "messaging",
    "encrypted chat",
    "secure messaging",
    "end-to-end encryption",
    "private chat rooms",
    "cryptography",
    "javascript",
    "react",
    "nextjs",
    "idris",
    "messenger",
    "security",
  ],
  openGraph: {
    title: "Chats - KDSM Encryptor",
    description:
      "Secure encrypted chat rooms with end-to-end KDSM encryption. Create and manage your private conversations.",
    url: "https://kdsm.vercel.app/chats",
    siteName: "KDSM Encryptor",
    images: [
      {
        url: "https://kdsm.vercel.app/icons/1.png",
        width: 1200,
        height: 630,
        alt: "KDSM Encryptor Chat Rooms",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function Layout({ children }) {
  return children;
}
