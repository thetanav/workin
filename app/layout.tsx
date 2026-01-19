import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/app/providers";
import Navbar from "@/components/app/navbar";

const sans = Inter({
  subsets: ["latin"],
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
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
    <html lang="en">
      <body className={`${sans.className} ${display.variable} antialiased`}>
        <ClerkProvider>
          <ConvexClientProvider>
            <Navbar />
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
        <Toaster richColors theme="dark" />
      </body>
    </html>
  );
}
