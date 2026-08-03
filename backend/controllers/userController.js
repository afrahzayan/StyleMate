const User = require("../models/userModel");

const getProfile = async (req, res) => {
  try {
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

const updateProfile = async (req, res) => {
  try {
    const { name, profileImage, signatureColor } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name.trim();
    if (profileImage && typeof profileImage === "object") {
      user.profileImage = {
        url: profileImage.url || user.profileImage?.url || "",
        publicId: profileImage.publicId || user.profileImage?.publicId || "",
      };
    } else if (typeof profileImage === "string") {
      user.profileImage = {
        url: profileImage,
        publicId: user.profileImage?.publicId || "",
      };
    }
    if (signatureColor !== undefined) {
      user.signatureColor = signatureColor;
    }

    await user.save();
    const updatedUser = await User.findById(user._id).select("-password -googleId");

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

module.exports = { getProfile, updateProfile };
