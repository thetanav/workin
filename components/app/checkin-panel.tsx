"use client";

import * as React from "react";
import Link from "next/link";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, ArrowRight, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CreateResponse = { id: string };

export function CheckinPanel({
  coords,
}: {
  coords: { lat: number; lng: number };
}) {
  const { isLoaded, userId } = useAuth();

  const activeCheckin = useQuery(api.checkins.getMyActiveCheckin);
  const create = useAction(api.checkins.createCheckin);
  const end = useMutation(api.checkins.stop);

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
      toast.success("Checked in successfully!");
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
      await end();
      setShareId(null);
      toast.info("Session ended.");
    } catch {
      toast.error("Failed to end check-in");
    }
  }

  return (
    <Card className="overflow-hidden border bg-background shadow-sm">
      <div className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold leading-none tracking-tight">Status</h3>
              <p className="text-xs text-muted-foreground font-mono">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </p>
            </div>
            {!canUse ? (
              <Badge variant="outline" className="text-muted-foreground">
                Sign in required
              </Badge>
            ) : (
              <div className={cn("flex items-center gap-2 text-xs font-medium", shareId ? "text-green-600" : "text-muted-foreground")}>
                <div className={cn("h-2 w-2 rounded-full", shareId ? "bg-green-600" : "bg-muted-foreground")} />
                {shareId ? "Live" : "Ready"}
              </div>
            )}
          </div>

          {!shareId ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Activity
                </Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What are you building?"
                  disabled={!canUse}
                  className="min-h-[100px] resize-none"
                />
              </div>
              
              <Button
                onClick={onCreate}
                disabled={!canUse || creating}
                className="w-full"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking in...
                  </>
                ) : (
                  <>
                    Check In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Checked in</p>
                    <p className="text-xs text-muted-foreground">Visible on map</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/c/${shareId}`}>
                    Share
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={onEnd}
                  disabled={!canUse}
                  className="w-full text-destructive hover:text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  End
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
