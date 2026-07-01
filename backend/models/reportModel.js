const mongoose = require("mongoose");
const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reportedUser: { type: Schema.Types.ObjectId, ref: "User", required: true },

    targetType: {
      type: String,
      enum: ["CommunityPost", "Comment", "Cloth"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },

    category: {
      type: String,
      enum: ["Inappropriate", "Spam", "Abuse", "Misinformation", "Other"],
      required: true,
    },
    description: { type: String, default: "" },

    status: {
      type: String,
      enum: ["new", "reviewing", "high_priority", "critical", "resolved"],
      default: "new",
    },

    resolvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    resolutionNote: { type: String, default: "" },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Report", reportSchema);