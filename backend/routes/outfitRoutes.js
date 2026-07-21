const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const {
  createOutfit,
  getOutfits,
  getFavoriteStats,
  getOutfitById,
  updateOutfit,
  toggleFavorite,
  deleteOutfit,
} = require("../controllers/outfitController");

router.post("/", protect, createOutfit);
router.get("/", protect, getOutfits);
router.get("/favorites/stats", protect, getFavoriteStats);
router.get("/:id", protect, getOutfitById);
router.patch("/:id", protect, updateOutfit);
router.patch("/:id/favorite", protect, toggleFavorite);
router.delete("/:id", protect, deleteOutfit);

module.exports = router;