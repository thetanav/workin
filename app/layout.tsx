import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex";
import { Toaster } from "@/components/ui/sonner";

const sans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "WorkIn",
  description: "Check in and find people to work with nearby.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <ConvexClientProvider>
          {children}
          <Toaster richColors theme="dark" />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
