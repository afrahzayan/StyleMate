import { buildLayerPublicId, buildLayerUrl } from "../../utils/cloudinaryLayer";

// Layer zIndex specs (color excluded since color uses pure CSS/HEX)
const LAYER_SPECS = [
  { group: "clothingType", folderGroup: "base", zIndex: 0 },
  { group: "fabric", folderGroup: "fabric", zIndex: 20 },
  { group: "sleeveType", folderGroup: "sleeveType", zIndex: 30, skipValues: ["Sleeveless"] },
  { group: "neckType", folderGroup: "neckType", zIndex: 40 },
  { group: "pattern", folderGroup: "pattern", zIndex: 50, skipValues: ["Plain"] },
  { group: "embroidery", folderGroup: "embroidery", zIndex: 60, skipValues: ["None"] },
  { group: "threadWork", folderGroup: "threadWork", zIndex: 70, skipValues: ["None"] },
  { group: "stoneWork", folderGroup: "stoneWork", zIndex: 80, skipValues: ["None"] },
];

/**
 * Returns ordered array of layers for all selected options.
 */
export function resolveLayers(selections = {}) {
  const layers = [];

  for (const spec of LAYER_SPECS) {
    const value = selections[spec.group];
    if (!value) continue;
    if (spec.skipValues?.includes(value)) continue;

    const publicId = buildLayerPublicId(spec.folderGroup, value);
    if (!publicId) continue;

    layers.push({
      key: `${spec.group}:${value}`,
      group: spec.group,
      value,
      src: buildLayerUrl(publicId),
      zIndex: spec.zIndex,
    });
  }

  return layers.sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Returns ONLY the single layer for the most recently clicked option.
 * If group is 'color' or no Cloudinary asset exists, returns null.
 */
export function resolveSingleLayer(lastSelected, selections = {}) {
  const targetGroup = lastSelected?.group || "clothingType";
  const targetValue = lastSelected?.value || selections[targetGroup] || selections.clothingType;

  if (!targetValue || targetGroup === "color") return null;

  const folderGroup = targetGroup === "clothingType" ? "base" : targetGroup;
  const publicId = buildLayerPublicId(folderGroup, targetValue);
  if (!publicId) return null;

  return {
    key: `${targetGroup}:${targetValue}`,
    group: targetGroup,
    value: targetValue,
    src: buildLayerUrl(publicId),
    zIndex: 10,
  };
}