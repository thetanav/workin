"use client";

import Link from "next/link";
import AuthComp from "@/components/app/auth-comp";
import { usePathname } from "next/navigation";
import { GitHubStars } from "@/components/github-stars";
import { cn } from "@/lib/utils";
import { Map, LayoutGrid, User, MapPin, Settings } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Create", icon: Map },
    { href: "/spaces", label: "Spaces", icon: LayoutGrid },
    { href: "/setting", label: "Setting", icon: Settings },
  ];

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <MapPin className="h-5 w-5" />
            <span className="tracking-tight">WorkIn</span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <GitHubStars repo="thetanav/workin" stargazersCount={10} />
          </div>
          <AuthComp />
        </div>
      </div>

      {/* Mobile Navigation Bar (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 block border-t border-border bg-background md:hidden pb-safe">
        <div className="flex h-14 items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 text-[10px] font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon size={20} className={cn(isActive && "stroke-[2.5px]")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
