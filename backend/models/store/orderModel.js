const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "Custom Dress" },
    clothingType: { type: String, required: true },
    selections: {
      fabric: { type: String },
      color: { type: String },
      sleeveType: { type: String },
      neckType: { type: String },
      length: { type: String },
      pattern: { type: String },
      embroidery: { type: String },
      threadWork: { type: String },
      stoneWork: { type: String },
      fit: { type: String },
      gender: { type: String },
    },
    measurements: { type: Schema.Types.Mixed, default: {} },
    deliveryAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true },
    },
    deliveryType: {
      type: String,
      enum: ["Normal Delivery", "Fast Delivery", "Standard Creation", "Fast Creation"],
      default: "Normal Delivery",
    },
    expectedDeliveryDate: { type: Date, default: null },
    basePrice: { type: Number, required: true },
    customizationCharges: { type: Number, default: 0 },
    fastCreationCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["COD", "ONLINE"], required: true },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Processing", "In Production", "Ready", "Shipped", "Delivered", "Cancelled"],
      default: "Confirmed",
    },
    stripeSessionId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
