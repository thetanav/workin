"use client";

import * as React from "react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

export type MapCheckin = {
  id: string;
  lat: number;
  lng: number;
  note?: string;
  shareId: string;
  userImageUrl?: string;
  placeName?: string;
  clerkId: string;
};

export function useMapCheckins(center: { lat: number; lng: number }) {
  const [radiusKm, setRadiusKm] = React.useState(4);

  const res = useQuery(api.checkins.activeNearby, {
    lat: center.lat,
    lng: center.lng,
    radiusKm,
  });

  const checkins = React.useMemo(() => {
    if (!res) return [] as MapCheckin[];
    return res.map((c) => ({
      id: String(c._id),
      lat: c.lat,
      lng: c.lng,
      note: c.note ?? undefined,
      shareId: c._id,
      userImageUrl: c.userImageUrl,
      placeName: c.placeName,
      clerkId: c.clerkId,
    }));
  }, [res]);

  return { checkins, radiusKm, setRadiusKm };
}
