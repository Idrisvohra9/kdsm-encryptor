import { Silkscreen, Tomorrow } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Dock } from "@/components/Dock";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";

const silkscreen = Silkscreen({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-silkscreen",
  display: 'swap', // Optimize font loading
});

const tomorrow = Tomorrow({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-tomorrow",
  display: 'swap', // Optimize font loading
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
  ],
  openGraph: {
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
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${silkscreen.variable} ${tomorrow.variable} antialiased font-silkscreen`}
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