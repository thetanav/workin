import { query } from "./_generated/server";
import { v } from "convex/values";

type AnyCtx = any;

type ByCityArgs = { city: string };

export const byCity = query({
  args: { city: v.string() },
  handler: async (ctx: AnyCtx, args: ByCityArgs) => {
    const city = args.city.trim();
    if (!city) return [];

    const spaces = await ctx.db
      .query("spaces")
      .withIndex("by_city", (q: any) => q.eq("city", city))
      .collect();

    return spaces;
  },
});

type GetArgs = { id: any };

export const get = query({
  args: { id: v.id("spaces") },
  handler: async (ctx: AnyCtx, args: GetArgs) => {
    const space = await ctx.db.get(args.id);
    if (!space) return null;

    const active = await ctx.db
      .query("checkins")
      .withIndex("by_space_active", (q: any) => q.eq("spaceId", args.id).eq("active", true))
      .collect();

    return { space, activeCount: active.length, active };
  },
});
