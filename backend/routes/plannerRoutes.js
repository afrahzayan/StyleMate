const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  createPlan,
  getMonthlyPlans,
  getPlanByDate,
  updatePlan,
  deletePlan,
  getUpcoming,
} = require("../controllers/plannerController");

// All planner routes require login and are always scoped to req.userId.
router.post("/", protect, createPlan);
router.get("/month", protect, getMonthlyPlans);
router.get("/upcoming", protect, getUpcoming);
router.get("/date/:date", protect, getPlanByDate);
router.patch("/:id", protect, updatePlan);
router.delete("/:id", protect, deletePlan);

module.exports = router;