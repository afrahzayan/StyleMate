const StoreReview = require("../../models/store/storeReviewModel");
const CustomerDesign = require("../../models/store/customerDesignModel");
const { uploadBufferToCloudinary } = require("../../config/cloudinary");

// GET /api/store/reviews?targetId=...&featured=true
// All reviews target a CustomerDesign — there are no purchasable products
// left to review.
const getReviews = async (req, res) => {
  try {
    const { targetId, featured } = req.query;
    const filter = { isApproved: true, targetType: "CustomerDesign" };
    if (targetId) filter.targetId = targetId;
    if (featured === "true") filter.isFeatured = true;

    const reviews = await StoreReview.find(filter).populate("user", "name profileImage").sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.log("[getReviews] error:", err.message);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// POST /api/store/reviews  (protect, multipart, field: images[])
const createReview = async (req, res) => {
  try {
    const { targetId, rating, comment } = req.body;

    let images = [];
    if (req.files && req.files.length) {
      images = await Promise.all(
        req.files.map(async (file) => {
          const { url, publicId } = await uploadBufferToCloudinary(file.buffer);
          return { url, publicId };
        })
      );
    }

    const review = await StoreReview.create({
      user: req.userId,
      targetType: "CustomerDesign",
      targetId,
      rating,
      comment,
      images,
    });

    await recalculateDesignRating(targetId);

    res.status(201).json(review);
  } catch (err) {
    console.log("[createReview] error:", err.message);
    res.status(400).json({ message: "Failed to submit review" });
  }
};

async function recalculateDesignRating(designId) {
  const stats = await StoreReview.aggregate([
    { $match: { targetType: "CustomerDesign", targetId: designId, isApproved: true } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await CustomerDesign.findByIdAndUpdate(designId, { ratingAvg: avg, ratingCount: count });
}

module.exports = { getReviews, createReview };