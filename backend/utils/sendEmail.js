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

const buildOtpEmailHtml = (otp, expiryMinutes = 5) => {
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

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Verify Your Email Address</title>
</head>
<body style="margin:0; padding:0; background-color:${BRAND.bg}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
    Your StyleMate verification code is ${otp}. It expires in ${expiryMinutes} minutes.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px; width:100%;">

          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:22px; font-weight:800; color:${BRAND.textDark}; letter-spacing:-0.3px;">
                    StyleMate
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color:${BRAND.card}; border:1px solid ${BRAND.border}; border-radius:16px; overflow:hidden;">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:6px; background-color:${BRAND.secondary}; background-image:linear-gradient(90deg, ${BRAND.secondary} 0%, ${BRAND.primary} 100%); font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:40px 36px 32px 36px;">

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
                      Thanks for signing up with StyleMate! Use the verification code below to confirm your email address and finish setting up your digital wardrobe.
                    </p>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 20px auto;">
                      <tr>
                        ${otpDigitsHtml}
                      </tr>
                    </table>

                    <p style="margin:0 0 28px 0; text-align:center; font-size:13px; line-height:20px; color:${BRAND.textMuted};">
                      This code expires in <strong style="color:${BRAND.textBody};">${expiryMinutes} minutes</strong>.
                    </p>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="border-top:1px solid ${BRAND.border}; font-size:0; line-height:0;">&nbsp;</td>
                      </tr>
                    </table>

                    <p style="margin:24px 0 0 0; text-align:center; font-size:12px; line-height:18px; color:${BRAND.textMuted};">
                      If you didn't request this verification, you can safely ignore this email.
                    </p>

                    <p style="margin:28px 0 0 0; text-align:center; font-size:14px; line-height:22px; color:${BRAND.textBody};">
                      Happy styling! 👗<br />
                      <strong style="color:${BRAND.textDark};">The StyleMate Team</strong>
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

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

const sendOtpEmail = async (toEmail, otp, expiryMinutes = 5) => {
  await transporter.sendMail({
    from: `"StyleMate" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your StyleMate Verification Code",
    html: buildOtpEmailHtml(otp, expiryMinutes),
    text: `Your StyleMate verification code is ${otp}. It expires in ${expiryMinutes} minutes. If you didn't request this, you can safely ignore this email.`,
  });
};

module.exports = sendOtpEmail;
