import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  mutation,
  query,
  action,
  internalMutation,
  internalQuery,
  QueryCtx,
  MutationCtx,
  ActionCtx,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

const CHECKIN_TTL_MS = 6 * 60 * 60 * 1000; // 6hr
const DEFAULT_RADIUS_KM = 10;
const GEO_CACHE_DECIMALS = 4;

type Visibility = "public" | "nearby" | "private";

function normalizeVisibility(visibility?: string | null): Visibility {
  if (visibility === "nearby" || visibility === "private" || visibility === "public") {
    return visibility;
  }
  return "public";
}

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

function toRadians(n: number) {
  return (n * Math.PI) / 180;
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function geocodeKey(lat: number, lng: number) {
  return `${lat.toFixed(GEO_CACHE_DECIMALS)},${lng.toFixed(GEO_CACHE_DECIMALS)}`;
}

function fuzzLatLng(lat: number, lng: number, radiusKm: number) {
  const radius = Math.max(0, radiusKm);
  if (radius === 0) return { lat, lng };
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * radius;
  const latDelta = distance / 111;
  const lngDelta = distance / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    lat: lat + Math.cos(angle) * latDelta,
    lng: lng + Math.sin(angle) * lngDelta,
  };
}

export const activeNearby = query({
  args: {
    lng: v.number(),
    lat: v.number(),
    radiusKm: v.optional(v.number()),
  },
  handler: async (ctx: QueryCtx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const viewerId = identity?.subject ?? null;
    const radiusKm = args.radiusKm ?? DEFAULT_RADIUS_KM;
    const box = getBoundingBox(args.lat, args.lng, radiusKm);
    const now = Date.now();

    const list = await ctx.db
      .query("checkins")
      .filter((q) =>
        q.and(
          q.gte(q.field("lat"), box.minLat),
          q.lte(q.field("lat"), box.maxLat),
          q.gte(q.field("lng"), box.minLng),
          q.lte(q.field("lng"), box.maxLng),
          q.eq(q.field("active"), true),
          q.gte(q.field("startedAt"), now - CHECKIN_TTL_MS),
        ),
      )
      .order("desc")
      .take(100);

    const filtered = list.filter((checkin) => {
      const visibility = normalizeVisibility(checkin.visibility);
      if (visibility === "private") {
        return viewerId !== null && checkin.clerkId === viewerId;
      }
      return true;
    });

    const sorted = filtered
      .map((checkin) => ({
        checkin,
        distance: distanceKm(
          { lat: args.lat, lng: args.lng },
          { lat: checkin.lat, lng: checkin.lng },
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .map(({ checkin }) => {
        const visibility = normalizeVisibility(checkin.visibility);
        if (visibility === "private") return checkin;
        if (viewerId && checkin.clerkId === viewerId) return checkin;
        if (checkin.displayLat !== undefined && checkin.displayLng !== undefined) {
          return { ...checkin, lat: checkin.displayLat, lng: checkin.displayLng };
        }
        return checkin;
      });

    return sorted.slice(0, 30);
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const viewerId = identity?.subject ?? null;
    const checkin = await ctx.db.get(args.id as Id<"checkins">);

    if (!checkin) return { checkin: null };

    if (!("startedAt" in checkin)) return { checkin: null };

    if (Date.now() - checkin.startedAt >= CHECKIN_TTL_MS) {
      return { checkin: null };
    }

    const visibility = normalizeVisibility(checkin.visibility);
    if (visibility === "private" && checkin.clerkId !== viewerId) {
      return { checkin: null };
    }

    if (viewerId && checkin.clerkId === viewerId) {
      return { checkin };
    }

    if (checkin.displayLat !== undefined && checkin.displayLng !== undefined) {
      return {
        checkin: { ...checkin, lat: checkin.displayLat, lng: checkin.displayLng },
      };
    }

    return { checkin };
  },
});

export const getAllActive = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const now = Date.now();
    return await ctx.db
      .query("checkins")
      .filter((q) =>
        q.and(
          q.eq(q.field("active"), true),
          q.gte(q.field("startedAt"), now - CHECKIN_TTL_MS),
        ),
      )
      .order("desc")
      .take(100); // limit to 100 for performance
  },
});

export const activeStats = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const now = Date.now();
    const list = await ctx.db
      .query("checkins")
      .filter((q) =>
        q.and(
          q.eq(q.field("active"), true),
          q.gte(q.field("startedAt"), now - CHECKIN_TTL_MS),
        ),
      )
      .take(500);
    const uniqueBuilders = new Set(list.map((c) => c.clerkId)).size;
    return { activeCount: list.length, uniqueBuilders };
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

export const lookupGeocode = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("geocodeCache")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
  },
});

export const storeGeocode = internalMutation({
  args: { key: v.string(), placeName: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("geocodeCache")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        placeName: args.placeName,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("geocodeCache", {
        key: args.key,
        placeName: args.placeName,
        updatedAt: now,
      });
    }
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
    status: v.optional(v.string()),
    visibility: v.optional(v.string()),
    displayLat: v.optional(v.number()),
    displayLng: v.optional(v.number()),
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
      displayLat: args.displayLat,
      displayLng: args.displayLng,
      placeName: args.placeName,
      userImageUrl: args.userImageUrl,
      note: args.note,
      status: args.status,
      visibility: normalizeVisibility(args.visibility),
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
    status: v.optional(v.string()),
    visibility: v.optional(v.string()),
    fuzzKm: v.optional(v.number()),
  },
  handler: async (ctx: ActionCtx, args): Promise<{ id: Id<"checkins"> }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.runQuery(api.users.current, {});
    const visibility = normalizeVisibility(args.visibility ?? user?.defaultVisibility);
    const status = args.status ?? user?.defaultStatus;
    const fuzzKm = args.fuzzKm ?? user?.defaultFuzzKm ?? 0;

    const key = geocodeKey(args.lat, args.lng);
    const cached = await ctx.runQuery(internal.checkins.lookupGeocode, { key });
    let placeName = cached?.placeName;

    if (!placeName) {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${args.lat}&lon=${args.lng}`,
        {
          headers: {
            "User-Agent": "workin/1.0 (https://github.com/thetanav/workin)",
            "Accept-Language": "en",
          },
        },
      );

      const data = await res.json();
      placeName =
        data.name ||
        data.display_name?.split(",").slice(0, 2).join(", ");
      if (placeName) {
        await ctx.runMutation(internal.checkins.storeGeocode, {
          key,
          placeName,
        });
      }
    }
    const resolvedPlaceName = placeName ?? "Unknown place";

    const { lat: displayLat, lng: displayLng } =
      visibility === "public" && fuzzKm > 0
        ? fuzzLatLng(args.lat, args.lng, fuzzKm)
        : visibility === "nearby" && fuzzKm > 0
          ? fuzzLatLng(args.lat, args.lng, fuzzKm)
          : { lat: undefined, lng: undefined };

    return await ctx.runMutation(internal.checkins.internalCreateCheckin, {
      lat: args.lat,
      lng: args.lng,
      note: args.note,
      placeName: resolvedPlaceName,
      userImageUrl: identity.pictureUrl || INTERNAL_DEFAULT_AVATAR,
      status,
      visibility,
      displayLat,
      displayLng,
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
