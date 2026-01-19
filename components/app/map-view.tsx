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
import { MapPin, User, Users, ExternalLink, Clock } from "lucide-react";

export type MapCheckin = {
  id: string;
  lat: number;
  lng: number;
  note?: string;
  shareId: string;
};

function formatApproxDistanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): string {
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

export function MapView({
  center,
  checkins,
  onCheckin,
}: {
  center: { lat: number; lng: number };
  checkins: MapCheckin[];
  onCheckin?: (shareId: string) => void;
}) {
  const [open, setOpen] = React.useState<string | null>(null);

  return (
    <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm p-0 shadow-2xl flex-1">
      <div className="h-[600px] w-full relative">
        <Map center={[center.lng, center.lat]} zoom={13}>
          <MapControls showLocate showFullscreen position="bottom-right" />

          {/* User Marker */}
          <MapMarker longitude={center.lng} latitude={center.lat}>
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
            >
              <MarkerContent>
                <div className="relative">
                  <div className="h-5 w-5 rounded-full border-2 border-white bg-emerald-500 shadow-lg" />
                  <div className="absolute -inset-2 rounded-full bg-emerald-500/20 blur-sm" />
                </div>
              </MarkerContent>
            </MapMarker>
          ))}

          {/* Popup */}
          {open ? (
            (() => {
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
                            Builder
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
          ) : null}
        </Map>
      </div>
    </Card>
  );
}
