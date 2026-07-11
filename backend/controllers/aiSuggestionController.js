const AiSuggestion = require("../models/aiSuggestionModel");
const Outfit = require("../models/outfitModel");
const { generateSuggestionsForUser } = require("../services/aiOutfitService");

const DEFAULT_HISTORY_LIMIT = 10;
const MAX_HISTORY_LIMIT = 50;

const isKnownOccasion = (occasion) =>
  [
    "Casual", "Formal", "Office", "College", "Wedding", "Party",
    "Traditional", "Travel", "Sports", "Work", "Eid", "Other",
  ].includes(occasion);

const ensureSuggestionSavedAsOutfit = async (suggestionDoc, entry, { name, favorite } = {}) => {
  if (entry.savedAsOutfit) {
    const existing = await Outfit.findById(entry.savedAsOutfit).populate("items");
    if (existing) {
      if (favorite && !existing.isFavorite) {
        existing.isFavorite = true;
        await existing.save();
      }
      return existing;
    }
  }

  const outfit = await Outfit.create({
    user: suggestionDoc.user,
    name: (name && name.trim()) || `${entry.label || suggestionDoc.occasion} Outfit`,
    items: entry.items,
    occasion: isKnownOccasion(suggestionDoc.occasion) ? suggestionDoc.occasion : "Other",
    source: "ai",
    aiSuggestion: suggestionDoc._id,
    isFavorite: !!favorite,
  });

  entry.savedAsOutfit = outfit._id;
  await suggestionDoc.save();

  return outfit.populate("items");
};

const generateSuggestions = async (req, res) => {
  try {
    const { occasion, season, preferredColors, categories, suggestionCount } = req.body;

    const result = await generateSuggestionsForUser(req.userId, {
      occasion,
      season,
      preferredColors,
      categories,
      suggestionCount,
    });

    if (!result.success) {
      return res.status(result.status || 500).json({ message: result.message, suggestionId: result.suggestionId });
    }

    return res.status(201).json({ message: "Suggestions generated", suggestion: result.suggestion });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while generating suggestions" });
  }
};

const regenerateSuggestions = async (req, res) => {
  try {
    const previous = await AiSuggestion.findOne({ _id: req.params.id, user: req.userId });
    if (!previous) return res.status(404).json({ message: "Suggestion batch not found" });

    const result = await generateSuggestionsForUser(req.userId, {
      occasion: previous.occasion,
      season: previous.season,
      preferredColors: previous.preferredColors,
      categories: previous.categories,
      suggestionCount: previous.suggestions?.length || undefined,
    });

    if (!result.success) {
      return res.status(result.status || 500).json({ message: result.message, suggestionId: result.suggestionId });
    }

    return res.status(201).json({ message: "New suggestions generated", suggestion: result.suggestion });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while regenerating suggestions" });
  }
};

const saveSuggestedOutfit = async (req, res) => {
  try {
    const { suggestionIndex, name } = req.body;
    const suggestion = await AiSuggestion.findOne({ _id: req.params.id, user: req.userId });
    if (!suggestion) return res.status(404).json({ message: "Suggestion batch not found" });

    const entry = suggestion.suggestions[suggestionIndex];
    if (!entry) return res.status(400).json({ message: "Invalid suggestion index" });

    const outfit = await ensureSuggestionSavedAsOutfit(suggestion, entry, { name });
    return res.status(201).json({ message: "Outfit saved", outfit });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while saving the outfit" });
  }
};

const toggleSuggestionFavorite = async (req, res) => {
  try {
    const { suggestionIndex } = req.body;
    const suggestion = await AiSuggestion.findOne({ _id: req.params.id, user: req.userId });
    if (!suggestion) return res.status(404).json({ message: "Suggestion batch not found" });

    const entry = suggestion.suggestions[suggestionIndex];
    if (!entry) return res.status(400).json({ message: "Invalid suggestion index" });

    let outfit;
    if (!entry.savedAsOutfit) {
      outfit = await ensureSuggestionSavedAsOutfit(suggestion, entry, { favorite: true });
      entry.isFavorite = true;
    } else {
      outfit = await Outfit.findById(entry.savedAsOutfit).populate("items");
      outfit.isFavorite = !outfit.isFavorite;
      await outfit.save();
      entry.isFavorite = outfit.isFavorite;
    }
    await suggestion.save();

    return res.status(200).json({ message: "Updated", outfit });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while updating favorite" });
  }
};

const getHistory = async (req, res) => {
  try {
    const limit = Math.min(MAX_HISTORY_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_HISTORY_LIMIT));
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const filter = { user: req.userId };

    const [batches, total] = await Promise.all([
      AiSuggestion.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("suggestions.items")
        .select("-rawAiResponse -contextItemsSent"),
      AiSuggestion.countDocuments(filter),
    ]);

    return res.status(200).json({ batches, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading history" });
  }
};

const getSuggestionById = async (req, res) => {
  try {
    const suggestion = await AiSuggestion.findOne({ _id: req.params.id, user: req.userId })
      .populate("suggestions.items")
      .select("-rawAiResponse");
    if (!suggestion) return res.status(404).json({ message: "Suggestion batch not found" });
    return res.status(200).json({ suggestion });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteSuggestion = async (req, res) => {
  try {
    const suggestion = await AiSuggestion.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!suggestion) return res.status(404).json({ message: "Suggestion batch not found" });
    return res.status(200).json({ message: "Suggestion removed" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  generateSuggestions,
  regenerateSuggestions,
  saveSuggestedOutfit,
  toggleSuggestionFavorite,
  getHistory,
  getSuggestionById,
  deleteSuggestion,
};
