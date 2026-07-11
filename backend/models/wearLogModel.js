const mongoose = require("mongoose");
const { Schema } = mongoose;
const Outfit = require("./outfitModel");

const wearLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    outfit: { type: Schema.Types.ObjectId, ref: "Outfit", required: true, index: true },
    dateWorn: { type: Date, required: true },
  },
  { timestamps: true }
);

wearLogSchema.index({ user: 1, dateWorn: -1 });
wearLogSchema.index({ user: 1, outfit: 1 });

wearLogSchema.post("save", async function (doc) {
  await Outfit.findByIdAndUpdate(doc.outfit, { $inc: { timesWorn: 1 } });
});

module.exports = mongoose.model("WearLog", wearLogSchema);
