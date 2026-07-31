const mongoose = require("mongoose");
const { Schema } = mongoose;

const materialSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    priceModifier: { type: Number, default: 0 },
    swatchImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    textureAsset: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

materialSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("Material", materialSchema);