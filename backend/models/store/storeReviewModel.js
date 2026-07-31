const mongoose = require("mongoose");
const { Schema } = mongoose;

const storeReviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["CustomerDesign"], required: true, default: "CustomerDesign" },
    targetId: { type: Schema.Types.ObjectId, required: true, refPath: "targetType" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "", trim: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    isFeatured: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

storeReviewSchema.index({ targetType: 1, targetId: 1 });
storeReviewSchema.index({ isFeatured: 1, isApproved: 1 });

module.exports = mongoose.model("StoreReview", storeReviewSchema);