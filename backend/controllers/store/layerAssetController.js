const { uploadLayerAsset, LAYER_FOLDERS, buildLayerUrl, buildLayerPublicId } = require("../../config/cloudinaryLayers");

// POST /api/customization/layer-assets  (admin only, multipart/form-data)
// fields: group ("color" | "fabric" | "sleeveType" | "neckType" | "pattern" |
//         "embroidery" | "threadWork" | "stoneWork" | "base"), value (e.g. "Blue")
// file:   a transparent PNG under the "image" field
//
// This is the one place a real transparent-PNG layer gets attached to a
// customization value. Upload once per value (not per combination) — the
// same "Blue" color layer is reused across every fabric/sleeve/neck combo.
const uploadLayer = async (req, res) => {
  try {
    const { group, value } = req.body;
    if (!group || !Object.keys(LAYER_FOLDERS).includes(group)) {
      return res.status(400).json({ message: `group must be one of: ${Object.keys(LAYER_FOLDERS).join(", ")}` });
    }
    if (!value) {
      return res.status(400).json({ message: "value is required, e.g. \"Blue\" or \"Full Sleeve\"" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "A PNG file is required under the \"image\" field" });
    }

    const { url, publicId } = await uploadLayerAsset(req.file.buffer, group, value);
    res.status(201).json({ url, publicId, group, value });
  } catch (err) {
    console.log("[uploadLayer] error:", err.message);
    res.status(500).json({ message: "Failed to upload layer asset" });
  }
};

// GET /api/customization/layer-assets/preview-url?group=color&value=Blue
// Handy for checking whether a layer has been uploaded yet, and what URL
// the studio will resolve to for it.
const previewLayerUrl = (req, res) => {
  const { group, value } = req.query;
  const publicId = buildLayerPublicId(group, value);
  if (!publicId) {
    return res.status(400).json({ message: "Invalid group/value combination" });
  }
  res.json({ publicId, url: buildLayerUrl(publicId) });
};

module.exports = { uploadLayer, previewLayerUrl };