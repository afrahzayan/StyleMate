const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Flow:
 * 1. Backend sends a lightweight wardrobe context to Gemini:
 *    [{ id, name, category, color, occasion }]
 * 2. Gemini replies using ONLY the exact ids given, e.g.
 *    { "top": "<clothId>", "bottom": "<clothId>", "tip": "..." }
 * 3. Backend resolves those ids back to full Cloth docs (with
 *    images) for the visual outfit preview.
 * This record stores both what was sent and what came back,
 * so admin "AI Usage" analytics can be built from this collection.
 */
const aiSuggestionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    occasion: { type: String, required: true },

    contextItemsSent: [
      {
        cloth: { type: Schema.Types.ObjectId, ref: "Cloth" },
        name: String,
        category: String,
      },
    ],

    rawAiResponse: { type: String },

    suggestedItems: [{ type: Schema.Types.ObjectId, ref: "Cloth" }],
    fashionTip: { type: String, default: "" },

    savedAsOutfit: { type: Schema.Types.ObjectId, ref: "Outfit", default: null },

    status: { type: String, enum: ["success", "failed"], default: "success" },
  },
  { timestamps: true }
);

aiSuggestionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("AiSuggestion", aiSuggestionSchema);