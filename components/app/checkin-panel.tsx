"use client";

import * as React from "react";
import Link from "next/link";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { useConvexConfigured } from "@/lib/convex";

type CreateResponse = { id: string; shareId: string };

type SpaceInput = {
  name: string;
  city?: string;
  country?: string;
  address?: string;
  lat: number;
  lng: number;
};

export function CheckinPanel({
  coords,
}: {
  coords: { lat: number; lng: number };
}) {
  const convexReady = useConvexConfigured();

  const create = useMutation(api.checkins.createAtCurrentLocation as any);
  const end = useMutation(api.checkins.endMyCheckin as any);

  const [place, setPlace] = React.useState("Current spot");
  const [city, setCity] = React.useState("");
  const [note, setNote] = React.useState("");

  const [shareId, setShareId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);

  const canUse = convexReady && typeof create === "function";

  async function onCreate() {
    if (!canUse) {
      toast.error("Convex is not configured yet.");
      return;
    }

    setCreating(true);
    try {
      const space: SpaceInput = {
        name: place.trim() || "Current spot",
        city: city.trim() || undefined,
        lat: coords.lat,
        lng: coords.lng,
      };

      const res = (await create({
        space,
        note: note.trim() || undefined,
      })) as CreateResponse;

      setShareId(res.shareId);
      toast.success("Checked in.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to check in");
    } finally {
      setCreating(false);
    }
  }

  async function onEnd() {
    if (!canUse) {
      toast.error("Convex is not configured yet.");
      return;
    }

    try {
      await end({});
      setShareId(null);
      toast("Check-in ended.");
    } catch {
      toast.error("Failed to end check-in");
    }
  }

  return (
    <Card className="border-border/60 bg-card/40 p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Check in</p>
            <p className="text-sm text-muted-foreground">
              Visible to nearby people + shareable link.
            </p>
          </div>
          <Badge variant={canUse ? "secondary" : "destructive"}>
            {!canUse ? "convex not set" : "ready"}
          </Badge>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">Place</label>
            <Input value={place} onChange={(e) => setPlace(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">City</label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">Note</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Heads down for an hour, join if you want"
            />
          </div>
        </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={onCreate} disabled={!canUse || creating || !!shareId}>

            {shareId ? "Checked in" : creating ? "Checking in..." : "Check in now"}
          </Button>
          <Button
            variant="secondary"
            onClick={onEnd}
            disabled={!canUse || !shareId}
          >
            End
          </Button>

          {shareId && (
            <Button variant="outline" asChild>
              <Link href={`/c/${shareId}`}>Open share page</Link>
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground font-mono">
          lat: {coords.lat.toFixed(5)} lng: {coords.lng.toFixed(5)}
        </p>
      </div>
    </Card>
  );
}
