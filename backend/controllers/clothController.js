const Cloth = require("../models/clothModel");
const { uploadBufferToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const { analyzeClothingImage, GROQ_VISION_MODEL } = require("../services/groqVisionService");

// ── ADD CLOTH ─────────────────────────────────────────────
// POST /api/cloths  (multipart/form-data, field name "image")
// Flow (in this exact order):
//   1. validate upload
//   2. upload to Cloudinary (must succeed, or the request fails)
//   3. send the Cloudinary URL to Groq for analysis
//   4. save Cloudinary URL + AI metadata to MongoDB
// AI failure never blocks the save — the item is created with null fields
// and aiMeta.analysisFailed = true, so the user can fill things in manually
// on the item detail page instead of losing their upload entirely.
const addCloth = async (req, res) => {
  const reqId = Date.now().toString(36); // cheap correlation id for the logs below
  try {
    console.log(`[addCloth:${reqId}] Request received. user=${req.userId}`);

    if (!req.file) {
      console.log(`[addCloth:${reqId}] No file on req — check multipart boundary / field name "image"`);
      return res.status(400).json({ message: "No image file was uploaded" });
    }

    const { buffer } = req.file;
    console.log(`[addCloth:${reqId}] File present: ${req.file.originalname}, ${req.file.size} bytes, ${req.file.mimetype}`);

    // ── 1. Upload to Cloudinary first (this must succeed, or the request fails) ──
    const { url, publicId } = await uploadBufferToCloudinary(buffer);
    console.log(`[addCloth:${reqId}] Image uploaded to Cloudinary -> publicId=${publicId}`);
    console.log(`[addCloth:${reqId}] Cloudinary URL generated -> ${url}`);

    // ── 2. Send the Cloudinary URL to Groq for analysis (best-effort — failure is non-fatal) ──
    let aiData = null;
    let aiMeta = {
      provider: "groq",
      model: GROQ_VISION_MODEL,
      confidenceScores: {},
      analyzedAt: new Date(),
      analysisFailed: false,
      failureReason: null,
    };

    try {
      aiData = await analyzeClothingImage(url);
      aiMeta.confidenceScores = aiData.confidence || {};
      console.log(`[addCloth:${reqId}] AI analysis complete -> category=${aiData.category}, title="${aiData.title}"`);
    } catch (aiErr) {
      console.log(`[addCloth:${reqId}] AI analysis failed:`, aiErr.message);
      aiMeta.analysisFailed = true;
      aiMeta.failureReason = aiErr.message;
    }

    // ── 3. Build and save the document (Cloudinary URL + whatever AI returned) ──
    const newCloth = await Cloth.create({
      user: req.userId,
      image: { url, publicId },

      name: aiData?.title?.trim() || "Untitled Item",
      description: aiData?.description || "",

      category: aiData?.category || "Accessories", // already normalized by the service
      subCategory: aiData?.subCategory ?? null,

      color: {
        primary: aiData?.color?.primary ?? null,
        secondary: aiData?.color?.secondary ?? [],
      },

      pattern: aiData?.pattern ?? null,
      sleeveType: aiData?.sleeveType ?? null,
      neckType: aiData?.neckType ?? null,
      fit: aiData?.fit ?? null,
      fabric: aiData?.fabric ?? null,
      materialConfidence: aiData?.materialConfidence ?? null,
      genderSuitability: aiData?.genderSuitability ?? null,
      style: aiData?.style ?? null,
      occasion: aiData?.occasion ?? null,
      season: aiData?.season ?? null,
      formality: aiData?.formality ?? null,
      brand: aiData?.brand || "",
      logosDetected: aiData?.logosDetected ?? null,
      texture: aiData?.texture ?? null,
      length: aiData?.length ?? null,
      condition: aiData?.condition ?? null,
      layeringType: aiData?.layeringType ?? null,
      tags: Array.isArray(aiData?.tags) ? aiData.tags : [],

      aiMeta,
    });

    console.log(`[addCloth:${reqId}] MongoDB document created -> _id=${newCloth._id}`);
    console.log(`[addCloth:${reqId}] Response sent to frontend`);

    return res.status(201).json({ message: "Item added", cloth: newCloth });
  } catch (err) {
    console.log(`[addCloth:${reqId}] Failed:`, err);

    if (err.name === "ValidationError") {
      const fieldErrors = Object.fromEntries(
        Object.entries(err.errors).map(([field, e]) => [field, e.message])
      );
      return res.status(400).json({
        message: "Some of the analyzed data didn't match expected values",
        fieldErrors,
      });
    }

    return res.status(500).json({ message: "Something went wrong while adding the item" });
  }
};

// ── GET ALL CLOTHES (for the logged-in user) ────────────────
// GET /api/cloths?category=Top&search=white+shirt
const getCloths = async (req, res) => {
  try {
    const { category, search } = req.query;

    const filter = { user: req.userId, isDeleted: false };
    if (category && category !== "All") filter.category = category;
    if (search) filter.$text = { $search: search };

    const cloths = await Cloth.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ cloths });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── GET ONE CLOTH ────────────────────────────────────────────
// GET /api/cloths/:id
const getClothById = async (req, res) => {
  try {
    const cloth = await Cloth.findOne({
      _id: req.params.id,
      user: req.userId,
      isDeleted: false,
    });

    if (!cloth) return res.status(404).json({ message: "Item not found" });
    return res.status(200).json({ cloth });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── UPDATE CLOTH ──────────────────────────────────────────────
// PATCH /api/cloths/:id
// Any of the schema's editable fields can be sent; only known fields are applied.
const EDITABLE_FIELDS = [
  "name", "description", "category", "subCategory", "color",
  "pattern", "sleeveType", "neckType", "fit", "fabric", "materialConfidence",
  "genderSuitability", "style", "occasion", "season", "formality",
  "brand", "logosDetected", "texture", "length", "condition",
  "layeringType", "tags",
];

const updateCloth = async (req, res) => {
  try {
    const cloth = await Cloth.findOne({
      _id: req.params.id,
      user: req.userId,
      isDeleted: false,
    });

    if (!cloth) return res.status(404).json({ message: "Item not found" });

    EDITABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        cloth[field] = req.body[field];
      }
    });

    await cloth.save();
    return res.status(200).json({ message: "Item updated", cloth });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── TOGGLE FAVORITE ───────────────────────────────────────────
// PATCH /api/cloths/:id/favorite
const toggleFavorite = async (req, res) => {
  try {
    const cloth = await Cloth.findOne({
      _id: req.params.id,
      user: req.userId,
      isDeleted: false,
    });

    if (!cloth) return res.status(404).json({ message: "Item not found" });

    cloth.isFavorite = !cloth.isFavorite;
    await cloth.save();

    return res.status(200).json({ message: "Updated", cloth });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── DELETE CLOTH (soft delete) ────────────────────────────────
// DELETE /api/cloths/:id
// Soft delete only — keeps Outfit references valid, matching the existing
// isDeleted pattern already in the schema. The Cloudinary image is left in
// place intentionally (an Outfit elsewhere may still render it).
const deleteCloth = async (req, res) => {
  try {
    const cloth = await Cloth.findOne({
      _id: req.params.id,
      user: req.userId,
      isDeleted: false,
    });

    if (!cloth) return res.status(404).json({ message: "Item not found" });

    cloth.isDeleted = true;
    await cloth.save();

    return res.status(200).json({ message: "Item removed" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  addCloth,
  getCloths,
  getClothById,
  updateCloth,
  toggleFavorite,
  deleteCloth,
};