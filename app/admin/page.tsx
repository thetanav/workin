"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MapView } from "@/components/app/map-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";

export default function AdminPage() {
  const checkins = useQuery(api.checkins.getAllActive);

  if (!checkins) {
    return <div>Loading...</div>;
  }

  const mapCheckins = checkins.map((c) => ({
    id: c._id,
    lat: c.lat,
    lng: c.lng,
    note: c.note,
    shareId: c._id, // or generate share id
    userImageUrl: c.userImageUrl,
    placeName: c.placeName,
    userName: "", // need to fetch user name
    clerkId: c.clerkId,
    startedAt: c.startedAt,
  }));

  // Calculate center, perhaps average or default
  const center = mapCheckins.length > 0
    ? {
        lat: mapCheckins.reduce((sum, c) => sum + c.lat, 0) / mapCheckins.length,
        lng: mapCheckins.reduce((sum, c) => sum + c.lng, 0) / mapCheckins.length,
      }
    : { lat: 37.7749, lng: -122.4194 }; // default SF

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Admin - All Active Check-ins
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Live check-ins
            </span>
            <Badge variant="secondary">{checkins.length} active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] w-full border rounded-xl overflow-hidden">
            <MapView
              center={center}
              checkins={mapCheckins}
              onCheckin={(id) => window.open(`/c/${id}`, "_blank")}
              className="border-0 shadow-none h-full w-full rounded-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
