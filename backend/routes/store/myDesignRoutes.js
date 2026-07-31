const express = require("express");
const router = express.Router();

const protect = require("../../middlewares/authMiddleware");
const {
  saveDesign,
  listMyDesigns,
  submitDesignRequest,
  deleteMyDesign,
} = require("../../controllers/store/myDesignController");

router.use(protect);

router.get("/", listMyDesigns);
router.post("/", saveDesign);
router.patch("/:id/submit", submitDesignRequest);
router.delete("/:id", deleteMyDesign);

module.exports = router;