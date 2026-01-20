"use client";

import * as React from "react";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { MapView } from "@/components/app/map-view";
import { useCurrentLocation } from "@/components/app/location";

type CheckinRow = {
  _id: string;
  note: string;
  lat: number;
  lng: number;
  startedAt: number;
  active: boolean;
  clerkId: string;
  name?: string;
  userImageUrl?: string;
};

export default function SpacesPage() {
  const { state: locationState, request: requestLocation } =
    useCurrentLocation();

  // Single default fallback (Berlin) while waiting for location
  const [center, setCenter] = React.useState<{
    name: string;
    lat: number;
    lng: number;
  }>({ name: "Berlin", lat: 52.52, lng: 13.405 });
  const [hasLocated, setHasLocated] = React.useState(false);

  // Auto-request location on mount once
  React.useEffect(() => {
    if (!hasLocated) {
      requestLocation();
      setHasLocated(true);
    }
  }, [hasLocated, requestLocation]);

  // Update center when location is ready
  React.useEffect(() => {
    if (locationState.status === "ready") {
      setCenter({
        name: "Nearby Me",
        lat: locationState.lat,
        lng: locationState.lng,
      });
    }
  }, [locationState]);

  const nearby = useQuery(api.checkins.activeNearby, {
    lat: center.lat,
    lng: center.lng,
  });

  const mapCheckins = React.useMemo(() => {
    const list = (nearby ?? []) as unknown as CheckinRow[];
    return list.map((c) => ({
      id: c._id,
      lat: c.lat,
      lng: c.lng,
      note: c.note,
      shareId: c._id,
      userImageUrl: c.userImageUrl,
      name: c.name,
    }));
  }, [nearby]);

  return (
    <div className="h-[calc(100vh-57px)] w-full relative">
      <MapView
        center={center}
        checkins={mapCheckins}
        onCheckin={(id) => (window.location.href = `/c/${id}`)}
        className="h-full w-full rounded-none border-0"
      />
    </div>
  );
}
