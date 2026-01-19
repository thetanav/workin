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
  })
    .index("by_clerk", ["clerkId"]),

  checkins: defineTable({
    clerkId: v.string(),
    lat: v.number(),
    lng: v.number(),
    note: v.string(),
    active: v.boolean(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
  })
    .index("by_clerk_active", ["clerkId", "active"])
});