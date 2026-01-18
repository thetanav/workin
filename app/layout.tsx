import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import ConvexClientProvider from "@/components/app/convex-clerk";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
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
      <body className={`${sans.className} antialiased`}>
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
        <Toaster richColors theme="dark" />
      </body>
    </html>
  );
}
