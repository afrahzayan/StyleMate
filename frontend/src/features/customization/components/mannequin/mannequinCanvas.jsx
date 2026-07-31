import { resolveLayers } from "./layerRegistry";
import MannequinLayer from "./mannequinLayer";

// Human-friendly group names for the legend strip below the canvas.
const GROUP_LABELS = {
  clothingType: "Clothing Type",
  color: "Color",
  fabric: "Fabric",
  pocket: "Pocket",
  sleeveType: "Sleeve",
  cuff: "Cuff",
  neckType: "Neck",
  buttonType: "Buttons",
  pattern: "Pattern",
  embroidery: "Embroidery",
  threadWork: "Thread Work",
  stoneWork: "Stone Work",
};

// Orchestrator: subscribes to the wizard's single `selections` object and
// derives the visible layer stack from it. Because it only reads from
// selections (never owns or mutates them), changing one field re-renders
// only the layers affected by that field — the others are untouched, which
// is exactly the "changing one option should never reset the others"
// requirement from the spec.
const MannequinCanvas = ({ selections }) => {
  const layers = resolveLayers(selections);

  return (
    <div>
      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl bg-gray-50">
        {layers.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-gray-400">
            Pick a clothing type to start the preview
          </p>
        )}
        {layers.map((layer) => (
          <MannequinLayer key={layer.key} {...layer} />
        ))}
      </div>

      {/* Readable confirmation of exactly what's applied right now. The
          layered preview itself uses placeholder shapes until real Cloudinary
          art is uploaded for a given option, so this strip is what makes every
          selection visibly, unambiguously register — no squinting required. */}
      {layers.length > 0 && (
        <div className="mx-auto mt-4 flex max-w-sm flex-wrap gap-x-4 gap-y-1.5 px-1 text-xs text-gray-500">
          {layers.map((layer) => (
            <span key={layer.key}>
              <span className="text-gray-400">{GROUP_LABELS[layer.group] || layer.group}:</span>{" "}
              <span className="font-medium text-gray-700">{layer.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MannequinCanvas;