const mongoose = require("mongoose");
const Cloth = require("../models/clothModel");
const AiSuggestion = require("../models/aiSuggestionModel");
const { generateOutfitSuggestions } = require("./groqOutfitService");

const DEFAULT_SUGGESTION_COUNT = 4;
const MIN_SUGGESTION_COUNT = 3;
const MAX_SUGGESTION_COUNT = 5;

const MAX_ITEMS_PER_OUTFIT = 6;
const MAX_WARDROBE_CONTEXT_ITEMS = 120;
const MAX_PER_CATEGORY = 25;
const MIN_WARDROBE_ITEMS_REQUIRED = 2;

const CLOTH_CATEGORIES = ["Top", "Bottom", "Dress", "Hijab", "Foot Wears", "Bags", "Accessories"];

const buildWardrobeContext = async (userId, { categories, preferredColors } = {}) => {
  const filter = { user: userId, isDeleted: false };
  if (Array.isArray(categories) && categories.length > 0) {
    filter.category = { $in: categories.filter((c) => CLOTH_CATEGORIES.includes(c)) };
  }

  const cloths = await Cloth.find(filter)
    .select("name category subCategory color occasion season formality style")
    .sort({ updatedAt: -1 })
    .lean();

  const byCategory = {};
  for (const cloth of cloths) {
    (byCategory[cloth.category] ||= []).push(cloth);
  }

  const balanced = [];
  for (const category of Object.keys(byCategory)) {
    balanced.push(...byCategory[category].slice(0, MAX_PER_CATEGORY));
  }
  const trimmed = balanced.slice(0, MAX_WARDROBE_CONTEXT_ITEMS);

  const wardrobeContext = trimmed.map((c) => ({
    id: String(c._id),
    name: c.name,
    category: c.category,
    subCategory: c.subCategory || undefined,
    color: c.color?.primary || undefined,
    occasion: c.occasion || undefined,
    season: c.season || undefined,
    formality: c.formality || undefined,
    style: c.style || undefined,
  }));

  return { wardrobeContext, totalWardrobeSize: cloths.length };
};

const validateAndResolveOutfits = (rawOutfits, wardrobeContext) => {
  const validIds = new Set(wardrobeContext.map((c) => c.id));
  const seenItemSets = new Set();

  if (!Array.isArray(rawOutfits)) return [];

  const cleaned = [];

  for (const candidate of rawOutfits) {
    if (!candidate || !Array.isArray(candidate.items)) continue;

    const dedupedIds = [...new Set(candidate.items.map(String))]
      .filter((id) => validIds.has(id))
      .slice(0, MAX_ITEMS_PER_OUTFIT);

    if (dedupedIds.length === 0) continue;

    const signature = [...dedupedIds].sort().join(",");
    if (seenItemSets.has(signature)) continue;
    seenItemSets.add(signature);

    let confidence = Number(candidate.confidence);
    if (!Number.isFinite(confidence)) confidence = 75;
    confidence = Math.max(0, Math.min(100, Math.round(confidence)));

    cleaned.push({
      items: dedupedIds,
      label: typeof candidate.label === "string" ? candidate.label.trim().slice(0, 40) : "",
      explanation:
        typeof candidate.explanation === "string" ? candidate.explanation.trim().slice(0, 500) : "",
      confidence,
    });
  }

  return cleaned;
};

const generateSuggestionsForUser = async (
  userId,
  { occasion, season, preferredColors = [], categories = [], suggestionCount } = {}
) => {
  if (!occasion || !String(occasion).trim()) {
    return { success: false, status: 400, message: "Occasion is required" };
  }

  const count = Math.max(
    MIN_SUGGESTION_COUNT,
    Math.min(MAX_SUGGESTION_COUNT, Number(suggestionCount) || DEFAULT_SUGGESTION_COUNT)
  );

  const { wardrobeContext, totalWardrobeSize } = await buildWardrobeContext(userId, {
    categories,
    preferredColors,
  });

  if (totalWardrobeSize < MIN_WARDROBE_ITEMS_REQUIRED) {
    return {
      success: false,
      status: 400,
      message: "Add at least a couple of items to your wardrobe before requesting AI suggestions.",
    };
  }

  let raw = null;
  let parsed = null;
  let cleanedOutfits = [];
  let status = "success";
  let failureReason = null;

  try {
    const result = await generateOutfitSuggestions({
      wardrobeContext,
      occasion,
      season,
      preferredColors,
      suggestionCount: count,
    });
    raw = result.raw;
    parsed = result.parsed;
    cleanedOutfits = validateAndResolveOutfits(parsed?.outfits, wardrobeContext);
    if (cleanedOutfits.length === 0) {
      status = "failed";
      failureReason = "The AI didn't return any usable combinations from your wardrobe. Try again or broaden your filters.";
      console.log("[ai-outfit] cleanedOutfits empty — parsed outfits:", JSON.stringify(parsed?.outfits));
    } else if (cleanedOutfits.length < count) {
      status = "partial";
    }
  } catch (err) {
    console.log("[ai-outfit] generation failed:", err.message);
    status = "failed";
    failureReason = err.message;
  }

  const suggestionDoc = await AiSuggestion.create({
    user: userId,
    occasion,
    season: season || null,
    preferredColors,
    categories,
    contextItemsSent: wardrobeContext.map((c) => ({ cloth: c.id, name: c.name, category: c.category })),
    rawAiResponse: raw || "",
    suggestions: cleanedOutfits.map((o) => ({
      items: o.items,
      label: o.label,
      explanation: o.explanation,
      confidence: o.confidence,
    })),
    status,
    failureReason,
    aiMeta: { provider: "groq", model: process.env.GROQ_TEXT_MODEL || "openai/gpt-oss-120b", generatedAt: new Date() },
  });

  if (status === "failed") {
    return { success: false, status: 502, message: failureReason || "AI suggestion generation failed", suggestionId: suggestionDoc._id };
  }

  const populated = await AiSuggestion.findById(suggestionDoc._id).populate("suggestions.items");

  return { success: true, suggestion: populated };
};

module.exports = {
  generateSuggestionsForUser,
  buildWardrobeContext,
  validateAndResolveOutfits,
  DEFAULT_SUGGESTION_COUNT,
  MIN_SUGGESTION_COUNT,
  MAX_SUGGESTION_COUNT,
};
