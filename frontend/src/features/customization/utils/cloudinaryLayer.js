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

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "kerygwxk";
const ASSET_VERSION = import.meta.env.VITE_CLOUDINARY_ASSET_VERSION || "1";

export const BASE_CLOTHING_IMAGES = {
  Shirt: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/StyleMate/custom-design/base/shirt`,
  "T-Shirt": `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/StyleMate/custom-design/base/t-shirt`,
  Kurti: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/StyleMate/custom-design/base/kurti`,
  Kurta: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/StyleMate/custom-design/base/kurti`,
  Gown: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/StyleMate/custom-design/base/gown`,
  Dress: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/StyleMate/custom-design/base/dress`,
};

export const getClothingTypeImageUrl = (type = "Shirt") => {
  const normalized = type || "Shirt";
  return BASE_CLOTHING_IMAGES[normalized] || BASE_CLOTHING_IMAGES.Shirt;
};

export const buildLayerUrl = (publicId, { width = 800 } = {}) => {
  if (!publicId || !CLOUD_NAME) return null;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_limit,w_${width}/${publicId}`;
};

export const buildFinalImagePublicId = (selections = {}) => {
  const type = slugify(selections.clothingType || "shirt");
  return `StyleMate/custom-design/base/${type}`;
};

export const buildFinalImageUrl = (publicId, { width = 1500, clothingType = "Shirt" } = {}) => {
  if (publicId && !publicId.includes("custom-design/final")) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_limit,w_${width}/${publicId}`;
  }
  return getClothingTypeImageUrl(clothingType);
};
