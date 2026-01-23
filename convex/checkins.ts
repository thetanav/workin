import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  mutation,
  query,
  action,
  internalMutation,
  QueryCtx,
  MutationCtx,
  ActionCtx,
} from "./_generated/server";
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
    const checkin = await ctx.db.get(args.id as Id<"checkins">);

    if (!checkin) return { checkin: null };

    if (!("startedAt" in checkin)) return { checkin: null };

    if (Date.now() - checkin.startedAt >= CHECKIN_TTL_MS) {
      return { checkin: null };
    }

    return { checkin };
  },
});

export const getAllActive = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    return await ctx.db
      .query("checkins")
      .filter((q) => q.eq(q.field("active"), true))
      .order("desc")
      .take(100); // limit to 100 for performance
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

const INTERNAL_DEFAULT_AVATAR = "https://avatar.vercel.sh/placeholder";

export const internalCreateCheckin = internalMutation({
  args: {
    note: v.string(),
    lat: v.number(),
    lng: v.number(),
    placeName: v.string(),
    userImageUrl: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const clerkId = identity.subject;

    const now = Date.now();

    const existing = await ctx.db
      .query("checkins")
      .withIndex("by_clerk_active", (q) =>
        q.eq("clerkId", clerkId).eq("active", true),
      )
      .unique();

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        checkinsCount: (user.checkinsCount ?? 0) + 1,
      });
    }

    if (existing && now - existing.startedAt < CHECKIN_TTL_MS) {
      throw new Error("You already have an active check-in.");
    }

    if (existing && now - existing.startedAt >= CHECKIN_TTL_MS) {
      await ctx.db.patch(existing._id, { active: false, endedAt: now });
    }

    const id = await ctx.db.insert("checkins", {
      clerkId,
      lat: args.lat,
      lng: args.lng,
      placeName: args.placeName,
      userImageUrl: args.userImageUrl,
      note: args.note,
      active: true,
      startedAt: now,
    });

    return { id };
  },
});

export const createCheckin = action({
  args: {
    note: v.string(),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx: ActionCtx, args): Promise<{ id: Id<"checkins"> }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${args.lat}&lon=${args.lng}`,
      {
        headers: {
          "User-Agent": "checkin-app",
        },
      },
    );

    const data = await res.json();

    const placeName =
      data.name ||
      data.display_name?.split(",").slice(0, 2).join(", ") ||
      "Unknown place";

    return await ctx.runMutation(internal.checkins.internalCreateCheckin, {
      lat: args.lat,
      lng: args.lng,
      note: args.note,
      placeName,
      userImageUrl: identity.pictureUrl || INTERNAL_DEFAULT_AVATAR,
    });
  },
});

export const stop = mutation({
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
