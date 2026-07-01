const express = require("express");
const router = express.Router();

const {
  register,
  verifyOtp,
  resendOtp,
  login,
  refreshAccessToken,
  logout,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);

// A simple test route to confirm protected routes work
router.get("/me", protect, (req, res) => {
  res.status(200).json({ message: "You are authenticated", userId: req.userId });
});

module.exports = router;