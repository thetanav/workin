import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/app/providers";
import Navbar from "@/components/app/navbar";
import { ThemeProvider } from "next-themes";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.className} antialiased h-screen w-full flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider>
            <ConvexClientProvider>
              <Navbar />
              <main className="flex-1 h-full overflow-y-auto">{children}</main>
            </ConvexClientProvider>
          </ClerkProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
