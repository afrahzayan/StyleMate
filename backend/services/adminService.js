const User = require("../models/userModel");
const Cloth = require("../models/clothModel");
const Outfit = require("../models/outfitModel");
const AiSuggestion = require("../models/aiSuggestionModel");
const Report = require("../models/reportModel");
const CommunityPost = require("../models/communityPostModel");
const Comment = require("../models/commentModel");

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

// ── cloth management ─────────────────────────────────────────────
// "Status" isn't a real field on Cloth — it's derived from the existing
// isDeleted flag so we don't need a schema change: false -> Active, true -> Removed.
const clothStatus = (isDeleted) => (isDeleted ? "Removed" : "Active");

const getClothesList = async ({
  page = 1,
  limit = 6,
  search = "",
  category = "",
  occasion = "",
  season = "",
  status = "",
} = {}) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 6, 1), 50);

  const filter = {};

  if (category) filter.category = category;
  if (occasion) filter.occasion = occasion;
  if (season) filter.season = season;
  if (status === "Active") filter.isDeleted = false;
  if (status === "Removed") filter.isDeleted = true;

  if (search && search.trim()) {
    const regex = { $regex: search.trim(), $options: "i" };

    // A search term can match the item name/category/color, OR the uploader's
    // name/email — so we first look up any matching users, then OR both sets together.
    const matchingUsers = await User.find({
      $or: [{ name: regex }, { email: regex }],
    }).select("_id");

    filter.$or = [
      { name: regex },
      { category: regex },
      { "color.primary": regex },
      { user: { $in: matchingUsers.map((u) => u._id) } },
    ];
  }

  const [clothes, total, categoryRows] = await Promise.all([
    Cloth.find(filter)
      .select("image name category color season occasion isDeleted createdAt user")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Cloth.countDocuments(filter),
    // Category breakdown always reflects the *global* catalog (not the current filter),
    // matching how the "Category Stats" panel behaves on the reference UI.
    Cloth.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  const categoryStats = Object.fromEntries(categoryRows.map((r) => [r._id, r.count]));

  return {
    clothes: clothes.map((c) => ({
      id: c._id,
      image: c.image,
      name: c.name,
      category: c.category,
      color: c.color?.primary || null,
      season: c.season,
      occasion: c.occasion,
      status: clothStatus(c.isDeleted),
      uploadedAt: c.createdAt,
      user: c.user ? { id: c.user._id, name: c.user.name, email: c.user.email } : null,
    })),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    categoryStats,
  };
};

// Dropdown options for the filter bar. Category is a fixed enum; occasion and
// season are free text on the model, so we pull whatever distinct values exist.
const getClothFilterOptions = async () => {
  const [occasions, seasons] = await Promise.all([
    Cloth.distinct("occasion", { occasion: { $ne: null } }),
    Cloth.distinct("season", { season: { $ne: null } }),
  ]);

  return {
    categories: CLOTH_CATEGORIES,
    occasions: occasions.filter(Boolean).sort(),
    seasons: seasons.filter(Boolean).sort(),
    statuses: ["Active", "Removed"],
  };
};

const getClothDetail = async (clothId) => {
  const cloth = await Cloth.findById(clothId).populate("user", "name email").lean();
  if (!cloth) return null;

  return {
    ...cloth,
    status: clothStatus(cloth.isDeleted),
    user: cloth.user ? { id: cloth.user._id, name: cloth.user.name, email: cloth.user.email } : null,
  };
};

// Mirrors the user-facing deleteCloth controller: a soft delete, so nothing
// is destroyed and the action can be reasoned about/undone later if needed.
const deleteClothById = async (clothId) => {
  const cloth = await Cloth.findOne({ _id: clothId, isDeleted: false });
  if (!cloth) {
    return { success: false, code: 404, message: "Item not found" };
  }

  cloth.isDeleted = true;
  await cloth.save();

  return { success: true };
};

// ── report management ───────────────────────────────────────────
const REPORT_STATUS_FILTERS = ["new", "reviewing", "high_priority", "critical", "resolved", "rejected"];

const getReportsList = async ({
  page = 1,
  limit = 4,
  search = "",
  category = "",
  status = "",
} = {}) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 4, 1), 50);

  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;

  if (search && search.trim()) {
    const regex = { $regex: search.trim(), $options: "i" };

    // Search can match the report description itself, OR the reported user's name/email.
    const matchingUsers = await User.find({ $or: [{ name: regex }, { email: regex }] }).select("_id");

    filter.$or = [
      { description: regex },
      { reportedUser: { $in: matchingUsers.map((u) => u._id) } },
    ];
  }

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("reportedUser", "name email")
      .populate("reportedBy", "name email")
      .lean(),
    Report.countDocuments(filter),
  ]);

  return {
    reports: reports.map((r) => ({
      id: r._id,
      targetType: r.targetType,
      targetId: r.targetId,
      category: r.category,
      description: r.description,
      status: r.status,
      reportedUser: r.reportedUser
        ? { id: r.reportedUser._id, name: r.reportedUser.name, email: r.reportedUser.email }
        : null,
      reportedBy: r.reportedBy
        ? { id: r.reportedBy._id, name: r.reportedBy.name, email: r.reportedBy.email }
        : null,
      resolutionNote: r.resolutionNote,
      createdAt: r.createdAt,
    })),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  };
};

