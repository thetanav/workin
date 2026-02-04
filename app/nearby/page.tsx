"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MapView } from "@/components/app/map-view";
import { useCurrentLocation } from "@/components/app/location";
import { CheckinPanel } from "@/components/app/checkin-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@clerk/nextjs";
import { Navigation, MapPin, Loader2, AlertCircle } from "lucide-react";

export default function Page() {
  const { state: locationState, request: requestLocation } =
    useCurrentLocation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState("10");
  const { userId } = useAuth();

  const coords = locationState.status === "ready" 
    ? { lat: locationState.lat, lng: locationState.lng }
    : null;

  const radiusValue = Number.parseFloat(radiusKm);

  const nearby = useQuery(
    api.checkins.activeNearby,
    coords
      ? { lat: coords.lat, lng: coords.lng, radiusKm: Number.isFinite(radiusValue) ? radiusValue : 10 }
      : "skip",
  );

  const mapCheckins = useMemo(() => {
    const list = nearby ?? [];
    return list.map((c) => ({
      id: c._id,
      lat: c.lat,
      lng: c.lng,
      note: c.note,
      shareId: c._id,
      userImageUrl: c.userImageUrl,
      placeName: c.placeName,
      clerkId: c.clerkId,
      startedAt: c.startedAt,
      status: c.status,
      visibility: c.visibility,
    }));
  }, [nearby]);

  // -- 1. Location Request View --
  if (!coords) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm border-none shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-7 w-7 text-primary" />
            </div>

            <h2 className="text-xl font-bold tracking-tight">
              Location Required
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              To see who is working nearby, we need access to your current
              location.
            </p>

            {locationState.status === "denied" && (
              <div className="mt-6 flex w-full items-start gap-3 rounded-md bg-destructive/10 p-3 text-left">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">Access Denied</p>
                  <p className="text-muted-foreground">
                    {locationState.message}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 w-full space-y-3">
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={requestLocation}
                disabled={locationState.status === "loading"}
              >
                {locationState.status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Locating...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4" />
                    Enable Location
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full relative">
      <div className="flex-1 relative h-full">
        <MapView
          center={coords}
          checkins={mapCheckins}
          onCheckin={(id) => (window.location.href = `/c/${id}`)}
          className="h-full w-full rounded-none border-0"
          selectedId={selectedId}
          onSelectId={setSelectedId}
        />
      </div>
      <div className="absolute top-2 left-2 z-10 w-full max-w-[200px]">
        <Card className="border-border/60 bg-background/90 backdrop-blur">
          <CardContent className="p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Search Radius
            </p>
            <Select value={radiusKm} onValueChange={setRadiusKm}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 km</SelectItem>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
              </SelectContent>
            </Select>
            {!userId && (
              <p className="text-[10px] text-muted-foreground">
                Sign in to wave or join.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="absolute bottom-2 left-2 z-10 w-full max-w-sm">
        <CheckinPanel coords={coords} />
      </div>
    </div>
  );
}
