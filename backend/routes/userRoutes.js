const express = require("express");
const router  = express.Router();
const protect = require("../middlewares/authMiddleware");
const { getProfile } = require("../controllers/userController");

router.get("/profile", protect, getProfile);

module.exports = router;