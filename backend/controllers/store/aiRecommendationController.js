const { recommendDesigns } = require("../../services/store/aiDesignRecommendationService");

// POST /api/customization/ai/recommend  (protect)
// Call this once, after the full questionnaire is submitted — not per-step,
// since it's a paid/rate-limited external call.
const getAiRecommendations = async (req, res) => {
  try {
    const answers = req.body;
    if (!answers || !answers.clothingType) {
      return res.status(400).json({ message: "Questionnaire answers with clothingType are required" });
    }

    const recommendations = await recommendDesigns(answers);
    res.json({ recommendations });
  } catch (err) {
    console.log("[getAiRecommendations] error:", err.message);
    res.status(500).json({ message: "Failed to generate AI recommendations" });
  }
};

module.exports = { getAiRecommendations };