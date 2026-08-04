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

// MannequinCanvas: Displays ONLY the single preview item corresponding to the latest clicked option.
// - On page open: Displays the initial selected clothing type (e.g. Shirt, Kurti, T-Shirt).
// - On option click: Replaces the previous preview with ONLY the new selection.
// - For Color: Renders directly using CSS/HEX color values (no Cloudinary image calls).
const MannequinCanvas = ({ selections, lastSelected }) => {
  const clothingType = selections?.clothingType || "Shirt";

  // Active option group & value (defaults to initial clothingType on open)
  const currentGroup = lastSelected?.group || "clothingType";
  const currentValue = lastSelected?.value || clothingType;

  const isColor = currentGroup === "color";
  const colorHex = isColor ? getHexForOption(currentValue) : null;

  // Single active image layer for non-color options
  const activeLayer = !isColor
    ? resolveSingleLayer({ group: currentGroup, value: currentValue }, selections)
    : null;

  return (
    <div>
      {/* Single Preview Box — ONLY ONE PREVIEW DISPLAYED AT A TIME */}
      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl bg-[#f8fafc] border border-gray-200 shadow-inner flex items-center justify-center">
        {isColor ? (
          /* Pure CSS Color Preview for Color Group (No Cloudinary Image Used) */
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 transition-all duration-300">
            <div
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl transition-transform duration-300 hover:scale-105"
              style={{ backgroundColor: colorHex }}
            />
            <span className="text-sm font-bold text-gray-800 bg-white/90 px-4 py-1.5 rounded-full shadow-sm border border-gray-200">
              {currentValue} ({colorHex})
            </span>
          </div>
        ) : activeLayer ? (
          /* Single Image Layer Preview for Garment, Fabric, Sleeve, Neck, Pattern, etc. */
          (() => {
            const { key, ...layerProps } = activeLayer;
            return <MannequinLayer key={key} {...layerProps} />;
          })()
        ) : (
          <p className="px-6 text-center text-xs font-semibold text-gray-400">
            No image available for {currentValue}
          </p>
        )}
      </div>

      {/* Active Preview Badge */}
      <div className="mx-auto mt-4 flex max-w-sm justify-center">
        <span className="inline-flex items-center gap-1.5 bg-[#4a5280] text-white rounded-full px-3.5 py-1 text-xs font-bold shadow-sm">
          <span className="opacity-75 font-normal">Active Preview:</span>
          <span>{GROUP_LABELS[currentGroup] || currentGroup}</span>
          <span className="opacity-75">→</span>
          <span>{currentValue}</span>
        </span>
      </div>
    </div>
  );
};

export default MannequinCanvas;