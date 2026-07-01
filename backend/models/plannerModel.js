const mongoose = require("mongoose");
const { Schema } = mongoose;

const plannerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    outfit: { type: Schema.Types.ObjectId, ref: "Outfit", required: true },
    date: { type: Date, required: true }, // normalize to midnight UTC when saving
    note: { type: String, default: "" }, // e.g. "Monday Brunch"
  },
  { timestamps: true }
);

// NOTE: Not unique on purpose — free users are limited to 1/day via
// controller logic (User.plan check), premium users can exceed it.
plannerSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("Planner", plannerSchema);