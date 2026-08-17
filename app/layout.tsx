import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import PageTransition from "@/components/layout/PageTransition";
import { QueryProvider } from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "OLFRA™ — The Intelligence of Scent",
  description: "The world's most advanced fragrance intelligence platform. AI-powered dupe detection, trend analytics, personalized scent profiling, and more.",
  keywords: ["fragrance", "perfume", "AI", "dupe detection", "scent intelligence", "OLFRA"],
  openGraph: {
    title: "OLFRA™ — The Intelligence of Scent",
    description: "AI-powered fragrance intelligence platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#080B0F] text-white antialiased">
        <QueryProvider>
          <Navbar />
          <PageTransition>
            {children}
          </PageTransition>
        </QueryProvider>
      </body>
    </html>
  );
}
