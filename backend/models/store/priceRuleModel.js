const mongoose = require("mongoose");
const { Schema } = mongoose;

const priceRuleSchema = new Schema(
  {
    clothingType: { type: String, required: true, unique: true, trim: true },
    basePrice: { type: Number, required: true, min: 0 },
    lengthPriceModifier: { type: Number, default: 200 },
    // Flat fee applied when the customer submits custom body measurements
    // instead of a standard size, covering the extra tailoring work.
    customMeasurementFee: { type: Number, default: 250 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PriceRule", priceRuleSchema);