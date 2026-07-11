const mongoose = require("mongoose");
const Cloth = require("../models/clothModel");
const Outfit = require("../models/outfitModel");
const { getUpcomingPlans } = require("./plannerService");

const UPCOMING_PLANS_LIMIT = 2; // shown on the Dashboard's "Upcoming Planned Outfits" card


const CLOTH_CATEGORIES = ["Top", "Bottom", "Dress", "Hijab", "Foot Wears", "Bags", "Accessories"];

const DEFAULT_RECENT_LIMIT = 5;
const MAX_RECENT_LIMIT = 20;


const formatGroupedCounts = (rows, keyName) => {
  return rows
    .map((row) => ({ [keyName]: row._id, count: row.count }))
    .sort((a, b) => b.count - a.count || String(a[keyName]).localeCompare(String(b[keyName])));
};


const fillMissingCategories = (rows) => {
  const counts = Object.fromEntries(rows.map((r) => [r.category, r.count]));
  return CLOTH_CATEGORIES.map((category) => ({
    category,
    count: counts[category] || 0,
  }));
};


const getClothStats = async (userId, recentLimit) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [result] = await Cloth.aggregate([
    { $match: { user: userObjectId } },
    {
      $facet: {
       
        counts: [{ $group: { _id: "$isDeleted", count: { $sum: 1 } } }],

        favorites: [
          { $match: { isDeleted: false, isFavorite: true } },
          { $count: "count" },
        ],

        byCategory: [
          { $match: { isDeleted: false } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ],

        bySeason: [
          { $match: { isDeleted: false } },
          { $group: { _id: { $ifNull: ["$season", "Unspecified"] }, count: { $sum: 1 } } },
        ],

        byOccasion: [
          { $match: { isDeleted: false } },
          { $group: { _id: { $ifNull: ["$occasion", "Unspecified"] }, count: { $sum: 1 } } },
        ],

        byColor: [
          { $match: { isDeleted: false } },
          { $group: { _id: { $ifNull: ["$color.primary", "Unspecified"] }, count: { $sum: 1 } } },
        ],

        recent: [
          { $match: { isDeleted: false } },
          { $sort: { createdAt: -1 } },
          { $limit: recentLimit },
          {
            $project: {
              _id: 1,
              name: 1,
              category: 1,
              image: 1,
              color: 1,
              season: 1,
              occasion: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
  ]);

    
  const counts = result?.counts || [];
  const activeClothes = counts.find((c) => c._id === false)?.count || 0;
  const archivedClothes = counts.find((c) => c._id === true)?.count || 0;

  return {
    totalClothes: activeClothes + archivedClothes,
    activeClothes,
    archivedClothes,
    favoriteClothes: result?.favorites?.[0]?.count || 0,
    categoryStats: fillMissingCategories(formatGroupedCounts(result?.byCategory || [], "category")),
    seasonStats: formatGroupedCounts(result?.bySeason || [], "season"),
    occasionStats: formatGroupedCounts(result?.byOccasion || [], "occasion"),
    colorStats: formatGroupedCounts(result?.byColor || [], "color"),
    recentClothes: result?.recent || [],
  };
};

// Outfits don't have a soft-delete flag on the schema, so this is a
// straight count of every outfit the user has created.
const getOutfitCount = async (userId) => {
  return Outfit.countDocuments({ user: userId });
};

/**
 * Composes the individual stat pieces above into the single payload the
 * dashboard's summary endpoint returns. Kept as its own function (rather
 * than inlined in the controller) so it's reusable if another endpoint
 * ever needs the same data, and so the controller stays a thin HTTP layer.
 */
const getDashboardSummary = async (userId, options = {}) => {
  const recentLimit = Math.min(
    Math.max(parseInt(options.recentLimit, 10) || DEFAULT_RECENT_LIMIT, 1),
    MAX_RECENT_LIMIT
  );

  const [clothStats, outfitCount, upcomingPlans] = await Promise.all([
    getClothStats(userId, recentLimit),
    getOutfitCount(userId),
    getUpcomingPlans(userId, UPCOMING_PLANS_LIMIT),
  ]);

  return {
    totalClothes: clothStats.totalClothes,
    favoriteClothesCount: clothStats.favoriteClothes,
    outfitCount,
    upcomingPlans,
    recentClothes: clothStats.recentClothes,
    categoryStats: clothStats.categoryStats,
    seasonStats: clothStats.seasonStats,
    occasionStats: clothStats.occasionStats,
    colorStats: clothStats.colorStats,
    storageStats: {
      totalClothes: clothStats.totalClothes,
      activeClothes: clothStats.activeClothes,
      archivedClothes: clothStats.archivedClothes,
      favoriteClothes: clothStats.favoriteClothes,
    },
  };
};

module.exports = {
  CLOTH_CATEGORIES,
  DEFAULT_RECENT_LIMIT,
  MAX_RECENT_LIMIT,
  getClothStats,
  getOutfitCount,
  getDashboardSummary,
};