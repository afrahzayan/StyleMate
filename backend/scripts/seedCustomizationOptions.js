/**
 * Seeds the CustomizationOption catalog and PriceRule base prices for the
 * Design Studio. Safe to re-run — upserts by (group, value) / clothingType.
 *
 * Run with:  node backend/scripts/seedCustomizationOptions.js
 *
 * Values with a `layer: true` flag get a layerAsset public_id assigned via
 * the same folder convention used by cloudinaryLayers.js, so the moment a
 * real PNG is uploaded to that public_id (see POST /api/customization/layer-assets),
 * it appears in the studio automatically — no further seeding needed.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { buildLayerPublicId } = require("../config/cloudinaryLayers");
const CustomizationOption = require("../models/store/customizationonOptionModel");
const PriceRule = require("../models/store/priceRuleModel");

// group -> [{ value, label, priceModifier, layer? }]
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
    { value: "Shirt", label: "Shirt", layer: true, image: "StyleMate/onboarding/clothing/shirt", compatibleWith: ["Men", "Women", "Unisex"] },
    { value: "T-Shirt", label: "T-Shirt", layer: true, image: "StyleMate/onboarding/clothing/tshirt", compatibleWith: ["Men", "Women", "Unisex"] },
    { value: "Kurta", label: "Kurta", layer: true, image: "StyleMate/onboarding/clothing/kurta", compatibleWith: ["Men"] },
    { value: "Kurti", label: "Kurti", layer: true, image: "StyleMate/onboarding/clothing/kurti", compatibleWith: ["Women"] },
    { value: "Gown", label: "Gown", layer: true, image: "StyleMate/onboarding/clothing/gown", compatibleWith: ["Women"] },
    { value: "Dress", label: "Dress", layer: true, image: "StyleMate/onboarding/clothing/dress", compatibleWith: ["Women"] },
  ],
  fit: [
    { value: "Slim", label: "Slim Fit" },
    { value: "Regular", label: "Regular Fit" },
    { value: "Loose", label: "Loose Fit" },
  ],
  fabric: [
    { value: "Cotton", label: "Cotton", priceModifier: 0, layer: true },
    { value: "Linen", label: "Linen", priceModifier: 150, layer: true },
    { value: "Silk", label: "Silk", priceModifier: 500, layer: true },
    { value: "Rayon", label: "Rayon", priceModifier: 100, layer: true },
    { value: "Denim", label: "Denim", priceModifier: 200, layer: true },
  ],
  color: [
    { value: "White", label: "Pure White", hex: "#ffffff", layer: true },
    { value: "Black", label: "Classic Black", hex: "#18181b", layer: true },
    { value: "Light Blue", label: "Light Blue", hex: "#93c5fd", layer: true },
    { value: "Blue", label: "Royal Blue", hex: "#2563eb", layer: true },
    { value: "Navy Blue", label: "Navy Blue", hex: "#1e3a8a", layer: true },
    { value: "Pastel Red", label: "Pastel Red", hex: "#fca5a5", layer: true },
    { value: "Red", label: "Crimson Red", hex: "#dc2626", layer: true },
    { value: "Dark Red", label: "Dark Red", hex: "#7f1d1d", layer: true },
    { value: "Pastel Green", label: "Pastel Green", hex: "#86efac", layer: true },
    { value: "Green", label: "Emerald Green", hex: "#10b981", layer: true },
    { value: "Dark Green", label: "Dark Green", hex: "#14532d", layer: true },
    { value: "Yellow", label: "Sunny Yellow", hex: "#fde047", layer: true },
    { value: "Pink", label: "Soft Pink", hex: "#f472b6", layer: true },
    { value: "Purple", label: "Royal Purple", hex: "#c084fc", layer: true },
    { value: "Gold", label: "Metallic Gold", hex: "#fbbf24", layer: true },
  ],
  sleeveType: [
    { value: "Sleeveless", label: "Sleeveless", priceModifier: 0 },
    { value: "Half Sleeve", label: "Half Sleeve", priceModifier: 50, layer: true },
    { value: "Three Quarter", label: "Three Quarter", priceModifier: 75, layer: true },
    { value: "Full Sleeve", label: "Full Sleeve", priceModifier: 100, layer: true },
    { value: "Bell Sleeve", label: "Bell Sleeve", priceModifier: 150, layer: true },
    { value: "Puff Sleeve", label: "Puff Sleeve", priceModifier: 150, layer: true },
  ],
  neckType: [
    { value: "Round", label: "Round Neck", priceModifier: 0, layer: true },
    { value: "V Neck", label: "V Neck", priceModifier: 0, layer: true },
    { value: "Boat Neck", label: "Boat Neck", priceModifier: 50, layer: true },
    { value: "Square Neck", label: "Square Neck", priceModifier: 50, layer: true },
    { value: "Collar", label: "Collar", priceModifier: 75, layer: true },
  ],
  length: [
    { value: "Short", label: "Short" },
    { value: "Knee", label: "Knee Length" },
    { value: "Midi", label: "Midi" },
    { value: "Full", label: "Full Length" },
    { value: "Custom", label: "Custom Length" },
  ],
  pattern: [
    { value: "Plain", label: "Plain", priceModifier: 0, layer: true },
    { value: "Floral", label: "Floral", priceModifier: 150, layer: true },
    { value: "Printed", label: "Printed", priceModifier: 120, layer: true },
    { value: "Checked", label: "Checked", priceModifier: 100, layer: true },
    { value: "Striped", label: "Striped", priceModifier: 100, layer: true },
  ],
  embroidery: [
    { value: "None", label: "None", priceModifier: 0 },
    { value: "Light", label: "Light", priceModifier: 200, layer: true },
    { value: "Medium", label: "Medium", priceModifier: 400, layer: true },
    { value: "Heavy", label: "Heavy", priceModifier: 700, layer: true },
  ],
  threadWork: [
    { value: "None", label: "None", priceModifier: 0 },
    { value: "Gold", label: "Gold Thread", priceModifier: 350, layer: true },
    { value: "Silver", label: "Silver Thread", priceModifier: 300, layer: true },
    { value: "Colored", label: "Colored Thread", priceModifier: 200, layer: true },
  ],
  stoneWork: [
    { value: "None", label: "None", priceModifier: 0 },
    { value: "Light", label: "Light", priceModifier: 250, layer: true },
    { value: "Medium", label: "Medium", priceModifier: 450, layer: true },
    { value: "Heavy", label: "Heavy", priceModifier: 800, layer: true },
  ],
};

const LAYER_GROUP_MAP = {
  clothingType: "base",
  fabric: "fabric",
  color: "color",
  sleeveType: "sleeveType",
  neckType: "neckType",
  pattern: "pattern",
  embroidery: "embroidery",
  threadWork: "threadWork",
  stoneWork: "stoneWork",
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
    const layerGroupKey = LAYER_GROUP_MAP[group];
    for (let i = 0; i < values.length; i++) {
      const { value, label, priceModifier = 0, layer, image = null, compatibleWith = [] } = values[i];
      const layerAsset = layer ? buildLayerPublicId(layerGroupKey, value) : null;

      await CustomizationOption.findOneAndUpdate(
        { group, value },
        { group, value, label, priceModifier, layerAsset, imagePublicId: image, compatibleWith, isActive: true, sortOrder: i },
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