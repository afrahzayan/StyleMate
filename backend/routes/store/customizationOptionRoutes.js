const express = require("express");
const router = express.Router();

const { getOptions, getPopularDesigns } = require("../../controllers/store/customizationOptionController");

router.get("/options", getOptions);
router.get("/designs/popular", getPopularDesigns);

module.exports = router;