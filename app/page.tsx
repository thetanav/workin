"use client";

import * as React from "react";

import { LocationGate } from "@/components/app/location";
import { CheckinPanel } from "@/components/app/checkin-panel";
import { MapView } from "@/components/app/map-view";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, MapPin } from "lucide-react";

export default function Home() {
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const { user } = useUser();

  const router = useRouter();

  return (
    <>
      {!coords ? (
        <div>
          <LocationGate onReady={setCoords} onError={setLocationError} />
        </div>
      ) : (
        <div className="w-full flex gap-2 items-center justify-center mt-8">
          <MapView center={coords} checkins={[]} />
          <CheckinPanel coords={coords} />
        </div>
      )}

      <Dialog open={!!locationError} onOpenChange={() => setLocationError(null)}>
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
                <p className="text-sm text-muted-foreground">
                  {locationError}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please enable location access in your browser settings to use WorkIn.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLocationError(null)}>
                Dismiss
              </Button>
              <Button onClick={() => {
                setLocationError(null);
                window.location.reload();
              }}>
                Try Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}