const mongoose = require("mongoose");
const { Schema } = mongoose;

const saveSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "CommunityPost", required: true },
  },
  { timestamps: true }
);

saveSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model("Save", saveSchema);