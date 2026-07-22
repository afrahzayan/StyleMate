const {
  getAdminDashboardSummary,
  getUsersList,
  setUserStatus,
  deleteUserById,
} = require("../services/adminService");

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

module.exports = {
  getDashboardSummary,
  getUsers,
  blockUser,
  unblockUser,
  deleteUser,
};