const Planner = require("../models/plannerModel");

const DEFAULT_UPCOMING_LIMIT = 2;
const MAX_UPCOMING_LIMIT = 20;

// Fields we actually need from the outfit for calendar/preview cards —
// keeps populate() payloads light since items further populate a Cloth image.
const OUTFIT_PREVIEW_POPULATE = {
  path: "outfit",
  select: "name occasion items isFavorite",
  populate: { path: "items", select: "name image category" },
};

// ── Plans within a given [start, end) range, oldest first ──────────
const getPlansInRange = async (userId, start, end) => {
  return Planner.find({ user: userId, date: { $gte: start, $lt: end } })
    .sort({ date: 1 })
    .populate(OUTFIT_PREVIEW_POPULATE);
};

// ── Every plan in a given calendar month (1-indexed month) ─────────
const getMonthlyPlans = async (userId, year, month) => {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return getPlansInRange(userId, start, end);
};

// ── Next N plans from right now onward ──────────────────────────────
const getUpcomingPlans = async (userId, limit = DEFAULT_UPCOMING_LIMIT) => {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || DEFAULT_UPCOMING_LIMIT, 1), MAX_UPCOMING_LIMIT);
  return Planner.find({ user: userId, date: { $gte: new Date() } })
    .sort({ date: 1 })
    .limit(safeLimit)
    .populate(OUTFIT_PREVIEW_POPULATE);
};

module.exports = {
  DEFAULT_UPCOMING_LIMIT,
  MAX_UPCOMING_LIMIT,
  OUTFIT_PREVIEW_POPULATE,
  getPlansInRange,
  getMonthlyPlans,
  getUpcomingPlans,
};