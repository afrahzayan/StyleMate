const express = require("express");
const router  = express.Router();
const protect = require("../middleware/authMiddleware");
const { getProfile } = require("../controllers/userController");

// All user routes are protected — must be logged in
router.get("/profile", protect, getProfile);

module.exports = router;
