const CustomerDesign = require("../../models/store/customerDesignModel");
const PriceRule = require("../../models/store/priceRuleModel");

// GET /api/store/designs/featured
const getFeaturedDesigns = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const designs = await CustomerDesign.find({ isActive: true, isFeatured: true })
      .sort({ ratingAvg: -1, createdAt: -1 })
      .limit(limit);
    res.json(designs);
  } catch (err) {
    console.log("[getFeaturedDesigns] error:", err.message);
    res.status(500).json({ message: "Failed to fetch featured designs" });
  }
};

// GET /api/store/designs/recent
const getRecentDesigns = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const designs = await CustomerDesign.find({ isActive: true }).sort({ createdAt: -1 }).limit(limit);
    res.json(designs);
  } catch (err) {
    console.log("[getRecentDesigns] error:", err.message);
    res.status(500).json({ message: "Failed to fetch recently designed dresses" });
  }
};

// GET /api/store/categories
// "Categories" here are the design/clothing types the studio supports
// (e.g. Saree, Lehenga, Gown), sourced from active price rules — there is
// no separate sellable-product category collection anymore.
const getDesignCategories = async (req, res) => {
  try {
    const rules = await PriceRule.find({ isActive: true }).sort({ clothingType: 1 }).select("clothingType basePrice");
    res.json(rules.map((r) => ({ clothingType: r.clothingType, basePrice: r.basePrice })));
  } catch (err) {
    console.log("[getDesignCategories] error:", err.message);
    res.status(500).json({ message: "Failed to fetch design categories" });
  }
};

module.exports = { getFeaturedDesigns, getRecentDesigns, getDesignCategories };