// Stat cards at the top of the Reports page.
const getReportStats = async () => {
  const todayStart = startOfDay(new Date());

  const [pendingReviews, resolvedToday, totalReports, resolvedTotal] = await Promise.all([
    Report.countDocuments({ status: { $nin: ["resolved", "rejected"] } }),
    Report.countDocuments({ status: "resolved", updatedAt: { $gte: todayStart } }),
    Report.countDocuments({}),
    Report.countDocuments({ status: "resolved" }),
  ]);

  const resolutionRate = totalReports > 0 ? Math.round((resolvedTotal / totalReports) * 100) : 0;

  return { pendingReviews, resolvedToday, resolutionRate };
};

// Daily report counts for the last 7 days, for the "Moderation Activity" bar chart.
const getModerationActivity = async () => {
  const since = daysAgo(6);

  const rows = await Report.aggregate([
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
  for (let i = 6; i >= 0; i -= 1) {
    const date = daysAgo(i);
    const key = date.toISOString().slice(0, 10);
    series.push({ date: key, reports: countsByDate[key] || 0 });
  }

  return series;
};

// Looks up the actual reported content so admins can see what's being reported,
// not just the report metadata. Returns null if the content is already gone.
const getReportedContent = async (targetType, targetId) => {
  if (targetType === "CommunityPost") {
    const post = await CommunityPost.findById(targetId).select("image title caption status").lean();
    return post ? { type: "CommunityPost", ...post } : null;
  }
  if (targetType === "Cloth") {
    const cloth = await Cloth.findById(targetId).select("image name category isDeleted").lean();
    return cloth ? { type: "Cloth", ...cloth } : null;
  }
  if (targetType === "Comment") {
    const comment = await Comment.findById(targetId).select("text").lean();
    return comment ? { type: "Comment", ...comment } : null;
  }
  return null;
};

const getReportDetail = async (reportId) => {
  const report = await Report.findById(reportId)
    .populate("reportedUser", "name email")
    .populate("reportedBy", "name email")
    .populate("resolvedBy", "name email")
    .lean();

  if (!report) return null;

  const content = await getReportedContent(report.targetType, report.targetId);

  return { ...report, content };
};

const resolveReport = async (reportId, adminId, note = "") => {
  const report = await Report.findById(reportId);
  if (!report) return { success: false, code: 404, message: "Report not found" };

  report.status = "resolved";
  report.resolvedBy = adminId;
  report.resolutionNote = note || report.resolutionNote;
  await report.save();

  return { success: true, report };
};

const rejectReport = async (reportId, adminId, note = "") => {
  const report = await Report.findById(reportId);
  if (!report) return { success: false, code: 404, message: "Report not found" };

  report.status = "rejected";
  report.resolvedBy = adminId;
  report.resolutionNote = note || "Reviewed — no action needed";
  await report.save();

  return { success: true, report };
};

// Removes the underlying content a report points to, then marks the report resolved.
const deleteReportedContent = async (reportId, adminId) => {
  const report = await Report.findById(reportId);
  if (!report) return { success: false, code: 404, message: "Report not found" };

  if (report.targetType === "CommunityPost") {
    await CommunityPost.findByIdAndUpdate(report.targetId, { status: "removed" });
  } else if (report.targetType === "Cloth") {
    await Cloth.findByIdAndUpdate(report.targetId, { isDeleted: true });
  } else if (report.targetType === "Comment") {
    // Comments have no soft-delete field anywhere in the app, so this
    // matches the existing hard-delete behaviour used elsewhere for comments.
    await Comment.findByIdAndDelete(report.targetId);
  }

  report.status = "resolved";
  report.resolvedBy = adminId;
  report.resolutionNote = report.resolutionNote || "Content removed by admin";
  await report.save();

  return { success: true, report };
};

module.exports = {
  getAdminDashboardSummary,
  getUsersList,
  setUserStatus,
  deleteUserById,
  getClothesList,
  getClothFilterOptions,
  getClothDetail,
  deleteClothById,
  getReportsList,
  getReportStats,
  getModerationActivity,
  getReportDetail,
  resolveReport,
  rejectReport,
  deleteReportedContent,
};