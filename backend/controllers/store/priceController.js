const { calculatePrice, PriceEngineError } = require("../../services/store/priceEngineService");
const { getPriceRules, getOptionCatalog } = require("../../services/store/priceRuleCasheService");

// POST /api/customization/price/calculate
// body: { clothingType, selections }
// Stateless: takes the full selection object, returns the computed
// estimated-price breakdown. There is no checkout to reconcile against —
// this is purely a live cost estimate for the design studio.
const calculateLivePrice = async (req, res) => {
  try {
    const { clothingType, selections = {} } = req.body;

    if (!clothingType) {
      return res.status(400).json({ message: "clothingType is required" });
    }

    const [priceRules, optionCatalog] = await Promise.all([getPriceRules(), getOptionCatalog()]);

    const result = calculatePrice({ clothingType, selections, priceRules, optionCatalog });
    res.json(result);
  } catch (err) {
    if (err instanceof PriceEngineError) {
      return res.status(400).json({ message: err.message });
    }
    console.log("[calculateLivePrice] error:", err.message);
    res.status(500).json({ message: "Failed to calculate price" });
  }
};

module.exports = { calculateLivePrice };