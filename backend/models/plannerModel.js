const mongoose = require("mongoose");
const { Schema } = mongoose;

const plannerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    outfit: { type: Schema.Types.ObjectId, ref: "Outfit", required: true },
    date: { type: Date, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

plannerSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Planner", plannerSchema);
