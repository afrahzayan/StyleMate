const mongoose = require("mongoose");
const { Schema } = mongoose;

const likeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "CommunityPost", required: true },
  },
  { timestamps: true }
);

likeSchema.index({ user: 1, post: 1 }, { unique: true }); // prevents double-likes

module.exports = mongoose.model("Like", likeSchema);