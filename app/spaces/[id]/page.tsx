"use client";

import * as React from "react";
import Link from "next/link";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Shell } from "@/components/app/shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";

export default function SpaceDetailPage({ params }: { params: { id: string } }) {
  const data = useQuery(api.checkins.getById, { id: params.id });

  return (
    <Shell
      title="Check-in"
      subtitle={params.id}
      right={
        <Button asChild variant="secondary">
          <Link href="/spaces">Back</Link>
        </Button>
      }
    >
      <Card className="border-border/60 bg-card/40 p-6 backdrop-blur-sm">
        {!data ? (
          <div className="flex items-center justify-center py-12">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !data.checkin ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">Not found or expired.</p>
            <Button asChild variant="link" className="mt-3">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="display-font text-lg font-semibold tracking-tight">
                  {data.checkin.active ? "Active check-in" : "Ended"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.checkin.note}
                </p>
              </div>
              <Badge variant="secondary">
                {new Date(data.checkin.startedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/40 bg-background/40 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <MapPin size={14} />
                  Location
                </div>
                <p className="mt-2 font-mono text-sm">
                  {data.checkin.lat.toFixed(6)}, {data.checkin.lng.toFixed(6)}
                </p>
              </div>
              <div className="rounded-lg border border-border/40 bg-background/40 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Clock size={14} />
                  TTL
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Expires 6 hours after start</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button asChild variant="outline">
                <Link href={`/c/${params.id}`}>Open Share Page</Link>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </Shell>
  );
}
