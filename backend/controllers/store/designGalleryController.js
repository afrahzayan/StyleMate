const Order = require("../../models/store/orderModel");
const PriceRule = require("../../models/store/priceRuleModel");

// GET /api/store/designs/recent
// Returns recently completed/placed customer orders for the store home showcase.
const getRecentDesigns = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const orders = await Order.find({ orderStatus: { $ne: "Cancelled" } })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(limit);

    const designs = orders.map((o) => ({
      _id: o._id,
      title: o.title || `${o.clothingType} Custom Design`,
      clothingType: o.clothingType,
      price: o.totalAmount,
      previewImage: o.previewImage || {},
      selections: o.selections || {},
      user: o.user?.name || "Customer",
      createdAt: o.createdAt,
    }));

    res.json(designs);
  } catch (err) {
    console.log("[getRecentDesigns] error:", err.message);
    res.status(500).json({ message: "Failed to fetch recently designed dresses" });
  }
};

// GET /api/store/categories
// "Categories" here are the design/clothing types the studio supports
// (e.g. Saree, Lehenga, Gown), sourced from active price rules.
const getDesignCategories = async (req, res) => {
  try {
    const rules = await PriceRule.find({ isActive: true }).sort({ clothingType: 1 }).select("clothingType basePrice");
    res.json(rules.map((r) => ({ clothingType: r.clothingType, basePrice: r.basePrice })));
  } catch (err) {
    console.log("[getDesignCategories] error:", err.message);
    res.status(500).json({ message: "Failed to fetch design categories" });
  }
};

module.exports = { getRecentDesigns, getDesignCategories };