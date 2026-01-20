"use client";

import * as React from "react";

import { LocationGate } from "@/components/app/location";
import { CheckinPanel } from "@/components/app/checkin-panel";
import { MapView } from "@/components/app/map-view";
import { useMapCheckins } from "@/components/app/use-map-checkins";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, MapPin } from "lucide-react";

function MapWithCheckins({ center }: { center: { lat: number; lng: number } }) {
  const { checkins } = useMapCheckins(center);

  return (
    <MapView
      center={center}
      checkins={checkins}
      onCheckin={(shareId) => {
        window.location.href = `/c/${shareId}`;
      }}
      className="h-[50rem] w-full rounded-none border-0"
    />
  );
}

export default function Home() {
  const [coords, setCoords] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = React.useState<string | null>(null);

  return (
    <>
      {!coords ? (
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <LocationGate onReady={setCoords} onError={setLocationError} />
        </div>
      ) : (
        <div className="relative h-full w-full overflow-hidden">
          <div className="">
            <MapWithCheckins center={coords} />
          </div>
          <div className="absolute bottom-4 right-4 z-10 w-full max-w-sm px-4 md:px-0 md:bottom-8 md:right-8">
            <CheckinPanel coords={coords} />
          </div>
        </div>
      )}

      <Dialog
        open={!!locationError}
        onOpenChange={() => setLocationError(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-destructive" />
              Location Access Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{locationError}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please enable location access in your browser settings to use
                  WorkIn.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLocationError(null)}>
                Dismiss
              </Button>
              <Button
                onClick={() => {
                  setLocationError(null);
                  window.location.reload();
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
