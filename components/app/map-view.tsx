"use client";

import * as React from "react";

import {
  Map,
  MapControls,
  MapMarker,
  MapPopup,
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
    <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm p-0 shadow-2xl">
      <div className="h-[600px] w-full relative">
        <Map center={[center.lng, center.lat]} zoom={13}>
          <MapControls showLocate showFullscreen position="bottom-right" />

          {/* User Marker */}
          <MapMarker
            longitude={center.lng}
            latitude={center.lat}
            onClick={() => setOpen("__me")}
          >
            <div className="relative group cursor-pointer">
              {/* Pulsing ring */}
              <div className="absolute -inset-4 bg-blue-500/30 rounded-full animate-ping opacity-75" />
              {/* Glow */}
              <div className="absolute -inset-1 bg-blue-500/50 rounded-full blur-sm" />
              {/* Core dot */}
              <div className="relative h-6 w-6 rounded-full border-[3px] border-white bg-blue-500 shadow-lg flex items-center justify-center">
                 {/* Optional: directional arrow or just pure dot */}
              </div>
            </div>
          </MapMarker>
          
          {open === "__me" && (
            <MapPopup
              longitude={center.lng}
              latitude={center.lat}
              onClose={() => setOpen(null)}
              className="z-50 min-w-[180px]"
            >
              <div className="space-y-1 text-center">
                <p className="text-sm font-bold tracking-tight">You</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Current Location</p>
              </div>
            </MapPopup>
          )}

          {/* Check-in Markers */}
          {checkins.map((c) => (
            <React.Fragment key={c.shareId}>
              <MapMarker
                longitude={c.lng}
                latitude={c.lat}
                onClick={() => setOpen(c.shareId)}
              >
                <div className="relative group cursor-pointer">
                  <div className="absolute -inset-2 bg-green-500/20 rounded-full blur-md group-hover:bg-green-500/30 transition-all" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-green-500 text-white shadow-xl transition-transform hover:scale-110 active:scale-95">
                    <Users size={20} />
                  </div>
                </div>
              </MapMarker>
              
              {open === c.shareId && (
                <MapPopup
                  longitude={c.lng}
                  latitude={c.lat}
                  onClose={() => setOpen(null)}
                  className="z-50 w-[280px] p-0 overflow-hidden border-none shadow-2xl"
                >
                  <div className="bg-card">
                    <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest">Active Now</span>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase tracking-tighter">
                        {formatApproxDistanceMeters(center, { lat: c.lat, lng: c.lng })} away
                      </span>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <MapPin size={14} className="text-muted-foreground" />
                          Someone is here
                        </h4>
                        {c.note && (
                          <div className="mt-2 relative">
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/20 rounded-full" />
                            <p className="pl-3 text-sm text-muted-foreground italic leading-relaxed">
                              "{c.note}"
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                          <Clock size={12} />
                          /c/{c.shareId}
                        </div>
                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs"
                          onClick={() => onCheckin?.(c.shareId)}
                        >
                          View Details
                          <ExternalLink size={12} className="ml-1.5" />
                        </Button>
                      </div>
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
