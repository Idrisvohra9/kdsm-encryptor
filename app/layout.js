import { Inter, Roboto_Flex } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Dock } from "@/components/Dock";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  variable: "--font-roboto-flex",
});

export const metadata = {
  title: "KDSM Encryptor",
  description:
    "Secure your messages with Keyed Dynamic Shift Matrix encryption",
  keywords: [
    "KDSM",
    "encryption",
    "decryption",
    "security",
    "message encryption",
    "cryptography",
    "javascript",
    "react",
    "nextjs",
    "idris",
    "messaging",
    "messenger",
  ], // Added relevant keywords
  openGraph: {
    // Added Open Graph metadata
    title: "KDSM Encryptor",
    description:
      "Secure your messages with Keyed Dynamic Shift Matrix encryption",
    url: "https://kdsm.vercel.app",
    siteName: "KDSM Encryptor",
    images: [
      {
        url: "https://kdsm.vercel.app/dark/1.png",
        width: 1200,
        height: 630,
        alt: "KDSM Encryptor OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    // Added Twitter Card metadata
    card: "summary_large_image",
    title: "KDSM Encryptor",
    description:
      "Secure your messages with Keyed Dynamic Shift Matrix encryption",
    images: ["https://kdsm.vercel.app/dark/1.png"],
    creator: "@your-twitter-handle",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${robotoFlex.className} antialiased bg-pimary`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <main>{children}</main>
            <Dock />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
