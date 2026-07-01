const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const redisClient = require("../config/redis");
const generateOtp = require("../utils/generateOtp");
const sendOtpEmail = require("../utils/sendEmail");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateTokens");

/* -----------------------------------------------------------
 * 1. REGISTER
 * - Creates the user (unverified)
 * - Sends an OTP to their email
 * - OTP is stored in Redis for 5 minutes only
 * --------------------------------------------------------- */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "local",
      isVerified: false,
    });

    const otp = generateOtp();

    await redisClient.set(`otp:${email}`, otp, "EX", 300);

    await sendOtpEmail(email, otp);

    return res.status(201).json({
      message: "OTP sent to your email. Please verify to continue.",
      userId: newUser._id,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};



const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const savedOtp = await redisClient.get(`otp:${email}`);

    if (!savedOtp) {
      return res.status(400).json({ message: "OTP expired, please resend" });
    }

    if (savedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    await redisClient.del(`otp:${email}`); // OTP used, remove it

    // Auto-login after verification
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token in Redis so we can check/invalidate it later
    await redisClient.set(
      `refreshToken:${user._id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60 // 7 days in seconds
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Email verified successfully",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};




const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOtp();
    await redisClient.set(`otp:${email}`, otp, "EX", 300);
    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};




const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // password has `select: false` in the model, so we explicitly ask for it
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await redisClient.set(
      `refreshToken:${user._id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    user.lastLoginAt = new Date();
    await user.save();

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};




const refreshAccessToken = async (req, res) => {
  try {
    const tokenFromCookie = req.cookies.refreshToken;

    if (!tokenFromCookie) {
      return res.status(401).json({ message: "No refresh token found" });
    }

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(tokenFromCookie, process.env.REFRESH_TOKEN_SECRET);

    const savedToken = await redisClient.get(`refreshToken:${decoded.id}`);

    if (!savedToken || savedToken !== tokenFromCookie) {
      return res.status(401).json({ message: "Refresh token invalid, please login again" });
    }

    const newAccessToken = generateAccessToken(decoded.id);

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ message: "Refresh token expired, please login again" });
  }
};




const logout = async (req, res) => {
  try {
    const tokenFromCookie = req.cookies.refreshToken;

    if (tokenFromCookie) {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(tokenFromCookie, process.env.REFRESH_TOKEN_SECRET);
      await redisClient.del(`refreshToken:${decoded.id}`);
    }

    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out successfully" });
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  refreshAccessToken,
  logout,
};