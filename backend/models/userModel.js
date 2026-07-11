const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    provider: { type: String, enum: ["local", "google"], default: "local" },
    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      select: false,
    },
    googleId: {
      type: String,
      required: function () {
        return this.provider === "google";
      },
      unique: true,
      sparse: true,
    },

    profileImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    isVerified: { type: Boolean, default: false },

    signatureColor: { type: String, default: "" },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
