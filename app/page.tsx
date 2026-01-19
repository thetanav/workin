"use client";

import * as React from "react";

import { Shell } from "@/components/app/shell";
import { LocationGate } from "@/components/app/location";
import { MapView } from "@/components/app/map-view";
import { CheckinPanel } from "@/components/app/checkin-panel";
import { useMapCheckins } from "@/components/app/use-map-checkins";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import AuthComp from "@/components/app/auth-comp";

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
      {!coords ? (
        <div className="max-w-2xl mx-auto mt-8">
          <LocationGate onReady={setCoords} />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
          <MapView
            center={coords}
            checkins={checkins}
            onCheckin={(shareId) => router.push(`/c/${shareId}`)}
          />
          <div className="sticky top-6">
            <CheckinPanel coords={coords} />
          </div>
        </div>
      )}
    </Shell>
  );
}
