"use client";

import * as React from "react";
import { ConvexReactClient, ConvexProvider } from "convex/react";

function readConvexUrl(): string | undefined {
  // `process.env.NEXT_PUBLIC_*` is statically inlined by Next at build time.
  // If your dev server wasn't restarted after editing `.env.local`, this can be `undefined`
  // in the browser bundle even though the file exists.
  const v = process.env.NEXT_PUBLIC_CONVEX_URL;
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const url = readConvexUrl();

  // Always mount a provider so hooks don't crash the render tree.
  // If env is missing, use a harmless dummy URL and show a clear banner.
  const client = React.useMemo(
    () => new ConvexReactClient(url ?? "https://invalid.convex.cloud"),
    [url],
  );

  return (
    <ConvexProvider client={client}>
      {!url && (
        <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
          <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm">
            <p className="font-medium">Convex URL missing</p>
            <p className="mt-1 text-muted-foreground">
              `NEXT_PUBLIC_CONVEX_URL` isnt available in the client bundle.
              Restart `npm run dev` so Next picks up `.env.local`.
            </p>
          </div>
        </div>
      )}
      {children}
    </ConvexProvider>
  );
}

export function useConvexConfigured(): boolean {
  return Boolean(readConvexUrl());
}
