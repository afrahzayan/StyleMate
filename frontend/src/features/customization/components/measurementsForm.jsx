// Free-form body measurements. These don't map to a Cloudinary layer or a
// per-field price — filling any of them in adds a single flat
// "Custom Fit" fee (see priceEngineService.calculatePrice), covering the
// extra tailoring work rather than pricing each measurement individually.
const FIELDS = [
  { key: "height", label: "Height", unit: "cm" },
  { key: "shoulder", label: "Shoulder", unit: "cm" },
  { key: "chest", label: "Chest", unit: "cm" },
  { key: "waist", label: "Waist", unit: "cm" },
  { key: "hip", label: "Hip", unit: "cm" },
  { key: "sleeveLength", label: "Sleeve Length", unit: "cm" },
];

const MeasurementsForm = ({ measurements = {}, onChange }) => (
  <div>
    <h3 className="mb-1 text-sm font-semibold text-gray-900">Measurements (optional)</h3>
    <p className="mb-3 text-xs text-gray-500">Add your measurements for a custom fit — a small tailoring fee applies.</p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {FIELDS.map((f) => (
        <label key={f.key} className="flex flex-col gap-1 text-xs text-gray-500">
          {f.label}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5">
            <input
              type="number"
              min="0"
              inputMode="decimal"
              value={measurements[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              placeholder="—"
              className="w-full text-sm text-gray-900 outline-none"
            />
            <span className="text-[10px] text-gray-400">{f.unit}</span>
          </div>
        </label>
      ))}
    </div>
  </div>
);

export default MeasurementsForm;