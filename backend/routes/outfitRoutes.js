const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  createOutfit,
  getOutfits,
  getFavoriteStats,
  getOutfitById,
  updateOutfit,
  toggleFavorite,
  deleteOutfit,
} = require("../controllers/outfitController");

// All outfit routes require login.
// No file upload here — outfits are built only from existing wardrobe
// (Cloth) items, never raw images, per the schema's design.
router.post("/", protect, createOutfit);
router.get("/", protect, getOutfits);
router.get("/favorites/stats", protect, getFavoriteStats);
router.get("/:id", protect, getOutfitById);
router.patch("/:id", protect, updateOutfit);
router.patch("/:id/favorite", protect, toggleFavorite);
router.delete("/:id", protect, deleteOutfit);

module.exports = router;