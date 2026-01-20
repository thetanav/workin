"use client";

import * as React from "react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { bboxAround } from "@/lib/geo";

export type MapCheckin = {
  id: string;
  lat: number;
  lng: number;
  note?: string;
  shareId: string;
};

export function useMapCheckins(center: { lat: number; lng: number }) {
  const [radiusKm, setRadiusKm] = React.useState(4);

  // `activeNearby` currently takes `{ lat, lng }`.
  // We still keep `radiusKm` here so the UI can evolve without changing callers.
  React.useMemo(() => bboxAround(center, radiusKm), [center, radiusKm]);

  const res = useQuery(api.checkins.activeNearby, { lat: center.lat, lng: center.lng });

  const checkins = React.useMemo(() => {
    if (!res) return [] as MapCheckin[];
    return res.map((c) => ({
      id: String(c._id),
      lat: c.lat,
      lng: c.lng,
      note: c.note ?? undefined,
      shareId: c._id,
    }));
  }, [res]);

  return { checkins, radiusKm, setRadiusKm };
}
