const User = require("../models/userModel");
const Cloth = require("../models/clothModel");
const Outfit = require("../models/outfitModel");
const AiSuggestion = require("../models/aiSuggestionModel");
const Report = require("../models/reportModel");

const ACTIVITY_WINDOW_DAYS = 30;
const RECENT_REPORTS_LIMIT = 4;

const CLOTH_CATEGORIES = ["Top", "Bottom", "Dress", "Hijab", "Foot Wears", "Bags", "Accessories"];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysAgo = (n) => {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
};

// ── counts & deltas ─────────────────────────────────────────────
const getOverviewCounts = async () => {
  const now = new Date();
  const weekAgo = daysAgo(7);
  const monthAgo = daysAgo(30);
  const todayStart = startOfDay(now);

  const [
    totalUsers,
    newUsersThisWeek,
    totalClothes,
    newClothesToday,
    totalOutfits,
    newOutfitsThisWeek,
    totalAiRequests,
    aiRequestsThisMonth,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ createdAt: { $gte: weekAgo } }),
    Cloth.countDocuments({ isDeleted: false }),
    Cloth.countDocuments({ isDeleted: false, createdAt: { $gte: todayStart } }),
    Outfit.countDocuments({}),
    Outfit.countDocuments({ createdAt: { $gte: weekAgo } }),
    AiSuggestion.countDocuments({}),
    AiSuggestion.countDocuments({ createdAt: { $gte: monthAgo } }),
  ]);

  return {
    totalUsers,
    newUsersThisWeek,
    totalClothes,
    newClothesToday,
    totalOutfits,
    newOutfitsThisWeek,
    totalAiRequests,
    aiRequestsThisMonth,
  };
};

// ── users activity (signups per day, past 30 days) ─────────────
const getUsersActivity = async () => {
  const since = daysAgo(ACTIVITY_WINDOW_DAYS - 1);

  const rows = await User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
  ]);

  const countsByDate = Object.fromEntries(rows.map((r) => [r._id, r.count]));

  const series = [];
  for (let i = ACTIVITY_WINDOW_DAYS - 1; i >= 0; i -= 1) {
    const date = daysAgo(i);
    const key = date.toISOString().slice(0, 10);
    series.push({ date: key, newUsers: countsByDate[key] || 0 });
  }

  return series;
};

// ── clothes by category (global) ────────────────────────────────
const getClothesByCategory = async () => {
  const rows = await Cloth.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const countsByCategory = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  const total = Object.values(countsByCategory).reduce((sum, c) => sum + c, 0);

  return CLOTH_CATEGORIES.map((category) => {
    const count = countsByCategory[category] || 0;
    return {
      category,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  }).filter((row) => row.count > 0);
};

// ── recent report alerts ────────────────────────────────────────
const getRecentReports = async (limit = RECENT_REPORTS_LIMIT) => {
  const reports = await Report.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("reportedUser", "name email")
    .lean();

  return reports.map((r) => ({
    id: r._id,
    category: r.category,
    description: r.description,
    status: r.status,
    reportedUser: r.reportedUser
      ? { id: r.reportedUser._id, name: r.reportedUser.name, email: r.reportedUser.email }
      : null,
    createdAt: r.createdAt,
  }));
};

const getPendingReportsCount = async () => {
  return Report.countDocuments({ status: { $ne: "resolved" } });
};

const getAdminDashboardSummary = async () => {
  const [overview, usersActivity, clothesByCategory, recentReports, pendingReportsCount] =
    await Promise.all([
      getOverviewCounts(),
      getUsersActivity(),
      getClothesByCategory(),
      getRecentReports(),
      getPendingReportsCount(),
    ]);

  return { overview, usersActivity, clothesByCategory, recentReports, pendingReportsCount };
};

// ── user management ─────────────────────────────────────────────
const getUsersList = async ({ page = 1, limit = 5, search = "" } = {}) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50);

  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const [users, total, activeUsers, blockedUsers, pendingApproval] = await Promise.all([
    User.find(filter)
      .select("name email role status isVerified createdAt profileImage")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ status: "blocked" }),
    User.countDocuments({ isVerified: false }),
  ]);

  return {
    users,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    stats: { totalUsers: total, activeUsers, blockedUsers, pendingApproval },
  };
};

const setUserStatus = async (userId, status) => {
  const target = await User.findById(userId);
  if (!target) {
    return { success: false, code: 404, message: "User not found" };
  }
  if (target.role === "admin") {
    return { success: false, code: 403, message: "Admins cannot be blocked" };
  }

  target.status = status;
  await target.save();

  return { success: true, user: target };
};

const deleteUserById = async (userId) => {
  const target = await User.findById(userId);
  if (!target) {
    return { success: false, code: 404, message: "User not found" };
  }
  if (target.role === "admin") {
    return { success: false, code: 403, message: "Admins cannot be deleted" };
  }

  await target.deleteOne();
  return { success: true };
};

module.exports = {
  getAdminDashboardSummary,
  getUsersList,
  setUserStatus,
  deleteUserById,
};