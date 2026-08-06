const express = require("express");
const router = express.Router();

const protect = require("../../middlewares/authMiddleware");
const {
  saveDesign,
  listMyDesigns,
  deleteMyDesign,
} = require("../../controllers/store/myDesignController");

router.use(protect);

router.get("/", listMyDesigns);
router.post("/", saveDesign);
router.delete("/:id", deleteMyDesign);

module.exports = router;