const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    type: {
      type: String,
      enum: [
        "report_content_removed",
        "planner_reminder_day_before",
        "planner_reminder_morning_of",
        "system",
      ],
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    // Optional link back to whatever this notification is about
    // (a CommunityPost, a Planner entry, etc.)
    relatedType: { type: String, default: null },
    relatedId: { type: Schema.Types.ObjectId, default: null },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
