import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Salon Luxe - Premium Salon Experience",
    template: "%s | Salon Luxe"
  },
  description: "Experience world-class hair styling, skincare, and spa treatments in a sanctuary of luxury. Book your appointment today.",
  keywords: ["salon", "haircut", "spa", "beauty", "luxury salon"],
  authors: [{ name: "Salon Luxe" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://salon-luxe.com",
    title: "Salon Luxe - Premium Salon Experience",
    description: "Experience world-class hair styling, skincare, and spa treatments.",
    siteName: "Salon Luxe",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salon Luxe - Premium Salon Experience",
    description: "Experience world-class hair styling, skincare, and spa treatments.",
  },
};

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingBookingButton } from "@/components/layout/FloatingBookingButton";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <FloatingBookingButton />
        <Toaster />
      </body>
    </html>
  );
}
