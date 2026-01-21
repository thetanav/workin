"use client";

import Link from "next/link";
import AuthComp from "@/components/app/auth-comp";
import { usePathname } from "next/navigation";
import { GitHubStars } from "@/components/github-stars";
import { NotificationsMenu } from "@/components/app/notifications-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Map, MapPin, Settings, Home } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/nearby", label: "Nearby", icon: Map },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 sticky top-0">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-3 sm:px-4 lg:px-6 py-2">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-1.5 font-semibold">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-bold text-base sm:text-lg">WorkIn</span>
          </Link>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <div className="hidden sm:block">
            <GitHubStars repo="thetanav/workin" stargazersCount={10} />
          </div>
          <ThemeToggle />
          <NotificationsMenu />
          <AuthComp />
        </div>
      </div>

      {/* Mobile Navigation Bar (Bottom) */}
      <div className="flex items-center justify-around px-3 py-1.5 bg-background/95 backdrop-blur border-t border-border/40">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 p-2 rounded-md text-xs font-medium transition-all duration-200 min-w-[56px] touch-manipulation",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <Icon size={18} />
              <span className="text-[9px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
