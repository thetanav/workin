// Note: Convex generates `convex/_generated/*` after you run `npx convex dev`.
import { v } from "convex/values";
import { mutation, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __convexTypecheck = { mutation };

type JoinArgs = {
  checkinId: Id<"checkins">;
  message?: string;
};

export const joinCheckin = mutation({
  args: {
    checkinId: v.id("checkins"),
    message: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args: JoinArgs) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;

    const checkin = await ctx.db.get(args.checkinId);
    if (!checkin || !checkin.active) throw new Error("Check-in is not active.");

    const existing = await ctx.db
        .query("joins")
        .withIndex("by_checkin", (q) => q.eq("checkinId", args.checkinId))
        .collect();
    
    // Prevent double joining if desired, or just allow multiple messages.
    // Let's enforce 1 join per user per checkin for now.
    const alreadyJoined = existing.find((j) => j.userId === userId);
    if (alreadyJoined) {
        throw new Error("Already joined this check-in.");
    }

    const id = await ctx.db.insert("joins", {
      checkinId: args.checkinId,
      userId,
      message: args.message,
      createdAt: Date.now(),
    });

    return { id };
  },
});
