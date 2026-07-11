const mongoose = require("mongoose");
const { Schema } = mongoose;

const outfitSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },

    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cloth",
        required: true,
      },
    ],

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

    timesWorn: { type: Number, default: 0 },
  },
  { timestamps: true }
);

outfitSchema.index({ user: 1, isFavorite: 1 });

module.exports = mongoose.model("Outfit", outfitSchema);
