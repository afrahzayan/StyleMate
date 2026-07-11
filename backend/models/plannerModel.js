const mongoose = require("mongoose");
const { Schema } = mongoose;

const plannerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    outfit: { type: Schema.Types.ObjectId, ref: "Outfit", required: true },
    // Full timestamp (day + time), not normalized to midnight. This lets a
    // user plan more than one outfit on the same calendar day as long as
    // the times differ (e.g. one for daytime, one for an evening event).
    date: { type: Date, required: true },
    note: { type: String, default: "" }, // e.g. "Monday Brunch"
  },
  { timestamps: true }
);

// Unique per exact (user, date+time) slot. Planning again for the same
// user at the exact same date+time is treated as "replace this plan"
// (handled as an upsert in the controller) rather than a duplicate error.
// Different times on the same day are separate documents and are allowed.
plannerSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Planner", plannerSchema);