import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getMyNotifications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_clerk_read", (q) =>
        q.eq("clerkId", identity.subject).eq("read", false),
      )
      .order("desc")
      .take(20);
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) return;

    if (notification.clerkId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.notificationId, { read: true });
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_clerk_read", (q) =>
        q.eq("clerkId", identity.subject).eq("read", false),
      )
      .collect();

    await Promise.all(
      notifications.map((n) => ctx.db.patch(n._id, { read: true })),
    );
  },
});
