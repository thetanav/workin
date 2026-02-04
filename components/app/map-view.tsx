"use client";

import * as React from "react";

import {
  Map,
  MapControls,
  MapMarker,
  MapPopup,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Handshake, ArrowUpLeftFromCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

function timeHere(startedAt?: number) {
  if (!startedAt) return null;
  const seconds = Math.floor((Date.now() - startedAt) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}


export function MapView({
  center,
  checkins,
  onCheckin,
  className,
  selectedId: controlledSelectedId,
  onSelectId: controlledOnSelectId,
}: {
  center: { lat: number; lng: number };
  checkins: Array<{
    id: string;
    lat: number;
    lng: number;
    note: string;
    shareId: string;
    userImageUrl: string;
    placeName: string;
    clerkId: string;
    participants?: string[];
    startedAt?: number;
    status?: string;
    visibility?: string;
  }>;
  onCheckin?: (shareId: string) => void;
  className?: string;
  selectedId?: string | null;
  onSelectId?: (id: string | null) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState<string | null>(null);

  const isControlled = controlledSelectedId !== undefined;
  const open = isControlled ? controlledSelectedId : internalOpen;
  const setOpen = React.useCallback(
    (id: string | null) => {
      if (controlledOnSelectId) {
        controlledOnSelectId(id);
      }
      if (!isControlled) {
        setInternalOpen(id);
      }
    },
    [controlledOnSelectId, isControlled],
  );

  const { userId } = useAuth();
  const sayHello = useMutation(api.users.sayHello);
  const sendJoinRequest = useMutation(api.notifications.sendJoinRequest);
  const { resolvedTheme } = useTheme();

  const handleSayHi = async (clerkId: string) => {
    if (!userId) {
      toast.error("Please sign in to say hi!");
      return;
    }
    if (clerkId === userId) {
      toast.error("You can't say hi to yourself!");
      return;
    }
    try {
      await sayHello({ clerkId });
      toast.success("Said hi! 👋");
    } catch {
      toast.error("Failed to say hi");
    }
  };

  const handleSendJoinRequest = async (checkinId: Id<"checkins">, clerkId: string) => {
    if (!userId) {
      toast.error("Please sign in to send join request!");
      return;
    }
    if (clerkId === userId) {
      toast.error("You can't join your own check-in!");
      return;
    }
    try {
      await sendJoinRequest({ checkinId });
      toast.success("Join request sent!");
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send join request";
      toast.error(errorMessage);
    }
  };

  return (
    <Card
      className={`overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm p-0 shadow-2xl ${className}`}
    >
      <div className="h-full w-full relative">
        <Map
          center={[center.lng, center.lat]}
          zoom={13}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
        >
          <MapControls showLocate position="bottom-right" />

          {/* User Marker */}
          <MapMarker
            longitude={center.lng}
            latitude={center.lat}
            className="z-40"
          >
            <MarkerContent>
              <div className="h-6 w-6 rounded-full border-[3px] border-white bg-blue-500 shadow-lg flex items-center justify-center" />
            </MarkerContent>
          </MapMarker>

          {/* Check-in markers */}
          {checkins.map((c) => (
            <MapMarker
              key={c.id}
              longitude={c.lng}
              latitude={c.lat}
              onClick={() => {
                setOpen(c.id);
              }}
              className="z-40"
            >
              <MarkerContent>
                <div className="group relative transition-transform">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage
                      src={c.userImageUrl}
                      alt="user image"
                      className={!userId ? "blur-[3px]" : undefined}
                    />
                    <AvatarFallback className="bg-primary text-[10px] text-primary-foreground font-bold">
                      UN
                    </AvatarFallback>
                  </Avatar>
                </div>
              </MarkerContent>
              <MarkerPopup className="p-4 w-64 sm:w-62 h-fit my-6 z- rounded-2xl">
                <p className="text-sm sm:text-lg line-clamp-3 text-ellipsis font-bold">
                  {c.note}
                </p>
                {c.status && (
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                    {c.status}
                  </p>
                )}
                <p className="text-sm text-muted-foreground truncate">
                  @ {c.placeName}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={c.userImageUrl}
                      alt={"user image"}
                      className={!userId ? "blur-[3px]" : undefined}
                    />
                    <AvatarFallback className="bg-primary text-[10px] text-primary-foreground font-bold">
                      UN
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    {c.participants && c.participants.length > 0 ? (
                      <p className="text-muted-foreground text-sm">
                        and {c.participants.length} more
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-sm">Solo session</p>
                    )}
                    {timeHere(c.startedAt) && (
                      <p className="text-xs text-muted-foreground">
                        {timeHere(c.startedAt)} here
                      </p>
                    )}
                  </div>
                </div>
                {userId ? (
                  userId != c.clerkId && (
                    <div>
                      <Button
                        className="w-full"
                        variant={"secondary"}
                        onClick={() => handleSendJoinRequest(c.id as Id<"checkins">, c.clerkId)}
                      >
                        Request to join
                      </Button>
                      <div className="flex gap-1 mt-1">
                        {onCheckin ? (
                          <Button
                            variant={"outline"}
                            className="flex-1 gap-2"
                            onClick={() => onCheckin(c.id)}
                          >
                            <ArrowUpLeftFromCircle className="h-4 w-4" />
                            Open
                          </Button>
                        ) : (
                          <Button variant={"outline"} className="flex-1" asChild>
                            <Link className="flex gap-2 items-center" href={"/c/" + c.id}>
                              <ArrowUpLeftFromCircle className="h-4 w-4" />
                              Open
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant={"ghost"}
                          className="flex-1 gap-2"
                          onClick={() => handleSayHi(c.clerkId)}
                        >
                          <Handshake className="h-4 w-4" />
                          Wave
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Sign in to wave or request to join.
                  </p>
                )}
              </MarkerPopup>
            </MapMarker>
          ))}
        </Map>
      </div>
    </Card>
  );
}
