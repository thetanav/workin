import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

type ByCityArgs = { city: string };

export const byCity = query({
  args: { city: v.string() },
  handler: async (ctx: QueryCtx, args: ByCityArgs) => {
    const city = args.city.trim();
    if (!city) return [];

    const spaces = await ctx.db
      .query("spaces")
      .withIndex("by_city", (q) => q.eq("city", city))
      .collect();

    return spaces;
  },
});

type GetArgs = { id: Id<"spaces"> };

export const get = query({
  args: { id: v.id("spaces") },
  handler: async (ctx: QueryCtx, args: GetArgs) => {
    const space = await ctx.db.get(args.id);
    if (!space) return null;

    const active = await ctx.db
      .query("checkins")
      .withIndex("by_space_active", (q) => q.eq("spaceId", args.id).eq("active", true))
      .collect();

    return { space, activeCount: active.length, active };
  },
});
