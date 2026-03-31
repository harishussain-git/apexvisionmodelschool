import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StickyHeader from "@/components/layout/StickyHeader";
import SoundBtn from "@/components/ui/SoundBtn";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Apex Manual",
  description: "Apex Manual preview routes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-[#2e2e2e] antialiased`}>
        <StickyHeader />
        {children}
        <SoundBtn />
      </body>
    </html>
  );
}
