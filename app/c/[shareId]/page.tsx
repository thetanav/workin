"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ArrowLeft, Loader2 } from "lucide-react";

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

  if (data === undefined) {
      return (
          <div className="flex h-[calc(100vh-64px)] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
      )
  }

  if (!data?.checkin) {
      return (
          <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-4 text-center p-4">
              <h1 className="text-2xl font-bold tracking-tight">Check-in Not Found</h1>
              <p className="text-muted-foreground max-w-[400px]">
                  This check-in link might be expired or invalid. Check-ins automatically expire after 6 hours.
              </p>
              <Button asChild>
                  <Link href="/">Back to Map</Link>
              </Button>
          </div>
      )
  }

  const { checkin } = data;

  return (
    <div className="container mx-auto max-w-lg px-4 py-12 md:py-24">
       <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Map
      </Link>

      <Card className="border-border/60 bg-card/60 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-2">
                 <Badge 
                    variant={checkin.active ? "default" : "secondary"} 
                    className={checkin.active ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20" : ""}
                 >
                    {checkin.active ? "Live Session" : "Ended"}
                 </Badge>
                 <span className="text-xs font-mono text-muted-foreground">
                    {new Date(checkin.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
            </div>
            <CardTitle className="text-2xl">Check-in Details</CardTitle>
            <CardDescription>ID: <span className="font-mono text-xs">{unwrappedParams.shareId}</span></CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-muted/30 p-6">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <MapPin size={14} />
                    <span>Status</span>
                </div>
                <p className="text-lg leading-relaxed font-medium">
                  &quot;{checkin.note}&quot;
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1 p-3 rounded-lg border border-border/40 bg-background/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lat</span>
                    <span className="font-mono text-sm tabular-nums">{checkin.lat.toFixed(6)}</span>
                 </div>
                 <div className="flex flex-col gap-1 p-3 rounded-lg border border-border/40 bg-background/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lng</span>
                    <span className="font-mono text-sm tabular-nums">{checkin.lng.toFixed(6)}</span>
                 </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground border-t border-border/40 pt-6">
                <Clock size={12} />
                <span>Sessions expire automatically after 6 hours</span>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}