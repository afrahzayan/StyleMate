const User = require("../models/userModel");

// Turns "Afrah Zayan" into "afrah.zayan", then appends a number if taken.
const generateUsername = async (name, email) => {
  const base = (name || email.split("@")[0])
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s.]/g, "")
    .replace(/\s+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "")
    .slice(0, 20) || "user";

  let candidate = base;
  let suffix = 0;

  while (await User.exists({ username: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }

  return candidate;
};

module.exports = generateUsername;