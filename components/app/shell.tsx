import Link from "next/link";
import AuthComp from "@/components/app/auth-comp";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground",
        "[background-image:radial-gradient(70%_50%_at_20%_0%,hsl(var(--foreground)/0.10),transparent_55%),radial-gradient(60%_45%_at_90%_10%,hsl(var(--foreground)/0.08),transparent_50%),radial-gradient(40%_30%_at_50%_100%,hsl(var(--foreground)/0.06),transparent_55%)]",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <header className="flex items-start justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-lg font-semibold tracking-tight">
                WorkIn
              </Link>
              <Badge variant="secondary" className="text-xs">
                beta
              </Badge>
            </div>
            {(title || subtitle) && (
              <div>
                {title && (
                  <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="max-w-2xl text-pretty text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <AuthComp />
            {right}
          </div>
        </header>

        <nav className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Map
          </Link>
          <Link href="/spaces" className="hover:text-foreground">
            Spaces
          </Link>
          <Link href="/profile" className="hover:text-foreground">
            Profile
          </Link>
        </nav>

        <main className="mt-6">{children}</main>

        <footer className="mt-10 flex items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <p>Dark-only coworking presence. Built with Convex + mapcn.</p>
          <p className="font-mono">v0</p>
        </footer>
      </div>
    </div>
  );
}
