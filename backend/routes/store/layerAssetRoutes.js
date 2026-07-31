const express = require("express");
const router = express.Router();

const protect = require("../../middlewares/authMiddleware");
const requireAdmin = require("../../middlewares/adminMiddleware");
const upload = require("../../middlewares/upload");
const { uploadLayer, previewLayerUrl } = require("../../controllers/store/layerAssetController");

router.get("/preview-url", previewLayerUrl);
router.post("/", protect, requireAdmin, upload.single("image"), uploadLayer);

module.exports = router;