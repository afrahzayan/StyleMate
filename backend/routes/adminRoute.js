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
  getClothes,
  getClothFilters,
  getClothDetails,
  deleteCloth,
  getReports,
  getReportsStats,
  getReportsActivity,
  getReportDetails,
  resolveReportById,
  rejectReportById,
  deleteReportContent,
} = require("../controllers/admin/adminController");

router.use(protect, requireAdmin);

router.get("/dashboard/summary", getDashboardSummary);

router.get("/users", getUsers);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);
router.delete("/users/:id", deleteUser);

// Clothes (Admin Cloth Management)
router.get("/clothes", getClothes);
router.get("/clothes/filters", getClothFilters);
router.get("/clothes/:id", getClothDetails);
router.delete("/clothes/:id", deleteCloth);

// Reports (Admin Report Management)
router.get("/reports", getReports);
router.get("/reports/stats", getReportsStats);
router.get("/reports/activity", getReportsActivity);
router.get("/reports/:id", getReportDetails);
router.patch("/reports/:id/resolve", resolveReportById);
router.patch("/reports/:id/reject", rejectReportById);
router.delete("/reports/:id/content", deleteReportContent);

module.exports = router;