"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, MapPin } from "lucide-react";

export type LocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "denied"; message: string }
  | { status: "ready"; lat: number; lng: number; accuracy?: number };

export function useCurrentLocation() {
  const [state, setState] = React.useState<LocationState>({ status: "idle" });

  const request = React.useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        status: "denied",
        message: "Geolocation is not supported in this browser.",
      });
      return;
    }

    setState({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: "ready",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Please enable it in your browser settings to continue."
            : err.message || "Failed to get location.";

        setState({ status: "denied", message: msg });
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  return { state, request };
}

export function LocationGate({
  title = "Location Required",
  onReady,
  onError,
}: {
  title?: string;
  onReady: (coords: { lat: number; lng: number }) => void;
  onError?: (message: string) => void;
}) {
  const { state, request } = useCurrentLocation();

  React.useEffect(() => {
    if (state.status === "ready") {
      onReady({ lat: state.lat, lng: state.lng });
    } else if (state.status === "denied") {
      onError?.(state.message);
    }
  }, [state, onReady, onError]);

  return (
    <Card className="flex flex-col items-center justify-center p-12 border bg-background text-center max-w-sm mx-auto shadow-none">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <MapPin className="h-6 w-6 text-muted-foreground" />
      </div>

      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We need your location to show you nearby activity.
      </p>

      <Button 
        onClick={request} 
        disabled={state.status === "loading"}
        className="mt-8 w-full"
      >
        {state.status === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Locating...
          </>
        ) : (
          "Enable Access"
        )}
      </Button>
    </Card>
  );
}
