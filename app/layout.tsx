import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Providers from "@/components/app/providers";

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
        <Providers>
          {children}
        </Providers>
        <Toaster richColors theme="dark" />
      </body>
    </html>
  );
}
