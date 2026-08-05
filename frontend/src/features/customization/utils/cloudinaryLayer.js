const ROOT_FOLDER = "StyleMate/custom-design";

const LAYER_FOLDERS = {
  base: "base",
  fabric: "fabrics",
  sleeveType: "sleeves",
  neckType: "necks",
  pattern: "patterns",
  embroidery: "embroidery",
  threadWork: "thread-work",
  stoneWork: "stone-work",
  pocket: "pockets",
  buttonType: "buttons",
  cuff: "cuffs",
};

export const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const buildLayerPublicId = (group, value) => {
  if (group === "color") return null;
  const folder = LAYER_FOLDERS[group];
  if (!folder || !value) return null;
  return `${ROOT_FOLDER}/${folder}/${slugify(value)}`;
};

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const ASSET_VERSION = import.meta.env.VITE_CLOUDINARY_ASSET_VERSION || "1";

export const buildLayerUrl = (publicId, { width = 800 } = {}) => {
  if (!publicId || !CLOUD_NAME) return null;
  const cb = Date.now();
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_limit,w_${width},fl_progressive/${publicId}.png?v=${ASSET_VERSION}&cb=${cb}`;
};

export const buildFinalImagePublicId = (selections = {}) => {
  const type = slugify(selections.clothingType || "garment");
  const parts = [];

  if (selections.color) parts.push(slugify(selections.color));
  if (selections.fabric) parts.push(slugify(selections.fabric));
  if (selections.sleeveType && selections.sleeveType !== "Sleeveless") parts.push(slugify(selections.sleeveType));
  if (selections.neckType) parts.push(slugify(selections.neckType));
  if (selections.length) parts.push(slugify(selections.length));
  if (selections.pattern && selections.pattern !== "Plain") parts.push(slugify(selections.pattern));
  if (selections.embroidery && selections.embroidery !== "None") parts.push(slugify(selections.embroidery));
  if (selections.threadWork && selections.threadWork !== "None") parts.push(slugify(selections.threadWork));
  if (selections.stoneWork && selections.stoneWork !== "None") parts.push(slugify(selections.stoneWork));

  const filename = parts.length > 0 ? parts.join("-") : "default";
  return `StyleMate/custom-design/final/${type}/${filename}`;
};

export const buildFinalImageUrl = (publicId, { width = 1500 } = {}) => {
  if (!publicId || !CLOUD_NAME) return null;
  const cb = Date.now();
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_limit,w_${width},fl_progressive/${publicId}.png?v=${ASSET_VERSION}&cb=${cb}`;
};
