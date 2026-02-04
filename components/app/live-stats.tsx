"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function LiveStats() {
  const stats = useQuery(api.checkins.activeStats);
  if (!stats) {
    return (
      <p className="text-xs text-muted-foreground">
        Checking live activity...
      </p>
    );
  }

  return (
    <p className="text-xs text-muted-foreground">
      {stats.activeCount} live sessions · {stats.uniqueBuilders} builders online
    </p>
  );
}
