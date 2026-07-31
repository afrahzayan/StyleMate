const mongoose = require("mongoose");
const { Schema } = mongoose;

// Groups asked in the pre-studio questionnaire (Store Home -> "Start
// Designing" -> Question Wizard) come first; groups edited live inside the
// two-panel Design Studio come after. Order here only documents intent —
// callers decide their own step/panel layout.
const OPTION_GROUPS = [
  // Question Wizard
  "gender",
  "ageGroup",
  "occasion",
  "dressCategory",
  "clothingType",
  "fit",
  // Design Studio (live customization panel)
  "fabric",
  "color",
  "sleeveType",
  "neckType",
  "length",
  "pattern",
  "embroidery",
  "threadWork",
  "stoneWork",
  // legacy groups kept for backward compatibility with existing designs
  "pocket",
  "buttonType",
];

const customizationOptionSchema = new Schema(
  {
    group: { type: String, required: true, enum: OPTION_GROUPS, index: true },
    value: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    priceModifier: { type: Number, default: 0 },
    layerAsset: { type: String, default: null },
    // Cloudinary public_id for the questionnaire card image (e.g.
    // "StyleMate/onboarding/gender/male"). Distinct from layerAsset, which is
    // the transparent PNG used to compose the live Design Studio preview.
    imagePublicId: { type: String, default: null },
    compatibleWith: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

customizationOptionSchema.index({ group: 1, isActive: 1, sortOrder: 1 });
customizationOptionSchema.index({ group: 1, value: 1 }, { unique: true });

module.exports = mongoose.model("CustomizationOption", customizationOptionSchema);
module.exports.OPTION_GROUPS = OPTION_GROUPS;