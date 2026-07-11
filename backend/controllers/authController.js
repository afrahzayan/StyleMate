const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const redisClient = require("../config/redis");
const generateOtp = require("../utils/generateOtp");
const sendOtpEmail = require("../utils/sendEmail");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateTokens");

const PENDING_TTL_SECONDS = 5 * 60;
const PENDING_TTL_MINUTES = PENDING_TTL_SECONDS / 60;
const MAX_OTP_ATTEMPTS = 5;

const pendingKey = (email) => `pendingRegistration:${email}`;

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
    const otp = generateOtp();

    const pendingData = {
      name,
      email,
      password: hashedPassword,
      otp,
      attempts: 0,
    };

    await redisClient.set(
      pendingKey(email),
      JSON.stringify(pendingData),
      "EX",
      PENDING_TTL_SECONDS
    );

    await sendOtpEmail(email, otp, PENDING_TTL_MINUTES);

    return res.status(201).json({
      message: "OTP sent to your email. Please verify to continue.",
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

    const raw = await redisClient.get(pendingKey(email));
    if (!raw) {
      return res.status(400).json({
        message: "OTP expired or registration not found. Please register again.",
      });
    }

    const pending = JSON.parse(raw);

    if (pending.otp !== otp) {
      pending.attempts += 1;

      if (pending.attempts >= MAX_OTP_ATTEMPTS) {
        await redisClient.del(pendingKey(email));
        return res.status(400).json({
          message: "Too many incorrect attempts. Please register again.",
        });
      }

      const ttl = await redisClient.ttl(pendingKey(email));
      await redisClient.set(
        pendingKey(email),
        JSON.stringify(pending),
        "EX",
        ttl > 0 ? ttl : PENDING_TTL_SECONDS
      );

      return res.status(400).json({ message: "Invalid OTP" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await redisClient.del(pendingKey(email));
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      provider: "local",
      isVerified: true,
    });

    await redisClient.del(pendingKey(email));

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    await redisClient.set(
      `refreshToken:${newUser._id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Email verified successfully",
      accessToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
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
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const raw = await redisClient.get(pendingKey(email));
    if (!raw) {
      return res.status(400).json({
        message: "No pending registration found. Please register again.",
      });
    }

    const pending = JSON.parse(raw);
    pending.otp = generateOtp();
    pending.attempts = 0;

    await redisClient.set(
      pendingKey(email),
      JSON.stringify(pending),
      "EX",
      PENDING_TTL_SECONDS
    );

    await sendOtpEmail(email, pending.otp, PENDING_TTL_MINUTES);

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
