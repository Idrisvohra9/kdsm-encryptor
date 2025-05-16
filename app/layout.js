import { Inter, Roboto_Flex } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });
const robotoFlex = Roboto_Flex({ 
  subsets: ["latin"],
  variable: '--font-roboto-flex'
});

export const metadata = {
  title: "KDSM Encryptor",
  description: "Secure your messages with Keyed Dynamic Shift Matrix encryption",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${robotoFlex.variable} antialiased dark`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
