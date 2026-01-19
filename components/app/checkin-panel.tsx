"use client";

import * as React from "react";
import Link from "next/link";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, ArrowRight, XCircle } from "lucide-react";

type CreateResponse = { id: string };

export function CheckinPanel({
  coords,
}: {
  coords: { lat: number; lng: number };
}) {
  const { isLoaded, userId } = useAuth();

  const activeCheckin = useQuery(api.checkins.getMyActiveCheckin);
  const create = useMutation(api.checkins.createCheckin);
  const end = useMutation(api.checkins.endMyCheckin);

  const [note, setNote] = React.useState("");

  // Initialize with activeCheckin shareId if available
  const [shareId, setShareId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    if (activeCheckin) {
      setShareId(activeCheckin._id);
    } else {
      setShareId(null);
    }
  }, [activeCheckin]);

  const canUse = isLoaded && !!userId;

  async function onCreate() {
    if (!canUse) {
      toast.error("Please sign in to check in.");
      return;
    }

    setCreating(true);
    try {
      const res = (await create({
        lat: coords.lat,
        lng: coords.lng,
        note: note.trim() || "Working here",
      })) as CreateResponse;

      setShareId(res.id);
      toast.success("Checked in.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to check in";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

  async function onEnd() {
    if (!canUse) {
      toast.error("Please sign in.");
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
    <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="p-5">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold leading-none">Check in</h3>
              <p className="text-sm text-muted-foreground">
                Broadcast your location to nearby builders.
              </p>
            </div>
            {!canUse ? (
              <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/50 bg-yellow-500/5">
                Sign in
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                Ready
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
          </p>

          {!shareId ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="note" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  What are you working on?
                </Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Building web apps, learning React Native..."
                  disabled={!canUse}
                  className="min-h-[80px] bg-background/40 resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="group relative overflow-hidden rounded-xl border border-green-500/20 bg-green-500/5 p-4 transition-all hover:border-green-500/30">
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-green-500 flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    You are checked in!
                  </p>
                </div>
                {/* <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-tighter">
                  ID: {shareId}
                </Badge> */}
              </div>
              <div className="absolute -right-6 -top-6 text-green-500/10 transition-transform group-hover:scale-110">
                <MapPin size={80} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {!shareId ? (
              <Button
                onClick={onCreate}
                disabled={!canUse || creating}
                className="w-full shadow-lg shadow-primary/20"
              >
                {creating ? (
                  "Checking in..."
                ) : (
                  <>
                    Check in now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/c/${shareId}`}>
                    Share Page
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={onEnd}
                  disabled={!canUse}
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
