import Link from "next/link";
import AuthComp from "@/components/app/auth-comp";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Map, LayoutGrid, User, Github, Twitter } from "lucide-react";

export function Shell({
  children,
  className,
  title,
  subtitle,
  right,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Map", icon: Map },
    { href: "/spaces", label: "Spaces", icon: LayoutGrid },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground selection:bg-primary/20",
        "[background-image:radial-gradient(80%_60%_at_50%_-10%,hsl(var(--primary)/0.15),transparent_70%),radial-gradient(50%_40%_at_10%_20%,hsl(var(--foreground)/0.05),transparent_50%)]",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="group flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                  <Map size={18} fill="currentColor" fillOpacity={0.2} />
                </div>
                <span className="text-xl font-bold tracking-tight">WorkIn</span>
              </Link>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                beta
              </Badge>
            </div>
            
            {(title || subtitle) && (
              <div className="max-w-3xl space-y-2">
                {title && (
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-lg text-muted-foreground text-pretty max-w-2xl leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden h-10 w-px bg-border/40 md:block" />
            <AuthComp />
            {right}
          </div>
        </header>

        <nav className="mt-12 flex items-center gap-1 border-b border-border/40 pb-px">
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
        </nav>

        <main className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          {children}
        </main>

        <footer className="mt-20 border-t border-border/40 pt-10 pb-20">
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center">
                  <Map size={14} className="text-muted-foreground" />
                </div>
                <span className="font-bold tracking-tight">WorkIn</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                The dark-only coworking presence platform. Find where builders are working today.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-x-12 gap-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Stack</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="hover:text-primary cursor-default transition-colors">Convex</li>
                  <li className="hover:text-primary cursor-default transition-colors">Next.js</li>
                  <li className="hover:text-primary cursor-default transition-colors">Clerk</li>
                  <li className="hover:text-primary cursor-default transition-colors">MapLibre</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Connect</h4>
                <div className="flex items-center gap-4">
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Twitter size={20} />
                  </Link>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Github size={20} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 flex items-center justify-between border-t border-border/10 pt-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            <p>© 2026 WorkIn. All rights reserved.</p>
            <p>v0.1.0-beta</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
