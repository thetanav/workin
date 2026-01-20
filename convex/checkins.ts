import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const CHECKIN_TTL_MS = 6 * 60 * 60 * 1000; // 6hr

function getBoundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

export const activeNearby = query({
  args: {
    lng: v.number(),
    lat: v.number(),
  },
  handler: async (ctx: QueryCtx, args) => {
    // default checks to 10km radius
    const box = getBoundingBox(args.lat, args.lng, 10);

    return await ctx.db
      .query("checkins")
      .filter((q) =>
        q.and(
          q.gte(q.field("lat"), box.minLat),
          q.lte(q.field("lat"), box.maxLat),
          q.gte(q.field("lng"), box.minLng),
          q.lte(q.field("lng"), box.maxLng),
          q.eq(q.field("active"), true),
        ),
      )
      .order("desc")
      .take(10);
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    // _id is an Id<"checkins">, but we accept string so we can use it in URLs easily.
    // Use the safe getter instead of filtering on _id.
    const checkin = await ctx.db.get(args.id as Id<"checkins">);

    if (!checkin) return { checkin: null };

    // Defensive check: this endpoint is for checkins only.
    if (!("startedAt" in checkin)) return { checkin: null };

    if (Date.now() - checkin.startedAt >= CHECKIN_TTL_MS) {
      return { checkin: null };
    }

    return { checkin };
  },
});

export const getMyActiveCheckin = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const clerkId = identity.subject;
    const checkin = await ctx.db
      .query("checkins")
      .withIndex("by_clerk_active", (q) =>
        q.eq("clerkId", clerkId).eq("active", true),
      )
      .unique();

    if (checkin && Date.now() - checkin.startedAt >= CHECKIN_TTL_MS) {
      return null;
    }
    return checkin;
  },
});

// TODO: get the location name
export const createCheckin = mutation({
  args: {
    note: v.string(),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx: MutationCtx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const clerkId = identity.subject;

    const now = Date.now();
    // a person can only has one active checkin at a time
    const existing = await ctx.db
      .query("checkins")
      .withIndex("by_clerk_active", (q) =>
        q.eq("clerkId", clerkId).eq("active", true),
      )
      .unique();

    if (existing && now - existing.startedAt < CHECKIN_TTL_MS) {
      throw new Error("You already have an active check-in.");
    }

    // large then ttl then expire the check in
    if (existing && now - existing.startedAt >= CHECKIN_TTL_MS) {
      await ctx.db.patch(existing._id, { active: false, endedAt: now });
    }

    const name = "unknown";

    // create a checkin
    const id = await ctx.db.insert("checkins", {
      clerkId,
      lat: args.lat,
      name,
      lng: args.lng,
      note: args.note,
      active: true,
      startedAt: now,
    });

    return { id };
  },
});

export const endMyCheckin = mutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;

    const existing = await ctx.db
      .query("checkins")
      .withIndex("by_clerk_active", (q) =>
        q.eq("clerkId", userId).eq("active", true),
      )
      .unique();

    if (!existing) return { ended: false as const };

    await ctx.db.patch(existing._id, { active: false, endedAt: Date.now() });
    return { ended: true as const };
  },
});
