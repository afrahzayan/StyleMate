const CustomerDesign = require("../../models/store/customerDesignModel");

// POST /api/customization/my-designs  (protect)
// body: { title, previewImage: { url, publicId }, clothingType, selections, price }
const saveDesign = async (req, res) => {
  try {
    const { title, previewImage, clothingType, selections = {}, measurements = {}, price, creationSpeed = "standard", fastCreationFee = 0 } = req.body;

    if (!title || !previewImage?.url || !clothingType || price == null) {
      return res.status(400).json({ message: "title, previewImage, clothingType and price are required" });
    }

    const design = await CustomerDesign.create({
      user: req.userId,
      title,
      previewImage,
      clothingType,
      selections,
      measurements,
      price,
      creationSpeed,
      fastCreationFee,
      isFeatured: false,
      isActive: true,
      status: "saved",
    });

    res.status(201).json(design);
  } catch (err) {
    console.log("[saveDesign] error:", err.message);
    res.status(400).json({ message: "Failed to save design" });
  }
};

// GET /api/customization/my-designs?status=saved|submitted  (protect)
// Powers both "Saved Designs" (status=saved) and "Design History" (all of
// the user's designs, most recent first).
const listMyDesigns = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { user: req.userId };
    if (status) filter.status = status;

    const designs = await CustomerDesign.find(filter).sort({ createdAt: -1 });
    res.json(designs);
  } catch (err) {
    console.log("[listMyDesigns] error:", err.message);
    res.status(500).json({ message: "Failed to fetch your designs" });
  }
};

// DELETE /api/customization/my-designs/:id  (protect)
const deleteMyDesign = async (req, res) => {
  try {
    const design = await CustomerDesign.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!design) return res.status(404).json({ message: "Design not found" });
    res.json({ message: "Design deleted" });
  } catch (err) {
    console.log("[deleteMyDesign] error:", err.message);
    res.status(400).json({ message: "Failed to delete design" });
  }
};

module.exports = { saveDesign, listMyDesigns, deleteMyDesign };