const redisClient = require("../../config/redis");
const PriceRule = require("../../models/store/priceRuleModel");
const CustomizationOption = require("../../models/store/customizationonOptionModel");

const PRICE_RULES_KEY = "store:priceRules";
const OPTION_CATALOG_KEY = "store:optionCatalog";
const TTL_SECONDS = 60 * 60; // safety-net TTL; real invalidation happens on admin writes

async function getPriceRules() {
  try {
    const cached = await redisClient.get(PRICE_RULES_KEY);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.log("[priceRuleCache] Redis read failed, falling back to Mongo:", err.message);
  }

  const rules = await PriceRule.find({ isActive: true }).lean();
  try {
    await redisClient.set(PRICE_RULES_KEY, JSON.stringify(rules), "EX", TTL_SECONDS);
  } catch (err) {
    console.log("[priceRuleCache] Redis write failed:", err.message);
  }
  return rules;
}

async function getOptionCatalog() {
  try {
    const cached = await redisClient.get(OPTION_CATALOG_KEY);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.log("[priceRuleCache] Redis read failed, falling back to Mongo:", err.message);
  }

  const options = await CustomizationOption.find({ isActive: true }).lean();
  try {
    await redisClient.set(OPTION_CATALOG_KEY, JSON.stringify(options), "EX", TTL_SECONDS);
  } catch (err) {
    console.log("[priceRuleCache] Redis write failed:", err.message);
  }
  return options;
}

// Call this from admin controllers after any PriceRule/CustomizationOption write.
async function invalidate() {
  try {
    await redisClient.del(PRICE_RULES_KEY, OPTION_CATALOG_KEY);
  } catch (err) {
    console.log("[priceRuleCache] Redis invalidate failed:", err.message);
  }
}

module.exports = { getPriceRules, getOptionCatalog, invalidate };