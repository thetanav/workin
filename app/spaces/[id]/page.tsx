"use client";

import * as React from "react";
import Link from "next/link";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Shell } from "@/components/app/shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SpaceDetailPage({ params }: { params: { id: string } }) {
  const data = useQuery(api.spaces.get, { id: params.id as any });

  return (
    <Shell
      title="Space"
      subtitle={params.id}
      right={
        <Button asChild variant="secondary">
          <Link href="/spaces">Back</Link>
        </Button>
      }
    >
      <Card className="border-border/60 bg-card/40 p-5">
        {!data ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !data.space ? (
          <p className="text-sm text-muted-foreground">Not found.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{data.space.name}</p>
                <p className="text-sm text-muted-foreground">
                  {[data.space.city, data.space.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              <Badge variant="secondary">{data.activeCount} active</Badge>
            </div>

            <div className="grid gap-2">
              {data.active.length === 0 ? (
                <p className="text-sm text-muted-foreground">No one checked in.</p>
              ) : (
                data.active.map((c: any) => (
                  <Card
                    key={String(c._id)}
                    className="border-border/60 bg-background/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">Active check-in</p>
                        {c.note && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {c.note}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground font-mono">
                          /c/{c.shareId}
                        </p>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/c/${c.shareId}`}>Open</Link>
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </Card>
    </Shell>
  );
}
