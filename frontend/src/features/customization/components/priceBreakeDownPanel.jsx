// Fully itemized live price: Base + one line per priced selection (fabric,
// sleeve, neck, pattern, embroidery, thread work, stone work, custom fit
// fee...) = Estimated Price. Driven entirely by price.breakdown returned
// from the price engine — no group needs to be named here, so new priced
// option groups show up automatically.
const PriceBreakdownPanel = ({ price, isCalculating }) => (
  <div className="rounded-2xl border border-gray-100 p-5">
    <h3 className="mb-3 text-sm font-semibold text-gray-900">
      Estimated Price {isCalculating && <span className="text-xs font-normal text-gray-400">updating...</span>}
    </h3>
    <div className="space-y-1.5 text-sm text-gray-600">
      <div className="flex justify-between">
        <span>Base Price</span>
        <span>₹{price.base ?? 0}</span>
      </div>

      {(price.breakdown || [])
        .filter((line) => line.priceModifier)
        .map((line) => (
          <div key={`${line.group}:${line.value}`} className="flex justify-between text-xs text-gray-500">
            <span>
              {line.value} <span className="text-gray-400">({line.group})</span>
            </span>
            <span>+₹{line.priceModifier}</span>
          </div>
        ))}

      {price.discount > 0 && (
        <div className="flex justify-between text-emerald-600">
          <span>Discount</span>
          <span>-₹{price.discount}</span>
        </div>
      )}

      <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold text-gray-900">
        <span>Estimated Price</span>
        <span>₹{price.total ?? 0}</span>
      </div>
    </div>
  </div>
);

export default PriceBreakdownPanel;