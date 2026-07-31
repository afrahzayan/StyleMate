/**
 * Pure price calculation. No DB calls in here on purpose — callers load
 * priceRules/optionCatalog (from Redis via priceRuleCacheService) and pass
 * them in. That keeps this function fast and unit-testable, and reusable
 * anywhere a live customization price estimate is needed.
 */

class PriceEngineError extends Error {}

/**
 * @param {Object} params
 * @param {string} params.clothingType
 * @param {Object} params.selections - e.g. { fit: "Slim", sleeveType: "Full Sleeve", fabric: "Linen", ... }
 * @param {Object} [params.selections.measurements] - custom body measurements; if any
 *        field is set, a flat customMeasurementFee is added to the total.
 * @param {Array}  params.priceRules - array of PriceRule docs/plain objects
 * @param {Array}  params.optionCatalog - array of CustomizationOption docs/plain objects
 * @returns {{ base: number, extras: number, total: number, breakdown: Array }}
 */
function calculatePrice({ clothingType, selections = {}, priceRules = [], optionCatalog = [] }) {
  if (!clothingType) {
    throw new PriceEngineError("clothingType is required");
  }

  const rule = priceRules.find((r) => r.clothingType === clothingType && r.isActive !== false);
  if (!rule) {
    throw new PriceEngineError(`No active price rule for clothing type "${clothingType}"`);
  }

  const base = rule.basePrice;
  let extras = 0;
  const breakdown = [];

  for (const [group, value] of Object.entries(selections)) {
    if (value == null || value === "") continue;

    const option = optionCatalog.find(
      (o) => o.group === group && o.value === value && o.isActive !== false
    );

    if (!option) continue; // unrecognized/non-priced field (e.g. budget, additionalRequirements) — ignore

    extras += option.priceModifier || 0;
    breakdown.push({ group, value, priceModifier: option.priceModifier || 0 });
  }

  if (selections.length === "Custom") {
    extras += rule.lengthPriceModifier || 0;
    breakdown.push({ group: "length", value: "Custom", priceModifier: rule.lengthPriceModifier || 0 });
  }

  const measurements = selections.measurements || {};
  const hasCustomMeasurements = Object.values(measurements).some((v) => v != null && v !== "");
  if (hasCustomMeasurements) {
    const fee = rule.customMeasurementFee ?? 250;
    extras += fee;
    breakdown.push({ group: "measurements", value: "Custom Fit", priceModifier: fee });
  }

  const total = base + extras;

  return { base, extras, total, breakdown };
}

module.exports = { calculatePrice, PriceEngineError };