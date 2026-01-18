"use client";

import * as React from "react";

import { Shell } from "@/components/app/shell";
import Link from "next/link";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SpacesPage() {
  const [city, setCity] = React.useState("");
  const spaces = useQuery(
    api.spaces.byCity,
    city.trim().length ? { city: city.trim() } : "skip",
  );

  return (
    <Shell
      title="Spaces"
      subtitle="MVP: city search UI. Once Convex is running, we’ll query spaces by city."
    >
      <Card className="border-border/60 bg-card/40 p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium">Search by city</p>
            <Badge variant="secondary">MVP</Badge>
          </div>
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Berlin"
          />
          <div className="mt-2">
            {!spaces ? (
              <p className="text-sm text-muted-foreground">
                {city.trim().length ? "Loading..." : "Enter a city to search."}
              </p>
            ) : spaces.length === 0 ? (
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
                        <p className="text-sm text-muted-foreground">
                          {[s.city, s.country].filter(Boolean).join(", ")}
                        </p>
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
    </Shell>
  );
}
