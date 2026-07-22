const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/adminMiddleware");
const {
  getDashboardSummary,
  getUsers,
  blockUser,
  unblockUser,
  deleteUser,
} = require("../controllers/adminController");

router.use(protect, requireAdmin);

router.get("/dashboard/summary", getDashboardSummary);

router.get("/users", getUsers);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);
router.delete("/users/:id", deleteUser);

module.exports = router;