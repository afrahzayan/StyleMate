import { buildLayerPublicId, buildLayerUrl } from "../../utils/cloudinaryLayer";

/**
 * Returns ONLY the single preview image for the selected option.
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
  };
}
