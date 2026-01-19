import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";


type ActiveNearbyArgs = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

const CHECKIN_TTL_MS = 6 * 60 * 60 * 1000; // 6hr

// have to work on this it is broken
export const activeNearby = query({
  args: {
    minLat: v.number(),
    maxLat: v.number(),
    minLng: v.number(),
    maxLng: v.number(),
  },
  handler: async (ctx: QueryCtx, args: ActiveNearbyArgs) => {
    const now = Date.now();
    const results = await ctx.db
      .query("checkins")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    return results
      .filter((c) => now - c.startedAt < CHECKIN_TTL_MS)
      .filter(
        (c) =>
          c.lat >= args.minLat &&
          c.lat <= args.maxLat &&
          c.lng >= args.minLng &&
          c.lng <= args.maxLng,
      )
      .slice(0, 200);
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    const checkin = await ctx.db
      .query("checkins")
      .filter((q) => q.eq("_id", args.id))
      .unique();

    if (!checkin) return null;

    if (Date.now() - checkin.startedAt >= CHECKIN_TTL_MS) {
      return null;
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

    // create a checkin
    const id = await ctx.db.insert("checkins", {
      clerkId,
      lat: args.lat,
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
