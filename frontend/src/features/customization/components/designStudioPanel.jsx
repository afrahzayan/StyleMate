import OptionStep from "./questionnaire/optionStep";
import MeasurementsForm from "./measurementsForm";

// The Design Studio's left panel: every live-editable customization group
// rendered at once (not one question at a time, unlike the pre-studio
// Question Wizard) so the right-panel preview + price can update the
// instant any control changes. Adding a new studio group is one entry here.
export const STUDIO_GROUPS = [
  { group: "fabric", label: "Fabric" },
  { group: "color", label: "Color" },
  { group: "sleeveType", label: "Sleeves" },
  { group: "neckType", label: "Neck" },
  { group: "length", label: "Length" },
  { group: "pattern", label: "Pattern" },
  { group: "embroidery", label: "Embroidery" },
  { group: "threadWork", label: "Thread Work" },
  { group: "stoneWork", label: "Stone Work" },
];

const DesignStudioPanel = ({ selections, onSelect, onMeasurementChange, notes, onNotesChange }) => (
  <div className="flex flex-col gap-8">
    {STUDIO_GROUPS.map(({ group, label }) => (
      <OptionStep
        key={group}
        group={group}
        label={label}
        value={selections[group]}
        gender={selections.gender}
        onSelect={(value) => onSelect(group, value)}
        layout="flex"
      />
    ))}

    <MeasurementsForm measurements={selections.measurements} onChange={onMeasurementChange} />

    <label className="flex flex-col gap-1 text-xs text-gray-500">
      Additional requirements (optional)
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={3}
        placeholder="Anything specific you'd like the design team to know..."
        className="rounded-lg border border-gray-200 p-2 text-sm text-gray-900 outline-none"
      />
    </label>
  </div>
);

export default DesignStudioPanel;