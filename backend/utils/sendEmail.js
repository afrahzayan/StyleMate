const nodemailer = require("nodemailer");

// Using Gmail here. Go to Google Account -> Security -> App Passwords
// to generate EMAIL_PASS (do NOT use your normal Gmail password).
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"StyleMate" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your StyleMate Verification Code",
    html: `
      <h2>StyleMate Email Verification</h2>
      <p>Your OTP code is:</p>
      <h1>${otp}</h1>
      <p>This code will expire in 5 minutes.</p>
    `,
  });
};

module.exports = sendOtpEmail;