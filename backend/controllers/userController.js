const User = require("../models/userModel");

// GET /api/user/profile
// Returns the logged-in user's profile data for the dashboard
const getProfile = async (req, res) => {
  try {
    // req.userId is set by the protect middleware after verifying the access token
    const user = await User.findById(req.userId).select(
      "-password -googleId"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getProfile };
