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
import { ExternalLink, Clock, MapPinCheck, X, Handshake, ArrowUpLeftFromCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { SchemaDefinition } from "convex/server";


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
                    <AvatarImage src={c.userImageUrl} alt="user image" />
                    <AvatarFallback className="bg-primary text-[10px] text-primary-foreground font-bold">
                      UN
                    </AvatarFallback>
                  </Avatar>
                </div>
              </MarkerContent>
              <MarkerPopup className="p-4 w-64 sm:w-62 h-fit mb-6 z- rounded-2xl">
                <p className="text-sm sm:text-lg line-clamp-3 text-ellipsis font-bold">
                  {c.note}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  @ {c.placeName}
                </p>
                <div className="flex items-center gap-2 my-4">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={c.userImageUrl} alt={"user image"} />
                    <AvatarFallback className="bg-primary text-[10px] text-primary-foreground font-bold">
                      UN
                    </AvatarFallback>
                  </Avatar>
                  <p>{c.participants?.length ?? 0}</p>
                </div>
                <Button 
                  className="w-full" 
                  variant={"secondary"}
                  onClick={() => handleSendJoinRequest(c.id as Id<"checkins">, c.clerkId)}
                >
                  Request to join
                </Button>
                <div className="flex gap-1 mt-1">
                  <Button variant={"outline"} className="flex-1" asChild>
                    <Link className="flex gap-2 items-center" href={"/c/" + c.id}>
                      <ArrowUpLeftFromCircle />
                      Open
                    </Link>
                  </Button>
                  <Button
                    variant={"ghost"}
                    className="flex-1"
                    onClick={() => handleSayHi(c.clerkId)}
                  >
                    <Handshake />
                    Say hi
                  </Button>
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}
        </Map>
      </div>
    </Card>
  );
}
