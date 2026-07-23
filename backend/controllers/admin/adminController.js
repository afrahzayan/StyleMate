const {
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
} = require("../../services/adminService");

const getDashboardSummary = async (req, res) => {
  try {
    const summary = await getAdminDashboardSummary();
    return res.status(200).json({ dashboard: summary });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading the dashboard" });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await getUsersList({ page, limit, search });
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading users" });
  }
};

const blockUser = async (req, res) => {
  try {
    const result = await setUserStatus(req.params.id, "blocked");
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json({ message: "User blocked", user: result.user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const unblockUser = async (req, res) => {
  try {
    const result = await setUserStatus(req.params.id, "active");
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json({ message: "User unblocked", user: result.user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await deleteUserById(req.params.id);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── cloth management ─────────────────────────────────────────────
const getClothes = async (req, res) => {
  try {
    const { page, limit, search, category, occasion, season, status } = req.query;
    const result = await getClothesList({ page, limit, search, category, occasion, season, status });
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading clothes" });
  }
};

const getClothFilters = async (req, res) => {
  try {
    const options = await getClothFilterOptions();
    return res.status(200).json(options);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading filters" });
  }
};

const getClothDetails = async (req, res) => {
  try {
    const cloth = await getClothDetail(req.params.id);
    if (!cloth) return res.status(404).json({ message: "Item not found" });
    return res.status(200).json({ cloth });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteCloth = async (req, res) => {
  try {
    const result = await deleteClothById(req.params.id);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json({ message: "Item removed" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── report management ────────────────────────────────────────────
const getReports = async (req, res) => {
  try {
    const { page, limit, search, category, status } = req.query;
    const result = await getReportsList({ page, limit, search, category, status });
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading reports" });
  }
};

const getReportsStats = async (req, res) => {
  try {
    const stats = await getReportStats();
    return res.status(200).json({ stats });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading report stats" });
  }
};

const getReportsActivity = async (req, res) => {
  try {
    const activity = await getModerationActivity();
    return res.status(200).json({ activity });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading report activity" });
  }
};

const getReportDetails = async (req, res) => {
  try {
    const report = await getReportDetail(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    return res.status(200).json({ report });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const resolveReportById = async (req, res) => {
  try {
    const result = await resolveReport(req.params.id, req.userId, req.body?.note);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json({ message: "Report resolved", report: result.report });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const rejectReportById = async (req, res) => {
  try {
    const result = await rejectReport(req.params.id, req.userId, req.body?.note);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json({ message: "Report rejected", report: result.report });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteReportContent = async (req, res) => {
  try {
    const result = await deleteReportedContent(req.params.id, req.userId);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json({ message: "Content removed", report: result.report });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
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
};