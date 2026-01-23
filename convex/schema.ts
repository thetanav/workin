import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    clerkId: v.string(),
    imageUrl: v.optional(v.string()),
    email: v.optional(v.string()),
    bio: v.optional(v.string()),
    links: v.optional(v.array(v.string())),
    updatedAt: v.number(),
    checkinsCount: v.number(),
  }).index("by_clerk", ["clerkId"]),

  notifications: defineTable({
    clerkId: v.string(),
    fromClerkId: v.optional(v.string()),
    checkinId: v.optional(v.id("checkins")),
    type: v.string(),
    imagePayloadUrl: v.string(),
    action: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_clerk", ["clerkId"])
    .index("by_clerk_read", ["clerkId", "read"]),

  checkins: defineTable({
    clerkId: v.string(),
    userImageUrl: v.string(),
    lat: v.number(),
    lng: v.number(),
    placeName: v.string(),
    note: v.string(),
    active: v.boolean(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    participants: v.optional(v.array(v.string())),
  }).index("by_clerk_active", ["clerkId", "active"]),
});
