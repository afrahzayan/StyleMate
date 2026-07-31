const express = require("express");
const router = express.Router();

const protect = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/upload");
const { getReviews, createReview } = require("../../controllers/store/reviewController");

router.get("/", getReviews);
router.post("/", protect, upload.array("images", 4), createReview);

module.exports = router;