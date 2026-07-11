const mongoose = require("mongoose");
const { Schema } = mongoose;

const outfitSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },

    // Built only from existing wardrobe items — never raw images
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cloth",
        required: true,
      },
    ],

    // Extended to cover the occasions the AI Suggestions page offers
    // (College, Office, Traditional, Travel, Sports) in addition to the
    // original manual-builder set — kept as one shared enum so an
    // AI-saved outfit stays filterable/editable everywhere else in the
    // app (Outfits list filter pills, manual Outfit Builder dropdown).
    occasion: {
      type: String,
      enum: [
        "Casual", "Formal", "Office", "College", "Wedding", "Party",
        "Traditional", "Travel", "Sports", "Work", "Eid", "Other",
      ],
      default: "Casual",
    },

    isFavorite: { type: Boolean, default: false },

    source: { type: String, enum: ["manual", "ai"], default: "manual" },
    aiSuggestion: { type: Schema.Types.ObjectId, ref: "AiSuggestion", default: null },

    timesWorn: { type: Number, default: 0 }, // kept in sync by WearLog hook
  },
  { timestamps: true }
);

outfitSchema.index({ user: 1, isFavorite: 1 });

module.exports = mongoose.model("Outfit", outfitSchema);