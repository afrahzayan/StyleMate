const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  generateSuggestions,
  regenerateSuggestions,
  saveSuggestedOutfit,
  toggleSuggestionFavorite,
  getHistory,
  getSuggestionById,
  deleteSuggestion,
} = require("../controllers/aiSuggestionController");

router.post("/generate", protect, generateSuggestions);
router.get("/history", protect, getHistory);
router.get("/:id", protect, getSuggestionById);
router.post("/:id/regenerate", protect, regenerateSuggestions);
router.post("/:id/save", protect, saveSuggestedOutfit);
router.patch("/:id/favorite", protect, toggleSuggestionFavorite);
router.delete("/:id", protect, deleteSuggestion);

module.exports = router;
