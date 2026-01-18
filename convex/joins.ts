// Note: Convex generates `convex/_generated/*` after you run `npx convex dev`.
import { v } from "convex/values";
import { mutation } from "./_generated/server";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __convexTypecheck = { mutation };

type AnyCtx = any;

type JoinArgs = {
  checkinId: any;
  userId: string;
  message?: string;
};

export const joinCheckin = mutation({
  args: {
    checkinId: v.id("checkins"),
    userId: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx: AnyCtx, args: JoinArgs) => {
    const checkin = await ctx.db.get(args.checkinId);
    if (!checkin || !checkin.active) throw new Error("Check-in is not active.");

    const id = await ctx.db.insert("joins", {
      checkinId: args.checkinId,
      userId: args.userId,
      message: args.message,
      createdAt: Date.now(),
    });

    return { id };
  },
});
