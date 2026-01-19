"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, ShieldCheck } from "lucide-react";

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
  title = "Enable Location Access",
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
    <Card className="relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md">
      <div className="absolute -right-12 -top-12 text-primary/5 opacity-20">
        <Navigation size={240} />
      </div>
      
      <div className="relative z-10 flex flex-col gap-6 p-8 sm:p-12 text-center items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/5">
          <MapPin size={32} />
        </div>
        
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">
            WorkIn uses your real-time location to show you nearby builders and let others find you. Your location is only shared when you check in.
          </p>
        </div>

        {state.status === "denied" && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive border border-destructive/20">
            <ShieldCheck size={16} />
            <p>{state.message}</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <Button 
            size="lg" 
            onClick={request} 
            disabled={state.status === "loading"}
            className="h-12 px-8 text-base shadow-xl shadow-primary/20"
          >
            {state.status === "loading" ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Finding you...
              </>
            ) : (
              "Enable Location Access"
            )}
          </Button>
          
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-green-500" />
              Privacy First
            </span>
            <span className="flex items-center gap-1.5">
              <Navigation size={12} className="text-blue-500" />
              Precise
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
