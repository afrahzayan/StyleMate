const mongoose = require("mongoose");
const Planner = require("../models/plannerModel");
const Outfit = require("../models/outfitModel");
const {
  OUTFIT_PREVIEW_POPULATE,
  getMonthlyPlans: fetchMonthlyPlans,
  getPlansInRange,
  getUpcomingPlans: fetchUpcomingPlans,
} = require("../services/plannerService");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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

const buildPlanDate = (dateInput, timeInput) => {
  if (!dateInput) return null;

  if (timeInput === undefined || timeInput === null || timeInput === "") {
    const asIs = new Date(dateInput);
    if (!isNaN(asIs.getTime()) && /T\d{2}:\d{2}/.test(String(dateInput))) {
      return asIs;
    }
  }

  const datePart = String(dateInput).slice(0, 10);
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
