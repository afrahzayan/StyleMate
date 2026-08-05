const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const BRAND = {
  primary: "#4a5280",
  secondary: "#6b5b8a",
  bg: "#faf8f5",
  card: "#ffffff",
  border: "#ede8e0",
  textDark: "#1c1c2e",
  textBody: "#4b5563",
  textMuted: "#9ca3af",
  otpBg: "#f0f2fa",
};

/**
 * Reusable Base Email Template
 * Wraps dynamic body content inside a fixed Header and Footer.
 */
const renderEmailTemplate = ({ title, preheader = "", bodyHtml }) => {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title || "StyleMate Notification"}</title>
</head>
<body style="margin:0; padding:0; background-color:${BRAND.bg}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  ${
    preheader
      ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>`
      : ""
  }

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px; width:100%;">

          <!-- FIXED HEADER -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:24px; font-weight:800; color:${BRAND.textDark}; letter-spacing:-0.3px;">
                StyleMate
              </span>
            </td>
          </tr>

          <!-- DYNAMIC CONTENT CARD -->
          <tr>
            <td style="background-color:${BRAND.card}; border:1px solid ${BRAND.border}; border-radius:16px; overflow:hidden;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:6px; background-color:${BRAND.secondary}; background-image:linear-gradient(90deg, ${BRAND.secondary} 0%, ${BRAND.primary} 100%); font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:36px 32px;">
                    ${bodyHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FIXED FOOTER -->
          <tr>
            <td align="center" style="padding:28px 16px 8px 16px;">
              <p style="margin:0 0 4px 0; font-size:13px; font-weight:700; color:${BRAND.textDark};">
                StyleMate
              </p>
              <p style="margin:0 0 12px 0; font-size:12px; color:${BRAND.textMuted}; font-style:italic;">
                Discover. Style. Inspire.
              </p>
              <p style="margin:0; font-size:11px; color:${BRAND.textMuted};">
                © ${new Date().getFullYear()} StyleMate Digital Boutique. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};

// 1. OTP Verification Email
const sendOtpEmail = async (toEmail, otp, expiryMinutes = 5) => {
  const otpDigits = String(otp).split("");
  const otpDigitsHtml = otpDigits
    .map(
      (digit) => `
        <td style="width:44px; height:56px; text-align:center; vertical-align:middle;
                   background-color:${BRAND.otpBg}; border:2px solid ${BRAND.primary};
                   border-radius:10px; font-family:'Courier New', Courier, monospace;
                   font-size:26px; font-weight:700; color:${BRAND.textDark};">
          ${digit}
        </td>
        <td style="width:8px;"></td>`
    )
    .join("");

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
      <tr>
        <td align="center" style="width:56px; height:56px; background-color:${BRAND.otpBg}; border-radius:50%; font-size:24px; text-align:center; vertical-align:middle;">
          ✉️
        </td>
      </tr>
    </table>

    <h1 style="margin:20px 0 8px 0; text-align:center; font-size:22px; line-height:28px; font-weight:800; color:${BRAND.textDark};">
      Verify Your Email Address
    </h1>

    <p style="margin:0 0 28px 0; text-align:center; font-size:14px; line-height:22px; color:${BRAND.textBody};">
      Thanks for signing up with StyleMate! Use the verification code below to confirm your email address.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 20px auto;">
      <tr>
        ${otpDigitsHtml}
      </tr>
    </table>

    <p style="margin:0 0 28px 0; text-align:center; font-size:13px; line-height:20px; color:${BRAND.textMuted};">
      This code expires in <strong style="color:${BRAND.textBody};">${expiryMinutes} minutes</strong>.
    </p>

    <p style="margin:24px 0 0 0; text-align:center; font-size:12px; line-height:18px; color:${BRAND.textMuted};">
      If you didn't request this verification, you can safely ignore this email.
    </p>`;

  await transporter.sendMail({
    from: `"StyleMate" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your StyleMate Verification Code",
    html: renderEmailTemplate({
      title: "Verify Your Email Address",
      preheader: `Your StyleMate verification code is ${otp}.`,
      bodyHtml,
    }),
    text: `Your StyleMate verification code is ${otp}. It expires in ${expiryMinutes} minutes.`,
  });
};

// 2. Order Delivery Status Update Email
const sendStatusEmail = async ({
  toEmail,
  userName = "Valued Customer",
  orderId = "",
  orderTitle = "Custom Garment",
  status = "Processing",
  expectedDeliveryDate = null,
  shortMessage = "",
}) => {
  if (!toEmail) return;

  const formattedDate = expectedDeliveryDate
    ? new Date(expectedDeliveryDate).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "To be calculated";

  const orderShortId = orderId ? `#${String(orderId).slice(-6).toUpperCase()}` : "";
  const displayMsg = shortMessage || `Your StyleMate order status has been updated to "${status}".`;

  const bodyHtml = `
    <h1 style="margin:0 0 12px 0; text-align:center; font-size:20px; line-height:26px; font-weight:800; color:${BRAND.textDark};">
      Order Status Update
    </h1>

    <p style="margin:0 0 20px 0; text-align:center; font-size:14px; line-height:22px; color:${BRAND.textBody};">
      Hi <strong>${userName}</strong>,<br />
      ${displayMsg}
    </p>

    <div style="background-color:${BRAND.bg}; border:1px solid ${BRAND.border}; border-radius:12px; padding:16px; margin-bottom:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px; color:${BRAND.textDark};">
        <tr>
          <td style="padding:4px 0; color:${BRAND.textMuted}; font-weight:600;">Order ID:</td>
          <td align="right" style="padding:4px 0; font-weight:700;">${orderShortId || orderTitle}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:${BRAND.textMuted}; font-weight:600;">Item:</td>
          <td align="right" style="padding:4px 0; font-weight:700;">${orderTitle}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:${BRAND.textMuted}; font-weight:600;">Current Status:</td>
          <td align="right" style="padding:4px 0; font-weight:800; color:${BRAND.primary};">${status}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:${BRAND.textMuted}; font-weight:600;">Expected Delivery:</td>
          <td align="right" style="padding:4px 0; font-weight:700; color:#10b981;">${formattedDate}</td>
        </tr>
      </table>
    </div>

    <p style="margin:0; text-align:center; font-size:13px; line-height:20px; color:${BRAND.textBody};">
      You can view real-time tracking updates directly in your StyleMate account dashboard.
    </p>`;

  await transporter.sendMail({
    from: `"StyleMate" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Order Status Update: ${status} (${orderShortId || orderTitle})`,
    html: renderEmailTemplate({
      title: "Order Delivery Status Update",
      preheader: `Your StyleMate order status is now ${status}.`,
      bodyHtml,
    }),
    text: `Hi ${userName}, ${displayMsg}. Current Status: ${status}. Expected Delivery: ${formattedDate}.`,
  });
};

// 3. Post Automatic Removal Email
const sendPostRemovedEmail = async ({
  toEmail,
  userName = "Member",
  postTitle = "Your Post",
  reportCount = 5,
}) => {
  if (!toEmail) return;

  const bodyHtml = `
    <h1 style="margin:0 0 12px 0; text-align:center; font-size:20px; line-height:26px; font-weight:800; color:#dc2626;">
      Community Post Notice
    </h1>

    <p style="margin:0 0 16px 0; text-align:center; font-size:14px; line-height:22px; color:${BRAND.textBody};">
      Hi <strong>${userName}</strong>,
    </p>

    <p style="margin:0 0 20px 0; text-align:center; font-size:14px; line-height:22px; color:${BRAND.textBody};">
      Your community post <strong>"${postTitle}"</strong> has been automatically removed from the public feed because it received <strong>${reportCount} or more user reports</strong>.
    </p>

    <div style="background-color:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:16px; margin-bottom:20px; text-align:center;">
      <p style="margin:0; font-size:12px; line-height:18px; color:#991b1b; font-weight:600;">
        Moderation Rule: Content receiving 5 or more community reports is hidden automatically to ensure community safety. Your account remains active and in good standing.
      </p>
    </div>

    <p style="margin:0; text-align:center; font-size:12px; line-height:18px; color:${BRAND.textMuted};">
      If you believe this action was taken in error, please reach out to support.
    </p>`;

  await transporter.sendMail({
    from: `"StyleMate Safety" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Community Post Removed: "${postTitle}"`,
    html: renderEmailTemplate({
      title: "Community Post Removed",
      preheader: `Your post "${postTitle}" was automatically removed following community reports.`,
      bodyHtml,
    }),
    text: `Hi ${userName}, your post "${postTitle}" was automatically removed because it received ${reportCount} or more reports according to platform moderation rules.`,
  });
};

module.exports = sendOtpEmail;
module.exports.sendOtpEmail = sendOtpEmail;
module.exports.sendStatusEmail = sendStatusEmail;
module.exports.sendPostRemovedEmail = sendPostRemovedEmail;
module.exports.renderEmailTemplate = renderEmailTemplate;
