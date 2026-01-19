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
          <MapMarker
            key={"123124"}
            longitude={center.lng}
            latitude={center.lat}
          >
            <MarkerContent>
              <div className="h-6 w-6 rounded-full border-[3px] border-white bg-blue-500 shadow-lg flex items-center justify-center" />
            </MarkerContent>

          </MapMarker>
        </Map>
      </div>
    </Card>
  );
}
