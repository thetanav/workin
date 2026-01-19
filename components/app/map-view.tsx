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

  if (d < 1000) return `${Math.round(d)} m`;
  return `${(d / 1000).toFixed(1)} km`;
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
    <Card className="overflow-hidden border-border/60 bg-card/40 p-0">
      <div className="h-[520px] w-full">
        <Map center={[center.lng, center.lat]} zoom={13}>
          <MapControls />

          <MapMarker
            longitude={center.lng}
            latitude={center.lat}
            onClick={() => setOpen("__me")}
          >
            <MarkerContent />
          </MapMarker>
          {open === "__me" && (
            <MapPopup
              longitude={center.lng}
              latitude={center.lat}
              onClose={() => setOpen(null)}
            >
              <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                <p className="text-sm font-medium">You</p>
                <p className="text-xs text-muted-foreground">Current location</p>
              </div>
            </MapPopup>
          )}

          {checkins.map((c) => (
            <React.Fragment key={c.shareId}>
              <MapMarker
                longitude={c.lng}
                latitude={c.lat}
                onClick={() => setOpen(c.shareId)}
              >
                <MarkerContent />
              </MapMarker>
              {open === c.shareId && (
                <MapPopup
                  longitude={c.lng}
                  latitude={c.lat}
                  onClose={() => setOpen(null)}
                >
                  <div className="w-[260px] rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          Someone is here
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatApproxDistanceMeters(center, { lat: c.lat, lng: c.lng })} away
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        active
                      </Badge>
                    </div>

                    {c.note && (
                      <p className="mt-2 text-sm text-muted-foreground">{c.note}</p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        /c/{c.shareId}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => onCheckin?.(c.shareId)}
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                </MapPopup>
              )}
            </React.Fragment>
          ))}
        </Map>
      </div>
    </Card>
  );
}
