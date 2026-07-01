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
    category: {
      type: String,
      required: true,
      enum: ["Top", "Bottom", "Dress", "Hijab", "Shoes", "Bags", "Accessories"],
    },
    color: { type: String, required: true },
    season: {
      type: String,
      enum: ["Summer", "Winter", "Spring", "Fall", "All Season"],
      default: "All Season",
    },
    occasion: {
      type: String,
      enum: ["Casual", "Formal", "Party", "Work", "Wedding", "Eid", "Other"],
      default: "Casual",
    },
    brand: { type: String, default: "" },

    isFavorite: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }, // soft delete keeps Outfit refs valid
  },
  { timestamps: true }
);

clothSchema.index({ user: 1, category: 1 });
clothSchema.index({ user: 1, name: "text" });

module.exports = mongoose.model("Cloth", clothSchema);