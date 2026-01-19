"use client";

import * as React from "react";
import Link from "next/link";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";

import { Shell } from "@/components/app/shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

import { useConvexConfigured } from "@/lib/convex";

export default function SharePage({
  params,
}: {
  params: { shareId: string };
}) {
  const configured = useConvexConfigured();
  const { userId } = useAuth();

  const data = useQuery(api.checkins.getByShareId, {
    shareId: params.shareId,
  });
  const join = useMutation(api.joins.joinCheckin);

  const [message, setMessage] = React.useState("");

  async function onJoin(checkinId: Id<"checkins">) {
    if (!configured) {
      toast.error("Convex is not configured yet.");
      return;
    }
    if (!userId) {
      toast.error("Please sign in to join.");
      return;
    }

    try {
      await join({
        checkinId,
        message: message.trim() || undefined,
      });
      setMessage("");
      toast.success("Join request sent.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to join";
      toast.error(msg);
    }
  }

  const hostName = data?.profile?.name || "Anonymous";
  const hostHandle = data?.profile?.handle;
  const hostBio = data?.profile?.bio;
  const hostAvatar = data?.profile?.avatarUrl;

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
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-medium">
                    {data.space?.name ?? "Unknown place"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {[data.space?.city, data.space?.country].filter(Boolean).join(", ")}
                  </p>
                </div>
                <Badge variant={data.checkin.active ? "default" : "secondary"}>
                  {data.checkin.active ? "active" : "ended"}
                </Badge>
              </div>

              {/* Host Profile */}
              <div className="flex items-start gap-4 rounded-lg border border-border/60 bg-background/40 p-4">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={hostAvatar} />
                    <AvatarFallback>{hostName[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium">{hostName}</p>
                    {hostHandle && <p className="text-xs text-muted-foreground">@{hostHandle}</p>}
                    {hostBio && <p className="mt-1 text-sm text-muted-foreground">{hostBio}</p>}
                </div>
              </div>


              {data.checkin.note && (
                <div className="rounded-lg bg-muted/20 p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Note</p>
                    <p className="text-sm text-foreground">{data.checkin.note}</p>
                </div>
              )}

              <div className="grid gap-2">
                <p className="text-xs text-muted-foreground">People joined</p>
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
          
          {userId ? (
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
          ) : (
             <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">Sign in to join this session.</p>
                {/* AuthComp handles the actual button logic usually, but here we might need a direct link or just tell them to use the header */}
             </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
