const User = require("../models/userModel");

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role status");

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Your account has been blocked" });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = requireAdmin;