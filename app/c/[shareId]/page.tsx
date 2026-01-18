"use client";

import * as React from "react";
import Link from "next/link";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Shell } from "@/components/app/shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { localUserId } from "@/lib/id";
import { useConvexConfigured } from "@/lib/convex";

export default function SharePage({
  params,
}: {
  params: { shareId: string };
}) {
  const configured = useConvexConfigured();
  const userId = React.useMemo(() => localUserId(), []);

  const data = useQuery(api.checkins.getByShareId as any, {
    shareId: params.shareId,
  });
  const join = useMutation(api.joins.joinCheckin as any);

  const [message, setMessage] = React.useState("");

  async function onJoin(checkinId: string) {
    if (!configured) {
      toast.error("Convex is not configured yet.");
      return;
    }

    try {
      await join({
        checkinId,
        userId,
        message: message.trim() || undefined,
      });
      setMessage("");
      toast.success("Join request sent.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to join");
    }
  }

  return (
    <Shell title="Check-in" subtitle={`Share id: ${params.shareId}`}
      right={
        <Button asChild variant="secondary">
          <Link href="/">Back to map</Link>
        </Button>
      }
    >
      {!configured && (
        <Card className="border-border/60 bg-card/40 p-5">
          <p className="text-sm font-medium">Backend not configured</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Run `npx convex dev` locally and set `NEXT_PUBLIC_CONVEX_URL`.
          </p>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="border-border/60 bg-card/40 p-5">
          {!data ? (
            <p className="text-sm text-muted-foreground">
              {configured ? "Loading..." : "No data (Convex not running)."}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">
                    {data.space?.name ?? "Unknown place"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {data.space?.city ? `${data.space.city}` : ""}
                  </p>
                </div>
                <Badge variant="secondary">{data.checkin.active ? "active" : "ended"}</Badge>
              </div>

              {data.checkin.note && (
                <p className="text-sm text-muted-foreground">{data.checkin.note}</p>
              )}

              <div className="grid gap-2">
                <p className="text-xs text-muted-foreground">Joins</p>
                <p className="text-sm font-medium">{data.joinsCount}</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="border-border/60 bg-card/40 p-5">
          <p className="text-sm font-medium">Join</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Send a quick note so they know what to expect.
          </p>
          <div className="mt-4 grid gap-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. I’m nearby, joining in 10"
            />
            <Button
              onClick={() => data && onJoin(data.checkin._id)}
              disabled={!configured || !data || !data.checkin.active}
            >
              {data?.checkin.active ? "Send join" : "Check-in ended"}
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground font-mono">you: {userId}</p>
        </Card>
      </div>
    </Shell>
  );
}
