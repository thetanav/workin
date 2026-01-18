import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

type AnyCtx = any;

type GetArgs = { userId: string };

type UpsertArgs = {
  userId: string;
  handle?: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  links?: string[];
  skills?: string[];
};

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx: AnyCtx, args: GetArgs) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .unique();
  },
});

export const upsert = mutation({
  args: {
    userId: v.string(),
    handle: v.optional(v.string()),
    name: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    links: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
  },
  handler: async (ctx: AnyCtx, args: UpsertArgs) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.userId) {
      throw new Error("Unauthorized profile upsert");
    }
    // MVP: store userId on profile document.
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .unique();

    const payload = {
      userId: args.userId,
      handle: args.handle,
      name: args.name,
      bio: args.bio,
      avatarUrl: args.avatarUrl,
      links: args.links,
      skills: args.skills,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return { id: existing._id };
    }

    const id = await ctx.db.insert("profiles", payload as any);
    return { id };
  },
});

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called profiles.store without authentication present");
    }

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    const userId = identity.subject;
    const now = Date.now();

    const patch = {
      userId,
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? "Anonymous",
      avatarUrl: identity.pictureUrl,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("profiles", patch);
  },
});