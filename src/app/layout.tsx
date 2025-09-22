import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./extension-overrides.css";
import { HydrationSafe } from "@/components/ClientOnly";
import { InsoleAuthProvider } from "@/lib/context/insole-auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BYKO SPORTS Business Dashboard",
  description: "BYKO SPORTS - Complete business management solution for inventory, customers, and sales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <HydrationSafe>
          <InsoleAuthProvider>
            {children}
          </InsoleAuthProvider>
        </HydrationSafe>
      </body>
    </html>
  );
}
