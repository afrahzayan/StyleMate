import { buildLayerPublicId, buildLayerUrl, getPlaceholderLayer } from "../../utils/cloudinaryLayer";

/**
 * Plain-data z-stack for the live preview. Each customization group maps to
 * exactly one reusable Cloudinary layer (see utils/cloudinaryLayers.js) —
 * there is no per-combination image. Adding a brand-new fabric/color/sleeve
 * only means seeding a CustomizationOption row and uploading one PNG; this
 * file never changes.
 *
 * zIndex convention (low -> high, back to front):
 *   0   base garment silhouette (by clothingType)
 *   10  color layer
 *   20  fabric texture layer
 *   30  sleeve layer
 *   40  neck layer
 *   50  pattern overlay
 *   60  embroidery overlay
 *   70  thread work overlay
 *   80  stone work overlay
 */
const LAYER_SPECS = [
  { group: "clothingType", folderGroup: "base", zIndex: 0 },
  { group: "color", folderGroup: "color", zIndex: 10 },
  { group: "fabric", folderGroup: "fabric", zIndex: 20 },
  { group: "sleeveType", folderGroup: "sleeveType", zIndex: 30, skipValues: ["Sleeveless"] },
  { group: "neckType", folderGroup: "neckType", zIndex: 40 },
  { group: "pattern", folderGroup: "pattern", zIndex: 50, skipValues: ["Plain"] },
  { group: "embroidery", folderGroup: "embroidery", zIndex: 60, skipValues: ["None"] },
  { group: "threadWork", folderGroup: "threadWork", zIndex: 70, skipValues: ["None"] },
  { group: "stoneWork", folderGroup: "stoneWork", zIndex: 80, skipValues: ["None"] },
];

/**
 * Given the current selections object, returns an ordered array of layers
 * to render, each with a real Cloudinary URL and a placeholder fallback the
 * <img onError> can swap to if that layer hasn't been uploaded yet.
 */
export function resolveLayers(selections = {}) {
  const layers = [];

  for (const spec of LAYER_SPECS) {
    const value = selections[spec.group];
    if (!value) continue;
    if (spec.skipValues?.includes(value)) continue; // e.g. "Sleeveless" needs no overlay

    const publicId = buildLayerPublicId(spec.folderGroup, value);
    if (!publicId) continue;

    layers.push({
      key: `${spec.group}:${value}`,
      group: spec.group,
      value,
      src: buildLayerUrl(publicId),
      fallbackSrc: getPlaceholderLayer(spec.group, value),
      zIndex: spec.zIndex,
    });
  }

  return layers.sort((a, b) => a.zIndex - b.zIndex);
}