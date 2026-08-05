/**
 * Seeds the CustomizationOption catalog and PriceRule base prices for the
 * Design Studio. Safe to re-run — upserts by (group, value) / clothingType.
 *
 * Run with:  node backend/scripts/seedCustomizationOptions.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const CustomizationOption = require("../models/store/customizationonOptionModel");
const PriceRule = require("../models/store/priceRuleModel");

// group -> [{ value, label, priceModifier }]
const CATALOG = {
  gender: [
    { value: "Men", label: "Men", image: "StyleMate/onboarding/gender/male" },
    { value: "Women", label: "Women", image: "StyleMate/onboarding/gender/female" },
    { value: "Unisex", label: "Unisex", image: "StyleMate/onboarding/gender/unisex" },
  ],
  ageGroup: [
    { value: "Kids", label: "Kids", image: "StyleMate/onboarding/ageGroup/kids" },
    { value: "Teen", label: "Teen", image: "StyleMate/onboarding/ageGroup/teen" },
    { value: "Adult", label: "Adult", image: "StyleMate/onboarding/ageGroup/adult" },
  ],
  occasion: [
    { value: "Casual", label: "Casual" },
    { value: "Party", label: "Party" },
    { value: "Wedding", label: "Wedding" },
    { value: "Formal", label: "Formal" },
    { value: "Festive", label: "Festive" },
  ],
  dressCategory: [
    { value: "Western", label: "Western" },
    { value: "Ethnic", label: "Ethnic" },
    { value: "Indo-Western", label: "Indo-Western" },
  ],
  clothingType: [
    { value: "Shirt", label: "Shirt", image: "StyleMate/onboarding/clothing/shirt", compatibleWith: ["Men", "Women", "Unisex"] },
    { value: "T-Shirt", label: "T-Shirt", image: "StyleMate/onboarding/clothing/tshirt", compatibleWith: ["Men", "Women", "Unisex"] },
    { value: "Kurta", label: "Kurta", image: "StyleMate/onboarding/clothing/kurta", compatibleWith: ["Men"] },
    { value: "Kurti", label: "Kurti", image: "StyleMate/onboarding/clothing/kurti", compatibleWith: ["Women"] },
    { value: "Gown", label: "Gown", image: "StyleMate/onboarding/clothing/gown", compatibleWith: ["Women"] },
    { value: "Dress", label: "Dress", image: "StyleMate/onboarding/clothing/dress", compatibleWith: ["Women"] },
  ],
  fit: [
    { value: "Slim", label: "Slim Fit" },
    { value: "Regular", label: "Regular Fit" },
    { value: "Loose", label: "Loose Fit" },
  ],
  fabric: [
    { value: "Cotton", label: "Cotton", priceModifier: 0 },
    { value: "Linen", label: "Linen", priceModifier: 150 },
    { value: "Silk", label: "Silk", priceModifier: 500 },
    { value: "Rayon", label: "Rayon", priceModifier: 100 },
    { value: "Denim", label: "Denim", priceModifier: 200 },
  ],
  color: [
    { value: "White", label: "Pure White", hex: "#ffffff" },
    { value: "Black", label: "Classic Black", hex: "#18181b" },
    { value: "Light Blue", label: "Light Blue", hex: "#93c5fd" },
    { value: "Blue", label: "Royal Blue", hex: "#2563eb" },
    { value: "Navy Blue", label: "Navy Blue", hex: "#1e3a8a" },
    { value: "Pastel Red", label: "Pastel Red", hex: "#fca5a5" },
    { value: "Red", label: "Crimson Red", hex: "#dc2626" },
    { value: "Dark Red", label: "Dark Red", hex: "#7f1d1d" },
    { value: "Pastel Green", label: "Pastel Green", hex: "#86efac" },
    { value: "Green", label: "Emerald Green", hex: "#10b981" },
    { value: "Dark Green", label: "Dark Green", hex: "#14532d" },
    { value: "Yellow", label: "Sunny Yellow", hex: "#fde047" },
    { value: "Pink", label: "Soft Pink", hex: "#f472b6" },
    { value: "Purple", label: "Royal Purple", hex: "#c084fc" },
    { value: "Gold", label: "Metallic Gold", hex: "#fbbf24" },
  ],
  sleeveType: [
    { value: "Sleeveless", label: "Sleeveless", priceModifier: 0 },
    { value: "Half Sleeve", label: "Half Sleeve", priceModifier: 50 },
    { value: "Three Quarter", label: "Three Quarter", priceModifier: 75 },
    { value: "Full Sleeve", label: "Full Sleeve", priceModifier: 100 },
    { value: "Bell Sleeve", label: "Bell Sleeve", priceModifier: 150 },
    { value: "Puff Sleeve", label: "Puff Sleeve", priceModifier: 150 },
  ],
  neckType: [
    { value: "Round", label: "Round Neck", priceModifier: 0 },
    { value: "V Neck", label: "V Neck", priceModifier: 0 },
    { value: "Boat Neck", label: "Boat Neck", priceModifier: 50 },
    { value: "Square Neck", label: "Square Neck", priceModifier: 50 },
    { value: "Collar", label: "Collar", priceModifier: 75 },
  ],
  length: [
    { value: "Short", label: "Short" },
    { value: "Knee", label: "Knee Length" },
    { value: "Midi", label: "Midi" },
    { value: "Full", label: "Full Length" },
    { value: "Custom", label: "Custom Length" },
  ],
  pattern: [
    { value: "Plain", label: "Plain", priceModifier: 0 },
    { value: "Floral", label: "Floral", priceModifier: 150 },
    { value: "Printed", label: "Printed", priceModifier: 120 },
    { value: "Checked", label: "Checked", priceModifier: 100 },
    { value: "Striped", label: "Striped", priceModifier: 100 },
  ],
  embroidery: [
    { value: "None", label: "None", priceModifier: 0 },
    { value: "Light", label: "Light", priceModifier: 200 },
    { value: "Medium", label: "Medium", priceModifier: 400 },
    { value: "Heavy", label: "Heavy", priceModifier: 700 },
  ],
  threadWork: [
    { value: "None", label: "None", priceModifier: 0 },
    { value: "Gold", label: "Gold Thread", priceModifier: 350 },
    { value: "Silver", label: "Silver Thread", priceModifier: 300 },
    { value: "Colored", label: "Colored Thread", priceModifier: 200 },
  ],
  stoneWork: [
    { value: "None", label: "None", priceModifier: 0 },
    { value: "Light", label: "Light", priceModifier: 250 },
    { value: "Medium", label: "Medium", priceModifier: 450 },
    { value: "Heavy", label: "Heavy", priceModifier: 800 },
  ],
};

const PRICE_RULES = [
  { clothingType: "Shirt", basePrice: 799, lengthPriceModifier: 150, customMeasurementFee: 200 },
  { clothingType: "T-Shirt", basePrice: 499, lengthPriceModifier: 100, customMeasurementFee: 150 },
  { clothingType: "Kurta", basePrice: 899, lengthPriceModifier: 150, customMeasurementFee: 200 },
  { clothingType: "Kurti", basePrice: 999, lengthPriceModifier: 200, customMeasurementFee: 250 },
  { clothingType: "Gown", basePrice: 2499, lengthPriceModifier: 400, customMeasurementFee: 400 },
  { clothingType: "Dress", basePrice: 1299, lengthPriceModifier: 250, customMeasurementFee: 250 },
];

async function seed() {
  await connectDB();

  // Purge removed clothing types
  const removedTypes = ["Polo Shirt", "Formal Shirt", "Jacket", "Hoodie"];
  await CustomizationOption.deleteMany({ group: "clothingType", value: { $in: removedTypes } });
  await PriceRule.deleteMany({ clothingType: { $in: removedTypes } });

  let upserted = 0;
  for (const [group, values] of Object.entries(CATALOG)) {
    for (let i = 0; i < values.length; i++) {
      const { value, label, priceModifier = 0, image = null, compatibleWith = [] } = values[i];

      await CustomizationOption.findOneAndUpdate(
        { group, value },
        { group, value, label, priceModifier, imagePublicId: image, compatibleWith, isActive: true, sortOrder: i },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      upserted++;
    }
  }

  for (const rule of PRICE_RULES) {
    await PriceRule.findOneAndUpdate(
      { clothingType: rule.clothingType },
      { ...rule, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded ${upserted} customization options and ${PRICE_RULES.length} price rules. Cleaned up removed types.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});