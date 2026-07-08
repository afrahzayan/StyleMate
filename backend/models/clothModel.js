const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Cloth model — extended to hold every attribute the AI vision service can
 * detect, plus the original manually-entered fields for backward compatibility.
 *
 * Design notes:
 * - Classification fields (pattern, sleeveType, fit, etc.) are free-form
 *   Strings rather than enums. AI vision output varies in wording
 *   ("crew neck" vs "round neck"), and rejecting a save because the AI's
 *   phrasing doesn't match a fixed enum would be worse than accepting
 *   whatever string it returns. `category` is the one exception — it stays
 *   a strict enum because the Wardrobe page's filter tabs depend on it;
 *   the controller normalizes whatever the AI returns into one of these
 *   values before saving.
 * - Every AI-derived field defaults to null so "couldn't be identified" is
 *   distinguishable from "identified as empty/false".
 */
const clothSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },

    // ── Identity (AI-generated initially, always user-editable) ──────
    name: { type: String, required: true, trim: true }, // AI title, or "Untitled Item" fallback
    description: { type: String, default: "" }, // AI-generated description

    category: {
      type: String,
      required: true,
      enum: ["Top", "Bottom", "Dress", "Hijab", "Shoes", "Bags", "Accessories"],
    },
    subCategory: { type: String, default: null, trim: true }, // e.g. "T-Shirt", "Ankle Boots"

    color: {
      primary: { type: String, default: null, trim: true },
      secondary: [{ type: String, trim: true }],
    },

    // ── AI-detected classification (all optional/free-form) ──────────
    pattern: { type: String, default: null, trim: true },        // e.g. "Striped", "Solid"
    sleeveType: { type: String, default: null, trim: true },     // e.g. "Short Sleeve"
    neckType: { type: String, default: null, trim: true },       // e.g. "Crew Neck"
    fit: { type: String, default: null, trim: true },            // e.g. "Slim Fit"
    fabric: { type: String, default: null, trim: true },         // e.g. "Cotton"
    materialConfidence: { type: Number, default: null, min: 0, max: 1 }, // 0–1

    genderSuitability: {
      type: String,
      enum: ["Men", "Women", "Unisex", null],
      default: null,
    },

    style: { type: String, default: null, trim: true },          // e.g. "Streetwear"
    occasion: { type: String, default: null, trim: true },       // free text, AI or user
    season: { type: String, default: null, trim: true },         // free text, AI or user
    formality: {
      type: String,
      enum: ["Formal", "Casual", "Semi-Formal", null],
      default: null,
    },

    brand: { type: String, default: "", trim: true },
    logosDetected: { type: Boolean, default: null },

    texture: { type: String, default: null, trim: true },
    length: { type: String, default: null, trim: true },         // e.g. "Cropped", "Midi"
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

    tags: [{ type: String, trim: true }], // freeform fashion tags

    // ── AI run metadata (for debugging/auditing, not shown by default) ──
    aiMeta: {
      provider: { type: String, default: "groq" },
      model: { type: String, default: null },
      confidenceScores: { type: Schema.Types.Mixed, default: {} }, // { fieldName: 0-1 }
      analyzedAt: { type: Date, default: null },
      analysisFailed: { type: Boolean, default: false },
      failureReason: { type: String, default: null },
    },

    isFavorite: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }, // soft delete keeps Outfit refs valid
  },
  { timestamps: true }
);

clothSchema.index({ user: 1, category: 1 });
clothSchema.index({ user: 1, name: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Cloth", clothSchema);