"use client";

import * as React from "react";
import Link from "next/link";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Shell } from "@/components/app/shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Search, ExternalLink, User } from "lucide-react";

function initials(name?: string) {
  const n = (name ?? "").trim();
  if (!n) return "?";
  const parts = n.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

type CheckinRow = {
  _id: string;
  note: string;
  lat: number;
  lng: number;
  startedAt: number;
  active: boolean;
  clerkId: string;
  name?: string;
};

export default function SpacesPage() {
  const [search, setSearch] = React.useState("");

  const me = useQuery(api.users.current);
  const myActive = useQuery(api.checkins.getMyActiveCheckin);

  // "Spaces" is basically a directory of active check-ins.
  // We can't query *all* active checkins without a function, so we scope it to a city center.
  const centers = [
    { name: "Berlin", lat: 52.52, lng: 13.405 },
    { name: "London", lat: 51.5074, lng: -0.1278 },
    { name: "New York", lat: 40.7128, lng: -74.006 },
    { name: "SF", lat: 37.7749, lng: -122.4194 },
  ] as const;

  const [center, setCenter] = React.useState<(typeof centers)[number]>(centers[0]);

  const nearby = useQuery(api.checkins.activeNearby, { lat: center.lat, lng: center.lng });

  const rows = React.useMemo(() => {
    const list = (nearby ?? []) as unknown as CheckinRow[];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const note = (c.note ?? "").toLowerCase();
      const name = (c.name ?? "").toLowerCase();
      return note.includes(q) || name.includes(q) || String(c._id).toLowerCase().includes(q);
    });
  }, [nearby, search]);

  return (
    <Shell
      title="Spaces"
      subtitle="Active check-ins near a city center"
      right={
        myActive ? (
          <Button asChild variant="secondary">
            <Link href={`/c/${myActive._id}`}>My Share Page</Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/">Open map</Link>
          </Button>
        )
      }
    >
      <div className="grid gap-6 p-6">
        <Card className="border-border/60 bg-card/40 p-5 backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Find people to work with</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  live
                </Badge>
                {me ? (
                  <Badge variant="outline" className="gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {me.name}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[240px_1fr]">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  City Center
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {centers.map((c) => (
                    <Button
                      key={c.name}
                      type="button"
                      size="sm"
                      variant={c.name === center.name ? "secondary" : "outline"}
                      onClick={() => setCenter(c)}
                      className="justify-start"
                    >
                      <MapPin className="mr-2 h-3.5 w-3.5" />
                      {c.name}
                    </Button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  This uses `checkins.activeNearby` (scoped query) instead of a global directory.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Search
                </p>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search note, name, or id..."
                  className="bg-background/40"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-3">
          {!nearby ? (
            <Card className="border-border/60 bg-card/40 p-8 backdrop-blur-sm">
              <div className="flex items-center justify-center py-10">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            </Card>
          ) : rows.length === 0 ? (
            <Card className="border-border/60 bg-card/40 p-8 backdrop-blur-sm">
              <div className="text-center py-10">
                <p className="display-font text-lg font-semibold tracking-tight">No one nearby</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try another city center, or create a check-in from the map.
                </p>
                <Button asChild className="mt-5">
                  <Link href="/">Create a check-in</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {rows.map((c) => (
                <Card key={String(c._id)} className="border-border/60 bg-card/40 p-5 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 border border-border/50">
                        <AvatarImage src={undefined} />
                        <AvatarFallback>{initials(c.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="display-font text-base font-semibold tracking-tight truncate">
                          {c.name ?? "Builder"}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{String(c._id)}</p>
                      </div>
                    </div>
                    <Badge variant={c.active ? "secondary" : "outline"} className="shrink-0">
                      {c.active ? "live" : "ended"}
                    </Badge>
                  </div>

                  <div className="mt-4 rounded-lg border border-border/40 bg-background/30 p-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">{c.note}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {c.lat.toFixed(3)}, {c.lng.toFixed(3)}
                    </p>
                    <Button asChild size="sm" variant="secondary" className="gap-2">
                      <Link href={`/c/${String(c._id)}`}>
                        Open
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
