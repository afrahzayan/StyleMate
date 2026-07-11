const mongoose = require("mongoose");
const Planner = require("../models/plannerModel");
const Outfit = require("../models/outfitModel");
const {
  OUTFIT_PREVIEW_POPULATE,
  getMonthlyPlans: fetchMonthlyPlans,
  getPlansInRange,
  getUpcomingPlans: fetchUpcomingPlans,
} = require("../services/plannerService");

// ── helpers ──────────────────────────────────────────────────────
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Confirms the outfit exists and belongs to the requesting user before
// it's allowed to be attached to a plan.
const validateOutfitBelongsToUser = async (outfitId, userId) => {
  if (!outfitId || !isValidObjectId(outfitId)) {
    return { valid: false, message: "A valid outfit must be selected" };
  }
  const outfit = await Outfit.findOne({ _id: outfitId, user: userId });
  if (!outfit) {
    return { valid: false, message: "Outfit not found in your wardrobe" };
  }
  return { valid: true, outfit };
};

// Parses a date (and optional separate time) into a single Date instant.
// Accepts either a full ISO string in `date`, or a plain "YYYY-MM-DD" date
// combined with a "HH:mm" time. Falls back to noon when no time is given,
// so day-only plans still land on a predictable, stable instant.
const buildPlanDate = (dateInput, timeInput) => {
  if (!dateInput) return null;

  // Full ISO / parsable datetime string was sent directly.
  if (timeInput === undefined || timeInput === null || timeInput === "") {
    const asIs = new Date(dateInput);
    if (!isNaN(asIs.getTime()) && /T\d{2}:\d{2}/.test(String(dateInput))) {
      return asIs;
    }
  }

  const datePart = String(dateInput).slice(0, 10); // "YYYY-MM-DD"
  const timePart = /^\d{2}:\d{2}$/.test(timeInput || "") ? timeInput : "12:00";
  const combined = new Date(`${datePart}T${timePart}:00`);
  return isNaN(combined.getTime()) ? null : combined;
};

const dayBounds = (dateStr) => {
  const start = new Date(`${dateStr}T00:00:00`);
  if (isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

// ── CREATE / REPLACE A PLAN ─────────────────────────────────────
// POST /api/planner   body: { outfitId, date, time?, notes? }
// Upserts on (user, exact date+time): planning again for the same slot
// replaces what was there instead of erroring.
const createPlan = async (req, res) => {
  try {
    const { outfitId, date, time, notes } = req.body;

    const planDate = buildPlanDate(date, time);
    if (!planDate) {
      return res.status(400).json({ message: "A valid date is required" });
    }

    const check = await validateOutfitBelongsToUser(outfitId, req.userId);
    if (!check.valid) return res.status(400).json({ message: check.message });

    const plan = await Planner.findOneAndUpdate(
      { user: req.userId, date: planDate },
      { user: req.userId, outfit: outfitId, date: planDate, note: notes || "" },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate(OUTFIT_PREVIEW_POPULATE);

    return res.status(200).json({ message: "Outfit planned", plan });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "You already have an outfit planned for this exact date and time" });
    }
    if (err.name === "ValidationError") {
      const fieldErrors = Object.fromEntries(
        Object.entries(err.errors).map(([field, e]) => [field, e.message])
      );
      return res.status(400).json({ message: "Some fields were invalid", fieldErrors });
    }
    return res.status(500).json({ message: "Something went wrong while saving the plan" });
  }
};

// ── GET MONTHLY PLANS ────────────────────────────────────────────
// GET /api/planner/month?year=2024&month=6   (month is 1-indexed)
const getMonthlyPlans = async (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;

    if (month < 1 || month > 12) {
      return res.status(400).json({ message: "Month must be between 1 and 12" });
    }

    const plans = await fetchMonthlyPlans(req.userId, year, month);
    return res.status(200).json({ plans, count: plans.length, year, month });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading the planner" });
  }
};

// ── GET PLAN(S) FOR A SPECIFIC DATE ──────────────────────────────
// GET /api/planner/date/:date   (:date = "YYYY-MM-DD")
const getPlanByDate = async (req, res) => {
  try {
    const bounds = dayBounds(req.params.date);
    if (!bounds) return res.status(400).json({ message: "Invalid date format, expected YYYY-MM-DD" });

    const plans = await getPlansInRange(req.userId, bounds.start, bounds.end);
    return res.status(200).json({ plans, count: plans.length });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── UPDATE A PLAN ────────────────────────────────────────────────
// PATCH /api/planner/:id   body: any of { outfitId, date, time, notes }
const updatePlan = async (req, res) => {
  try {
    const plan = await Planner.findOne({ _id: req.params.id, user: req.userId });
    if (!plan) return res.status(404).json({ message: "Planned outfit not found" });

    if (req.body.outfitId !== undefined) {
      const check = await validateOutfitBelongsToUser(req.body.outfitId, req.userId);
      if (!check.valid) return res.status(400).json({ message: check.message });
      plan.outfit = req.body.outfitId;
    }

    if (req.body.date !== undefined) {
      const planDate = buildPlanDate(req.body.date, req.body.time);
      if (!planDate) return res.status(400).json({ message: "A valid date is required" });
      plan.date = planDate;
    }

    if (req.body.notes !== undefined) {
      plan.note = req.body.notes;
    }

    await plan.save();
    const populated = await plan.populate(OUTFIT_PREVIEW_POPULATE);
    return res.status(200).json({ message: "Plan updated", plan: populated });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "You already have an outfit planned for this exact date and time" });
    }
    return res.status(500).json({ message: "Something went wrong while updating the plan" });
  }
};

// ── DELETE A PLAN ────────────────────────────────────────────────
// DELETE /api/planner/:id
const deletePlan = async (req, res) => {
  try {
    const plan = await Planner.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!plan) return res.status(404).json({ message: "Planned outfit not found" });
    return res.status(200).json({ message: "Plan removed" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── GET UPCOMING PLANS ────────────────────────────────────────────
// GET /api/planner/upcoming?limit=2
const getUpcoming = async (req, res) => {
  try {
    const plans = await fetchUpcomingPlans(req.userId, req.query.limit);
    return res.status(200).json({ plans, count: plans.length });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  createPlan,
  getMonthlyPlans,
  getPlanByDate,
  updatePlan,
  deletePlan,
  getUpcoming,
};