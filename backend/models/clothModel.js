const mongoose = require("mongoose");
const { Schema } = mongoose;

const clothSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },

    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    category: {
      type: String,
      required: true,
      enum: ["Top", "Bottom", "Dress", "Hijab", "Foot Wears", "Bags", "Accessories"],
    },
    subCategory: { type: String, default: null, trim: true },

    color: {
      primary: { type: String, default: null, trim: true },
      secondary: [{ type: String, trim: true }],
    },

    pattern: { type: String, default: null, trim: true },
    sleeveType: { type: String, default: null, trim: true },
    neckType: { type: String, default: null, trim: true },
    fit: { type: String, default: null, trim: true },
    fabric: { type: String, default: null, trim: true },
    materialConfidence: { type: Number, default: null, min: 0, max: 1 },

    genderSuitability: {
      type: String,
      enum: ["Men", "Women", "Unisex", null],
      default: null,
    },

    style: { type: String, default: null, trim: true },
    occasion: { type: String, default: null, trim: true },
    season: { type: String, default: null, trim: true },
    formality: {
      type: String,
      enum: ["Formal", "Casual", "Semi-Formal", null],
      default: null,
    },

    brand: { type: String, default: "", trim: true },
    logosDetected: { type: Boolean, default: null },

    texture: { type: String, default: null, trim: true },
    length: { type: String, default: null, trim: true },
    condition: {
      type: String,
      enum: ["New", "Good", "Worn", "Damaged", null],
      default: null,
    },
    layeringType: {
      type: String,
      enum: ["Base", "Mid", "Outer", null],
      default: null,
    },

    tags: [{ type: String, trim: true }],

    aiMeta: {
      provider: { type: String, default: "groq" },
      model: { type: String, default: null },
      confidenceScores: { type: Schema.Types.Mixed, default: {} },
      analyzedAt: { type: Date, default: null },
      analysisFailed: { type: Boolean, default: false },
      failureReason: { type: String, default: null },
    },

    isFavorite: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

clothSchema.index({ user: 1, category: 1 });
clothSchema.index({ user: 1, name: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Cloth", clothSchema);
