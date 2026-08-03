const { cloudinary } = require("./cloudinary");

/**
 * Reusable, dynamically-composited garment layers.
 *
 * We deliberately do NOT store one image per combination (e.g.
 * "cotton-blue-full-sleeve-shirt.png"). Instead every customization value
 * has exactly one transparent-PNG layer, stored under a predictable
 * Cloudinary folder, and the frontend stacks them at render time.
 *
 * Folder convention (all under the "custom-design" root):
 *
 *   custom-design/base/<clothingType>.png        e.g. base/shirt.png
 *   custom-design/colors/<color>.png              e.g. colors/blue.png
 *   custom-design/fabrics/<fabric>.png             e.g. fabrics/cotton.png
 *   custom-design/sleeves/<sleeveType>.png         e.g. sleeves/full-sleeve.png
 *   custom-design/necks/<neckType>.png             e.g. necks/v-neck.png
 *   custom-design/patterns/<pattern>.png           e.g. patterns/floral.png
 *   custom-design/embroidery/<embroidery>.png      e.g. embroidery/heavy.png
 *   custom-design/thread-work/<threadWork>.png     e.g. thread-work/gold.png
 *   custom-design/stone-work/<stoneWork>.png       e.g. stone-work/heavy.png
 *
 * Values are slugified (lowercase, spaces -> hyphens) to build the
 * public_id, so "Three Quarter" -> "three-quarter.png". Admins upload real
 * artwork to these exact public_ids and the studio picks them up with zero
 * code changes.
 */

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

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Builds the Cloudinary public_id for a given customization layer.
 * @param {string} group - one of LAYER_FOLDERS keys, or "base"
 * @param {string} value - the option value, e.g. "Full Sleeve"
 */
const buildLayerPublicId = (group, value) => {
  const folder = LAYER_FOLDERS[group];
  if (!folder || !value) return null;
  return `${ROOT_FOLDER}/${folder}/${slugify(value)}`;
};

/**
 * Builds a performant, responsive Cloudinary delivery URL for a layer.
 * f_auto/q_auto pick the best format/quality per browser; c_limit+w keeps
 * payload small without upscaling small source art; fl_progressive helps
 * perceived load speed on the live-preview canvas.
 */
const buildLayerUrl = (publicId, { width = 800 } = {}) => {
  if (!publicId) return null;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,c_limit,w_${width},fl_progressive/${publicId}.png`;
};

/**
 * Uploads a transparent PNG layer to its conventional folder/public_id so
 * it's found automatically by the frontend. Use this from an admin
 * upload endpoint/script rather than the generic product uploader.
 * @param {Buffer} buffer
 * @param {string} group - one of LAYER_FOLDERS keys
 * @param {string} value - option value this layer represents
 */
const uploadLayerAsset = (buffer, group, value) => {
  const publicId = buildLayerPublicId(group, value);
  if (!publicId) {
    return Promise.reject(new Error(`Unknown layer group "${group}"`));
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder: undefined, // public_id already includes the full path
        resource_type: "image",
        format: "png",
        overwrite: true,
        invalidate: true,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = {
  ROOT_FOLDER,
  LAYER_FOLDERS,
  slugify,
  buildLayerPublicId,
  buildLayerUrl,
  uploadLayerAsset,
};