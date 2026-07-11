const mongoose = require("mongoose");
const Outfit = require("../models/outfitModel");
const Cloth = require("../models/clothModel");

// Fields that are safe for a client to set directly on an Outfit.
// `items` is validated separately below since it needs an ownership check.
const EDITABLE_FIELDS = ["name", "occasion"];

// ── helper: make sure every item id belongs to this user and isn't deleted ──
const validateItemsBelongToUser = async (itemIds, userId) => {
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return { valid: false, message: "An outfit needs at least one wardrobe item" };
  }

  const count = await Cloth.countDocuments({
    _id: { $in: itemIds },
    user: userId,
    isDeleted: false,
  });

  if (count !== itemIds.length) {
    return { valid: false, message: "One or more selected items are invalid or no longer in your wardrobe" };
  }

  return { valid: true };
};

// ── CREATE OUTFIT ────────────────────────────────────────────
// POST /api/outfits   body: { name, occasion, items: [clothId, ...], source }
const createOutfit = async (req, res) => {
  try {
    const { name, occasion, items, source } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Outfit name is required" });
    }

    const check = await validateItemsBelongToUser(items, req.userId);
    if (!check.valid) return res.status(400).json({ message: check.message });

    const outfit = await Outfit.create({
      user: req.userId,
      name: name.trim(),
      items,
      occasion: occasion || "Casual",
      source: source === "ai" ? "ai" : "manual",
    });

    const populated = await outfit.populate("items");
    return res.status(201).json({ message: "Outfit saved", outfit: populated });
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      const fieldErrors = Object.fromEntries(
        Object.entries(err.errors).map(([field, e]) => [field, e.message])
      );
      return res.status(400).json({ message: "Some fields were invalid", fieldErrors });
    }
    return res.status(500).json({ message: "Something went wrong while saving the outfit" });
  }
};

// ── GET ALL OUTFITS (for the logged-in user) ─────────────────
// GET /api/outfits?occasion=Work&sort=recent&favorite=true&search=gala
const getOutfits = async (req, res) => {
  try {
    const { occasion, sort, favorite, search } = req.query;

    const filter = { user: req.userId };
    if (occasion && occasion !== "All") filter.occasion = occasion;
    if (favorite === "true") filter.isFavorite = true;

    // Single search box on the Favorites page matches either the outfit
    // name or its occasion label (e.g. typing "formal" finds Formal outfits).
    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: regex }, { occasion: regex }];
    }

    // "Recently Modified" (default) uses updatedAt; also support name A→Z
    const sortMap = {
      recent: { updatedAt: -1 },
      oldest: { updatedAt: 1 },
      name: { name: 1 },
    };
    const sortOption = sortMap[sort] || sortMap.recent;

    const outfits = await Outfit.find(filter).sort(sortOption).populate("items");
    return res.status(200).json({ outfits, count: outfits.length });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── FAVORITE STATS ────────────────────────────────────────────
// GET /api/outfits/favorites/stats
// Powers the three summary cards on the Favorites page. Computed live
// (not cached) since favoriting/unfavoriting and wear counts change often.
const getFavoriteStats = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const [result] = await Outfit.aggregate([
      { $match: { user: userObjectId, isFavorite: true } },
      {
        $facet: {
          totals: [
            { $group: { _id: null, savedOutfits: { $sum: 1 }, totalTimesWorn: { $sum: "$timesWorn" } } },
          ],
          topOccasion: [
            { $group: { _id: "$occasion", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 1 },
          ],
        },
      },
    ]);

    const totals = result?.totals?.[0] || { savedOutfits: 0, totalTimesWorn: 0 };

    return res.status(200).json({
      savedOutfits: totals.savedOutfits,
      totalTimesWorn: totals.totalTimesWorn,
      topOccasion: result?.topOccasion?.[0]?._id || null,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading favorite stats" });
  }
};

// ── GET ONE OUTFIT ────────────────────────────────────────────
// GET /api/outfits/:id
const getOutfitById = async (req, res) => {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, user: req.userId }).populate("items");
    if (!outfit) return res.status(404).json({ message: "Outfit not found" });
    return res.status(200).json({ outfit });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── UPDATE OUTFIT ─────────────────────────────────────────────
// PATCH /api/outfits/:id   body: any of { name, occasion, items }
const updateOutfit = async (req, res) => {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, user: req.userId });
    if (!outfit) return res.status(404).json({ message: "Outfit not found" });

    if (req.body.items !== undefined) {
      const check = await validateItemsBelongToUser(req.body.items, req.userId);
      if (!check.valid) return res.status(400).json({ message: check.message });
      outfit.items = req.body.items;
    }

    EDITABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) outfit[field] = req.body[field];
    });

    await outfit.save();
    const populated = await outfit.populate("items");
    return res.status(200).json({ message: "Outfit updated", outfit: populated });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── TOGGLE FAVORITE ───────────────────────────────────────────
// PATCH /api/outfits/:id/favorite
const toggleFavorite = async (req, res) => {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, user: req.userId });
    if (!outfit) return res.status(404).json({ message: "Outfit not found" });

    outfit.isFavorite = !outfit.isFavorite;
    await outfit.save();

    return res.status(200).json({ message: "Updated", outfit });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── DELETE OUTFIT ──────────────────────────────────────────────
// DELETE /api/outfits/:id
// Hard delete — unlike Cloth, the schema has no isDeleted flag for Outfit,
// and nothing else references an Outfit by id, so a real delete is safe.
const deleteOutfit = async (req, res) => {
  try {
    const outfit = await Outfit.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!outfit) return res.status(404).json({ message: "Outfit not found" });
    return res.status(200).json({ message: "Outfit deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  createOutfit,
  getOutfits,
  getFavoriteStats,
  getOutfitById,
  updateOutfit,
  toggleFavorite,
  deleteOutfit,
};