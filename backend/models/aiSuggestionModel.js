const mongoose = require("mongoose");
const { Schema } = mongoose;

const aiSuggestionItemSchema = new Schema(
  {
    items: [{ type: Schema.Types.ObjectId, ref: "Cloth", required: true }],
    label: { type: String, default: "" },
    explanation: { type: String, default: "" },
    confidence: { type: Number, min: 0, max: 100, default: null },
    savedAsOutfit: { type: Schema.Types.ObjectId, ref: "Outfit", default: null },
    isFavorite: { type: Boolean, default: false },
  },
  { _id: true }
);

const aiSuggestionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    occasion: { type: String, required: true },
    season: { type: String, default: null },
    preferredColors: [{ type: String, trim: true }],
    categories: [{ type: String, trim: true }],

    contextItemsSent: [
      {
        cloth: { type: Schema.Types.ObjectId, ref: "Cloth" },
        name: String,
        category: String,
      },
    ],

    rawAiResponse: { type: String },

    suggestions: [aiSuggestionItemSchema],

    status: { type: String, enum: ["success", "failed", "partial"], default: "success" },
    failureReason: { type: String, default: null },

    aiMeta: {
      provider: { type: String, default: "groq" },
      model: { type: String, default: null },
      generatedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

aiSuggestionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("AiSuggestion", aiSuggestionSchema);
