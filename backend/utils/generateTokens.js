const jwt = require("jsonwebtoken");

// Short-lived token, sent in JSON response, used on every API request
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // e.g. "15m"
  });
};

// Long-lived token, sent as httpOnly cookie, used only to get a new access token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // e.g. "7d"
  });
};

module.exports = { generateAccessToken, generateRefreshToken };