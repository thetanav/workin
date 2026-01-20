"use client";

import * as React from "react";

import {
  Map,
  MapControls,
  MapMarker,
  MapPopup,
  MarkerContent,
} from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, ExternalLink, Clock } from "lucide-react";

export type MapCheckin = {
  id: string;
  lat: number;
  lng: number;
  note?: string;
  shareId: string;
  userImageUrl?: string;
  name?: string;
};

function formatApproxDistanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): string {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  const d = R * c;

  if (d < 1000) return `${Math.round(d)}m`;
  return `${(d / 1000).toFixed(1)}km`;
}

function initials(name?: string) {
  const n = (name ?? "").trim();
  if (!n) return "?";
  const parts = n.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (a + b).toUpperCase();
}

export function MapView({
  center,
  checkins,
  onCheckin,
  className,
}: {
  center: { lat: number; lng: number };
  checkins: MapCheckin[];
  onCheckin?: (shareId: string) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState<string | null>(null);

  return (
    <Card
      className={`overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm p-0 shadow-2xl ${className}`}
    >
      <div className="h-full w-full relative">
        <Map center={[center.lng, center.lat]} zoom={13} theme="light">
          <MapControls showLocate showFullscreen position="bottom-right" />

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
                  <Avatar className="absolute left-1/2 right-1/2 -translate-x-1/2 -top-12 h-10 w-10 border-2 border-white shadow-lg ring-1 ring-black/5">
                    <AvatarImage src={c.userImageUrl} alt={c.name} />
                    <AvatarFallback className="bg-primary text-[10px] text-primary-foreground font-bold">
                      {initials(c.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-10 left-9 bg-background px-3 p-1 rounded-md text-sm scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition origin-left">
                    {c.note}
                  </div>
                  <div className="h-4 w-4 rounded-full border-2 border-white bg-red-500" />
                </div>
              </MarkerContent>
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
                    <Card className="border-border/60 bg-card/80 backdrop-blur p-4 w-[280px]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold flex items-center gap-2">
                            <span className="inline-flex items-center gap-1">
                              <Users size={14} />
                              {c.name || "Builder"}
                            </span>
                            <Badge variant="secondary" className="text-[10px]">
                              {formatApproxDistanceMeters(center, c)} away
                            </Badge>
                          </p>
                          {c.note ? (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                              {c.note}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            onCheckin?.(c.shareId);
                          }}
                          className="w-full"
                        >
                          Open
                          <ExternalLink size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOpen(null)}
                          className="w-full"
                        >
                          Close
                        </Button>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
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
