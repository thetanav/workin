import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

type GetArgs = { userId: string };

type UpsertArgs = {
  userId: string;
  handle?: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  github?: string;
  twitter?: string;
  links?: string[];
  skills?: string[];
};

export const getMe = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();
  },
});

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx: QueryCtx, args: GetArgs) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
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
    github: v.optional(v.string()),
    twitter: v.optional(v.string()),
    links: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
  },
  handler: async (ctx: MutationCtx, args: UpsertArgs) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.userId) {
      throw new Error("Unauthorized profile upsert");
    }
    // MVP: store userId on profile document.
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    const payload = {
      userId: args.userId,
      handle: args.handle,
      name: args.name,
      bio: args.bio,
      avatarUrl: args.avatarUrl,
      github: args.github,
      twitter: args.twitter,
      links: args.links,
      skills: args.skills,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return { id: existing._id };
    }

    const id = await ctx.db.insert("profiles", payload);
    return { id };
  },
});

export const store = mutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
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
