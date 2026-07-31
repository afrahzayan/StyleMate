const mongoose = require("mongoose");
const { Schema } = mongoose;

const customerDesignSchema = new Schema(
  {
    // null for admin-curated gallery/showcase designs; set when a user
    // saves a design of their own from the customization wizard.
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    status: { type: String, enum: ["saved", "submitted"], default: "saved" },
    title: { type: String, required: true, trim: true },
    previewImage: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    clothingType: { type: String, required: true },
    selections: { type: Schema.Types.Mixed, default: {} },
    // Free-form body measurements captured in the Design Studio (cm).
    // Not part of the priced option catalog — purely stored with the design.
    measurements: {
      height: { type: Number, default: null },
      shoulder: { type: Number, default: null },
      chest: { type: Number, default: null },
      waist: { type: Number, default: null },
      hip: { type: Number, default: null },
      sleeveLength: { type: Number, default: null },
    },
    price: { type: Number, required: true },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerDesign", customerDesignSchema);