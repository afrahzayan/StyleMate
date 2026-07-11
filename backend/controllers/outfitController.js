const mongoose = require("mongoose");
const Outfit = require("../models/outfitModel");
const Cloth = require("../models/clothModel");

const EDITABLE_FIELDS = ["name", "occasion"];

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

const getOutfits = async (req, res) => {
  try {
    const { occasion, sort, favorite, search } = req.query;

    const filter = { user: req.userId };
    if (occasion && occasion !== "All") filter.occasion = occasion;
    if (favorite === "true") filter.isFavorite = true;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: regex }, { occasion: regex }];
    }

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
