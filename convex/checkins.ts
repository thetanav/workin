// Note: Convex generates `convex/_generated/*` after you run `npx convex dev`.
// Until then, editor/TS may report missing module errors.
import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __convexTypecheck = { mutation, query };

function randomShareId(): string {
  return (
    Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
  );
}

type ActiveNearbyArgs = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

const CHECKIN_TTL_MS = 6 * 60 * 60 * 1000;

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

type GetByShareArgs = { shareId: string };

export const getByShareId = query({
  args: { shareId: v.string() },
  handler: async (ctx: QueryCtx, args: GetByShareArgs) => {
    const checkin = await ctx.db
      .query("checkins")
      .withIndex("by_share", (q) => q.eq("shareId", args.shareId))
      .unique();

    if (!checkin) return null;

    if (checkin.active && Date.now() - checkin.startedAt >= CHECKIN_TTL_MS) {
      return null;
    }

    const space = await ctx.db.get(checkin.spaceId);
    const joins = await ctx.db
      .query("joins")
      .withIndex("by_checkin", (q) => q.eq("checkinId", checkin._id))
      .collect();

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", checkin.userId))
      .unique();

    return { checkin, space, joinsCount: joins.length, profile };
  },
});


export const getMyActiveCheckin = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;
    const checkin = await ctx.db
      .query("checkins")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("active", true),
      )
      .unique();

    if (checkin && Date.now() - checkin.startedAt >= CHECKIN_TTL_MS) {
      return null;
    }
    return checkin;
  },
});

type CreateArgs = {
  space: {
    name: string;
    city?: string;
    country?: string;
    address?: string;
    lat: number;
    lng: number;
  };
  note?: string;
};

export const createAtCurrentLocation = mutation({
  args: {
    space: v.object({
      name: v.string(),
      city: v.optional(v.string()),
      country: v.optional(v.string()),
      address: v.optional(v.string()),
      lat: v.number(),
      lng: v.number(),
    }),
    note: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args: CreateArgs) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;

    const now = Date.now();
    const existing = await ctx.db
      .query("checkins")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("active", true),
      )
      .unique();

    if (existing && now - existing.startedAt < CHECKIN_TTL_MS) {
      throw new Error("You already have an active check-in.");
    }

    if (existing && now - existing.startedAt >= CHECKIN_TTL_MS) {
      await ctx.db.patch(existing._id, { active: false, endedAt: now });
    }

    const existingSpaces = await ctx.db.query("spaces").collect();
    const found = existingSpaces.find(
      (s) =>
        s.name === args.space.name &&
        Math.abs(s.lat - args.space.lat) < 0.0005 &&
        Math.abs(s.lng - args.space.lng) < 0.0005,
    );

    const spaceId = found
      ? found._id
      : await ctx.db.insert("spaces", { ...args.space, createdAt: Date.now() });

    const shareId = randomShareId();

    const id = await ctx.db.insert("checkins", {
      userId,
      spaceId,
      lat: args.space.lat,
      lng: args.space.lng,
      note: args.note,
      active: true,
      shareId,
      startedAt: now,
    });

    return { id, shareId };
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
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("active", true),
      )
      .unique();

    if (!existing) return { ended: false as const };

    await ctx.db.patch(existing._id, { active: false, endedAt: Date.now() });
    return { ended: true as const };
  },
});
