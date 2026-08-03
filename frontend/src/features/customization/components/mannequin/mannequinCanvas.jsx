import { resolveSingleLayer } from "./layerRegistry";
import MannequinLayer from "./mannequinLayer";
import { getHexForOption } from "../questionnaire/optionStep";

const GROUP_LABELS = {
  clothingType: "Garment",
  color: "Color",
  fabric: "Fabric",
  sleeveType: "Sleeve",
  neckType: "Neck",
  pattern: "Pattern",
  embroidery: "Embroidery",
  threadWork: "Thread Work",
  stoneWork: "Stone Work",
};

const MannequinCanvas = ({ selections, lastSelected }) => {
  // Base garment selection (e.g. Shirt, Kurta, T-Shirt, Kurti, Gown, etc.)
  const clothingType = selections?.clothingType || "Shirt";

  // Base layer for the garment
  const baseLayer = resolveSingleLayer({ group: "clothingType", value: clothingType }, selections);

  // Active option layer if user clicked something specific (Sleeve, Neck, Fabric, etc.)
  const activeLayer = lastSelected && lastSelected.group !== "clothingType"
    ? resolveSingleLayer(lastSelected, selections)
    : null;

  // Selected CSS Color (HEX value)
  const selectedColorHex = selections?.color ? getHexForOption(selections.color) : null;

  const currentDisplayLabel = activeLayer
    ? `${GROUP_LABELS[activeLayer.group] || activeLayer.group}: ${activeLayer.value}`
    : `Garment: ${clothingType}`;

  return (
    <div>
      {/* Single Live Preview Box */}
      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl bg-[#f8fafc] border border-gray-200 shadow-inner flex items-center justify-center">
        {/* Base Garment Image */}
        {baseLayer && <MannequinLayer key={baseLayer.key} {...baseLayer} />}

        {/* CSS Color Tint Wash (if a color is selected) */}
        {selectedColorHex && (
          <div
            className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-40 transition-colors duration-300"
            style={{ backgroundColor: selectedColorHex }}
          />
        )}

        {/* Active Option Layer Overlay */}
        {activeLayer && (
          <MannequinLayer key={activeLayer.key} {...activeLayer} />
        )}
      </div>

      {/* Active Preview Badge */}
      <div className="mx-auto mt-4 flex max-w-sm justify-center">
        <span className="inline-flex items-center gap-1.5 bg-[#4a5280] text-white rounded-full px-3.5 py-1 text-xs font-bold shadow-sm">
          <span className="opacity-75 font-normal">Previewing:</span>
          <span>{currentDisplayLabel}</span>
          {selections?.color && (
            <span
              className="w-3 h-3 rounded-full border border-white/50 ml-1 shrink-0"
              style={{ backgroundColor: selectedColorHex }}
              title={selections.color}
            />
          )}
        </span>
      </div>
    </div>
  );
};

export default MannequinCanvas;