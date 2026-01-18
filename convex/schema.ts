import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    userId: v.string(),
    handle: v.optional(v.string()),
    name: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    links: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_handle", ["handle"]),

  spaces: defineTable({
    name: v.string(),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    address: v.optional(v.string()),
    lat: v.number(),
    lng: v.number(),
    createdAt: v.number(),
  })
    .index("by_city", ["city"])
    .index("by_geo", ["lat", "lng"]),

  checkins: defineTable({
    userId: v.string(),
    spaceId: v.id("spaces"),
    lat: v.number(),
    lng: v.number(),
    note: v.optional(v.string()),
    active: v.boolean(),
    shareId: v.string(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
  })
    .index("by_user_active", ["userId", "active"])
    .index("by_share", ["shareId"])
    .index("by_space_active", ["spaceId", "active"]),

  joins: defineTable({
    checkinId: v.id("checkins"),
    userId: v.string(),
    message: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_checkin", ["checkinId"]) // list joins per checkin
    .index("by_user", ["userId"]),
});
