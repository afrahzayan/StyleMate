// Generates a random 6 digit OTP, e.g. "482910"
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = generateOtp;