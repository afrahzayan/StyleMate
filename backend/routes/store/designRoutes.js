const express = require("express");
const router = express.Router();

const { getRecentDesigns, getDesignCategories } = require("../../controllers/store/designGalleryController");

router.get("/designs/recent", getRecentDesigns);
router.get("/categories", getDesignCategories);

module.exports = router;