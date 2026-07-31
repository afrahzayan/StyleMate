const express = require("express");
const router = express.Router();

const protect = require("../../middlewares/authMiddleware");
const { getAiRecommendations } = require("../../controllers/store/aiRecommendationController");

router.post("/ai/recommend", protect, getAiRecommendations);

module.exports = router;