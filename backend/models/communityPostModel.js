const mongoose = require("mongoose");
const { Schema } = mongoose;

const communityPostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false, index: true },

    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },

    title: { type: String, required: true, trim: true },
    caption: { type: String, default: "" },

    occasion: { type: String, default: "" },
    style: { type: String, default: "" },
    season: { type: String, default: "" },
    tags: [{ type: String, trim: true }],

    outfitType: { type: String, enum: ["manual", "ai"], default: "manual" },
    linkedOutfit: { type: Schema.Types.ObjectId, ref: "Outfit", default: null },

    likesCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["visible", "removed", "under_review"],
      default: "visible",
    },
  },
  { timestamps: true }
);

communityPostSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("CommunityPost", communityPostSchema);