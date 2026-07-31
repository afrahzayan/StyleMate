const CustomizationOption = require("../../models/store/customizationonOptionModel");
const CustomerDesign = require("../../models/store/customerDesignModel");

// GET /api/customization/options?group=sleeveType
const getOptions = async (req, res) => {
  try {
    const { group } = req.query;
    const filter = { isActive: true };
    if (group) filter.group = group;

    const options = await CustomizationOption.find(filter).sort({ group: 1, sortOrder: 1 });
    res.json(options);
  } catch (err) {
    console.log("[getOptions] error:", err.message);
    res.status(500).json({ message: "Failed to fetch customization options" });
  }
};

// GET /api/customization/designs/popular
const getPopularDesigns = async (req, res) => {
  try {
    const designs = await CustomerDesign.find({ isActive: true, isFeatured: true }).sort({
      ratingAvg: -1,
      createdAt: -1,
    });
    res.json(designs);
  } catch (err) {
    console.log("[getPopularDesigns] error:", err.message);
    res.status(500).json({ message: "Failed to fetch popular designs" });
  }
};

module.exports = { getOptions, getPopularDesigns };