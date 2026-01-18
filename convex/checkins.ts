// Note: Convex generates `convex/_generated/*` after you run `npx convex dev`.
// Until then, editor/TS may report missing module errors.
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __convexTypecheck = { mutation, query };

function randomShareId(): string {
  return (
    Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
  );
}

type AnyCtx = any;

type ActiveNearbyArgs = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export const activeNearby = query({
  args: {
    minLat: v.number(),
    maxLat: v.number(),
    minLng: v.number(),
    maxLng: v.number(),
  },
  handler: async (ctx: AnyCtx, args: ActiveNearbyArgs) => {
    const results = await ctx.db
      .query("checkins")
      .filter((q: any) => q.eq(q.field("active"), true))
      .collect();

    return results
      .filter(
        (c: any) =>
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
  handler: async (ctx: AnyCtx, args: GetByShareArgs) => {
    const checkin = await ctx.db
      .query("checkins")
      .withIndex("by_share", (q: any) => q.eq("shareId", args.shareId))
      .unique();

    if (!checkin) return null;

    const space = await ctx.db.get(checkin.spaceId);
    const joins = await ctx.db
      .query("joins")
      .withIndex("by_checkin", (q: any) => q.eq("checkinId", checkin._id))
      .collect();

    return { checkin, space, joinsCount: joins.length };
  },
});

type CreateArgs = {
  userId: string;
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
    userId: v.string(),
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
  handler: async (ctx: AnyCtx, args: CreateArgs) => {
    const existing = await ctx.db
      .query("checkins")
      .withIndex("by_user_active", (q: any) =>
        q.eq("userId", args.userId).eq("active", true),
      )
      .unique();

    if (existing) throw new Error("You already have an active check-in.");

    const existingSpaces = await ctx.db.query("spaces").collect();
    const found = existingSpaces.find(
      (s: any) =>
        s.name === args.space.name &&
        Math.abs(s.lat - args.space.lat) < 0.0005 &&
        Math.abs(s.lng - args.space.lng) < 0.0005,
    );

    const spaceId = found
      ? found._id
      : await ctx.db.insert("spaces", { ...args.space, createdAt: Date.now() });

    const shareId = randomShareId();

    const id = await ctx.db.insert("checkins", {
      userId: args.userId,
      spaceId,
      lat: args.space.lat,
      lng: args.space.lng,
      note: args.note,
      active: true,
      shareId,
      startedAt: Date.now(),
    });

    return { id, shareId };
  },
});

type EndArgs = { userId: string };

export const endMyCheckin = mutation({
  args: { userId: v.string() },
  handler: async (ctx: AnyCtx, args: EndArgs) => {
    const existing = await ctx.db
      .query("checkins")
      .withIndex("by_user_active", (q: any) =>
        q.eq("userId", args.userId).eq("active", true),
      )
      .unique();

    if (!existing) return { ended: false as const };

    await ctx.db.patch(existing._id, { active: false, endedAt: Date.now() });
    return { ended: true as const };
  },
});
