"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
            ? "Location permission denied. Enable it to check in."
            : err.message || "Failed to get location.";

        setState({ status: "denied", message: msg });
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  return { state, request };
}

export function LocationGate({
  title = "Use your current location",
  onReady,
}: {
  title?: string;
  onReady: (coords: { lat: number; lng: number }) => void;
}) {
  const { state, request } = useCurrentLocation();

  React.useEffect(() => {
    if (state.status === "ready") {
      onReady({ lat: state.lat, lng: state.lng });
    }
  }, [state, onReady]);

  return (
    <Card className="border-border/60 bg-card/50 p-5">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">
            WorkIn only lets you check in where you actually are.
          </p>
        </div>

        {state.status === "denied" && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={request} disabled={state.status === "loading"}>
            {state.status === "loading" ? "Getting location..." : "Enable location"}
          </Button>
          {state.status === "ready" && (
            <p className="text-xs text-muted-foreground font-mono">
              lat {state.lat.toFixed(5)} lng {state.lng.toFixed(5)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
