import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const CHECKIN_TTL_MS = 6 * 60 * 60 * 1000; // 6hr

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

export const sendJoinRequest = mutation({
  args: { checkinId: v.id("checkins") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Check if sender has an active checkin
    const senderCheckin = await ctx.db
      .query("checkins")
      .withIndex("by_clerk_active", (q) =>
        q.eq("clerkId", identity.subject).eq("active", true),
      )
      .unique();
    
    if (!senderCheckin || Date.now() - senderCheckin.startedAt >= CHECKIN_TTL_MS) {
      console.log("Validation failed: User", identity.subject, "has no valid active checkin");
      throw new Error("You must have an active check-in to join others");
    }

    const checkin = await ctx.db.get(args.checkinId);
    if (!checkin) throw new Error("Checkin not found");
    if (checkin.clerkId === identity.subject) throw new Error("Cannot join your own checkin");
    if (checkin.participants?.includes(identity.subject)) throw new Error("Already joined this checkin");

    // Get sender's name
    const sender = await ctx.db.query("users").withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject)).first();
    const receiver = await ctx.db.query("users").withIndex("by_clerk", (q) => q.eq("clerkId", checkin.clerkId)).first();
    if (!receiver) throw new Error("Receiver not found");

    await ctx.db.insert("notifications", {
      clerkId: checkin.clerkId,
      fromClerkId: identity.subject,
      checkinId: args.checkinId,
      type: "join-request",
      imagePayloadUrl: sender?.imageUrl || "",
      action: `${sender?.name || "Someone"} wants to join your check-in at ${checkin.placeName}`,
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const acceptJoinRequest = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.clerkId !== identity.subject || notification.type !== "join-request") {
      throw new Error("Invalid notification");
    }

    const checkinId = notification.checkinId;
    const fromClerkId = notification.fromClerkId;

    if (!checkinId || !fromClerkId) throw new Error("Invalid data");

    const checkin = await ctx.db.get(checkinId);
    if (!checkin || checkin.clerkId !== identity.subject) throw new Error("Unauthorized");

    // Add to participants
    const currentParticipants = checkin.participants || [];
    if (!currentParticipants.includes(fromClerkId)) {
      await ctx.db.patch(checkinId, {
        participants: [...currentParticipants, fromClerkId],
      });
    }

    // Mark as read
    await ctx.db.patch(args.notificationId, { read: true });
  },
});

export const declineJoinRequest = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.clerkId !== identity.subject || notification.type !== "join-request") {
      throw new Error("Invalid notification");
    }

    // Just mark as read
    await ctx.db.patch(args.notificationId, { read: true });
  },
});
