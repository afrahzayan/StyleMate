const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  addCloth,
  getCloths,
  getClothById,
  updateCloth,
  toggleFavorite,
  deleteCloth,
} = require("../controllers/clothController");

router.post("/", protect, upload.single("image"), addCloth);
router.get("/", protect, getCloths);
router.get("/:id", protect, getClothById);
router.patch("/:id", protect, updateCloth);
router.patch("/:id/favorite", protect, toggleFavorite);
router.delete("/:id", protect, deleteCloth);

module.exports = router;
