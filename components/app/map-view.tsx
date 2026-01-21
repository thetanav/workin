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
import { ExternalLink, Clock, MapPinCheck, X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import Link from "next/link";

export type MapCheckin = {
  id: string;
  lat: number;
  lng: number;
  note?: string;
  shareId: string;
  userImageUrl?: string;
  placeName?: string;
  userName?: string;
  clerkId: string;
};

export function MapView({
  center,
  checkins,
  onCheckin,
  className,
  selectedId: controlledSelectedId,
  onSelectId: controlledOnSelectId,
}: {
  center: { lat: number; lng: number };
  checkins: MapCheckin[];
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
            className="z-50"
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
                  <Avatar className="h-10 w-10 ring-2 ring-red-500">
                    <AvatarImage src={c.userImageUrl} alt="user image" />
                    <AvatarFallback className="bg-primary text-[10px] text-primary-foreground font-bold">
                      UN
                    </AvatarFallback>
                  </Avatar>
                </div>
              </MarkerContent>
              <MarkerPopup className="p-4 w-64 sm:w-62 h-fit mb-6 z-50">
                <p className="text-sm sm:text-lg line-clamp-3 text-ellipsis">
                  {c.note}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={c.userImageUrl} alt={"user image"} />
                    <AvatarFallback className="bg-primary text-[10px] text-primary-foreground font-bold">
                      UN
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-muted-foreground truncate">
                    {c.placeName}
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link className="flex-1" href={"/c/" + c.id}>
                    <Button variant={"outline"} className="w-full h-9 text-sm">
                      Open
                    </Button>
                  </Link>
                  <Button
                    variant={"ghost"}
                    className="flex-1 h-9 text-sm"
                    onClick={() => handleSayHi(c.clerkId)}
                  >
                    Say hi
                  </Button>
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}

          {/* Popup */}
          {open
            ? (() => {
                const c = checkins.find((x) => x.id === open);
                if (!c) return null;

                return (
                  <MapPopup
                    longitude={c.lng}
                    latitude={c.lat}
                    onClose={() => setOpen(null)}
                  >
                    <Card className="border-border/60 bg-card/95 backdrop-blur p-4 w-[280px] sm:w-[320px] max-w-[90vw]">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1">
                              <MapPinCheck size={14} />
                              <span className="truncate">{c.placeName}</span>
                            </span>
                          </p>
                          {c.note ? (
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                              {c.note}
                            </p>
                          ) : null}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setOpen(null)}
                          className="h-8 w-8 p-0 shrink-0"
                        >
                          <X size={16} />
                        </Button>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            onCheckin?.(c.shareId);
                          }}
                          className="w-full h-9 text-sm"
                        >
                          Open
                          <ExternalLink size={14} className="ml-1" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOpen(null)}
                          className="w-full h-9 text-sm"
                        >
                          Close
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSayHi(c.clerkId)}
                          className="w-full h-9 text-sm"
                        >
                          👋 Hi
                        </Button>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-3">
                        <span className="font-mono">
                          {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          live
                        </span>
                      </div>
                    </Card>
                  </MapPopup>
                );
              })()
            : null}
        </Map>
      </div>
    </Card>
  );
}
