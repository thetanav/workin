"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Shell } from "@/components/app/shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";

export default function SharePage({
  params,
}: {
  params: { shareId: string };
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unwrappedParams = React.use(params as any) as { shareId: string };
  
  const data = useQuery(api.checkins.getById, {
    id: unwrappedParams.shareId,
  });

  return (
    <Shell
      title="Check-in Details"
      subtitle={`ID: ${unwrappedParams.shareId}`}
      right={
        <Button asChild variant="secondary">
          <Link href="/">Back to map</Link>
        </Button>
      }
    >
      <div className="mx-auto max-w-2xl mt-6">
        <Card className="border-border/60 bg-card/40 p-8 backdrop-blur-sm">
          {!data ? (
             <div className="flex items-center justify-center py-12">
               <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
             </div>
          ) : !data.checkin ? (
            <div className="text-center py-12">
              <p className="text-lg font-medium text-destructive">Check-in not found or expired.</p>
              <Button asChild variant="link" className="mt-4">
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${data.checkin.active ? "bg-green-500 shadow-[0_0_10px_theme(colors.green.500)]" : "bg-muted"}`} />
                  <span className="text-lg font-medium tracking-tight">
                    {data.checkin.active ? "Active Session" : "Session Ended"}
                  </span>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {new Date(data.checkin.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              </div>

              <div className="rounded-xl bg-muted/30 p-6 border border-border/40">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <MapPin size={14} />
                    <span>Status Note</span>
                </div>
                <p className="text-xl font-light leading-relaxed text-foreground">
                  "{data.checkin.note}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                 <div className="flex flex-col gap-1 p-4 rounded-lg bg-background/40 border border-border/40">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Latitude</span>
                    <span className="font-mono text-sm">{data.checkin.lat.toFixed(6)}</span>
                 </div>
                 <div className="flex flex-col gap-1 p-4 rounded-lg bg-background/40 border border-border/40">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Longitude</span>
                    <span className="font-mono text-sm">{data.checkin.lng.toFixed(6)}</span>
                 </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4">
                <Clock size={12} />
                <span>Expires 6 hours after start</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
