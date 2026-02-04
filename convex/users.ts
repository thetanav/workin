import {
  mutation,
  query,
  QueryCtx,
  internalMutation,
} from "./_generated/server";
import { v, Validator } from "convex/values";
import { UserJSON } from "@clerk/backend";
import { Id } from "./_generated/dataModel";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const getById = query({
  args: { userId: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db.get(args.userId as Id<"users">);
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const sayHello = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Unauthorized");

    // Prevent self-notification
    if (args.clerkId === identity.subject) {
      throw new Error("Cannot send notification to yourself");
    }

    // Check if target user exists
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!targetUser) {
      throw new Error("User not found");
    }

    const sender = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    await ctx.db.insert("notifications", {
      clerkId: args.clerkId,
      type: "say-hello",
      imagePayloadUrl: sender?.imageUrl || identity.pictureUrl || "",
      action: `${sender?.name || "Someone"} waved hello`,
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    bio: v.optional(v.string()),
    links: v.optional(v.array(v.string())),
    defaultVisibility: v.optional(v.string()),
    defaultFuzzKm: v.optional(v.number()),
    defaultStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("Unauthorized");

    await ctx.db.patch(user._id, {
      bio: args.bio,
      links: args.links,
      defaultVisibility: args.defaultVisibility,
      defaultFuzzKm: args.defaultFuzzKm,
      defaultStatus: args.defaultStatus,
      updatedAt: Date.now(),
    });
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      clerkId: data.id,
      imageUrl: data.image_url,
      email: data.email_addresses?.[0]?.email_address,
      updatedAt: Date.now(),
    };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", data.id))
      .unique();
    if (user === null) {
      await ctx.db.insert("users", { ...userAttributes, checkinsCount: 0 });
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkUserId))
      .unique();

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});
