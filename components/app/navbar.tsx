"use client";

import Link from "next/link";
import AuthComp from "@/components/app/auth-comp";
import { usePathname } from "next/navigation";
import { GitHubStars } from "@/components/github-stars";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Map, LayoutGrid, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Map", icon: Map },
    { href: "/spaces", label: "Spaces", icon: LayoutGrid },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 mt-2 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg transition-transform">
                <Map size={18} fill="currentColor" fillOpacity={0.2} />
              </div>
              <span className="text-xl font-bold tracking-tight">WorkIn</span>
            </Link>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
              beta
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden h-10 w-px bg-border/40 md:block" />
          <AuthComp />
        </div>
      </header>

      <nav className="mt-2 flex items-center gap-1 border-b border-border/40 justify-between pb-px">
        <div className="flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:text-foreground",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon size={16} />
                {item.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
        <GitHubStars repo="thetanav/workin" stargazersCount={10} />
      </nav>

    </div>
  );
}
