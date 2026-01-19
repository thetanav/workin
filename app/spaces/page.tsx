"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MapPin, Search, Map as MapIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { MapView } from "@/components/app/map-view";
import { useMapCheckins } from "@/components/app/use-map-checkins";
import { cities } from "@/lib/cities";
import { cn } from "@/lib/utils";

export default function SpacesPage() {
  const [city, setCity] = React.useState("");
  const spaces = useQuery(
    api.checkins.byCity,
    city.trim().length ? { city: city.trim() } : "skip",
  );

  const [showMap, setShowMap] = React.useState(false);
  const [mapCenter, setMapCenter] = React.useState(cities[3]); // Default to Berlin
  const { checkins } = useMapCheckins(mapCenter);

  return (
    <div className="p-6">
      <div className="grid gap-6">
        <Card className="border-border/60 bg-card/40 p-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Search by city</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(true)}
                  className="gap-2"
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  Map View
                </Button>
                <Badge variant="secondary">MVP</Badge>
              </div>
            </div>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Berlin"
            />

            <div className="mt-2">
              {!spaces || spaces.length === 0 ? (
                <p className="text-sm text-muted-foreground">No spaces yet.</p>
              ) : (
                <div className="grid gap-2">
                  {spaces.map((s: any) => (
                    <Card
                      key={String(s._id)}
                      className="border-border/60 bg-background/40 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{[s.city, s.country].filter(Boolean).join(", ")}</span>
                          </div>
                        </div>
                        <Button asChild size="sm" variant="secondary">
                          <Link href={`/spaces/${String(s._id)}`}>Open</Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={showMap} onOpenChange={setShowMap}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-border/60 bg-background">
          <DialogHeader className="p-4 border-b border-border/60">
            <DialogTitle>Map Search</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-[200px_1fr] h-[600px]">
            <div className="border-r border-border/60 p-4 bg-muted/20 overflow-y-auto">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Popular Cities
              </p>
              <div className="space-y-1">
                {cities.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setMapCenter(c)}
                    className={cn(
                      "w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors",
                      mapCenter.name === c.name
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative h-full w-full">
              {/* Re-using MapView but ignoring onCheckin for now or implementing redirect */}
              <MapView
                center={mapCenter}
                checkins={checkins}
                onCheckin={(shareId) => window.location.href = `/c/${shareId}`}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
