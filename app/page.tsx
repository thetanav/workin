"use client";

import * as React from "react";

import { Shell } from "@/components/app/shell";
import { LocationGate } from "@/components/app/location";
import { MapView } from "@/components/app/map-view";
import { CheckinPanel } from "@/components/app/checkin-panel";
import { ConvexNotice } from "@/components/app/convex-notice";
import { useMapCheckins } from "@/components/app/use-map-checkins";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(
    null,
  );
  const { user } = useUser();

  const router = useRouter();
  const { checkins } = useMapCheckins(coords ?? { lat: 0, lng: 0 });

  return (
    <Shell
      title="Find a place to work, together"
      subtitle="Check in at your current spot. Nearby builders can join you, or you can share a link."
    >
      <ConvexNotice />
      {user?.fullName}
      {!coords ? (
        <LocationGate onReady={setCoords} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <MapView
            center={coords}
            checkins={checkins}
            onCheckin={(shareId) => router.push(`/c/${shareId}`)}
          />
          <div className="space-y-6">
            <CheckinPanel coords={coords} />
          </div>
        </div>
      )}
    </Shell>
  );
}
