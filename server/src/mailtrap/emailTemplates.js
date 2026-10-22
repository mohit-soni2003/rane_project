/*
 * Email templates — design only.
 *
 * IMPORTANT: email.js fills these in with String.replace("{placeholder}", value),
 * which only replaces the FIRST occurrence. Each placeholder below must therefore
 * appear exactly once per template and keep its exact spelling:
 *   {verificationCode}  {resetURL}  {userName}  {userEmail}  {userPassword}
 *
 * Markup is table-based with inline styles so it renders in Gmail, Outlook and
 * mobile mail apps. No external images or CSS are used.
 */

const SITE_URL = "https://www.raneandsons.in";
const SIGNIN_URL = `${SITE_URL}/signin`;
const SUPPORT_EMAIL = "sales@ranendranesons.site";

const C = {
  accent: "#f59e0b",
  accentDark: "#b45309",
  ink: "#0b1220",
  text: "#475569",
  muted: "#64748b",
  line: "#e2e8f0",
  page: "#eef2f7",
  soft: "#f6f8fb",
};

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/* ── building blocks ── */

const paragraph = (html, style = "") =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.7;color:${C.text};${style}">${html}</p>`;

const iconCircle = (symbol, bg, color) => `
  <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 22px;">
    <tr>
      <td align="center" valign="middle" width="72" height="72" style="width:72px;height:72px;border-radius:36px;background:${bg};color:${color};font-family:${FONT};font-size:32px;font-weight:700;line-height:72px;text-align:center;">${symbol}</td>
    </tr>
  </table>`;

const heading = (text) =>
  `<h1 style="margin:0 0 18px;font-family:${FONT};font-size:26px;line-height:1.25;font-weight:800;letter-spacing:-0.4px;color:${C.ink};text-align:center;">${text}</h1>`;

const button = (href, label) => `
  <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:28px auto;">
    <tr>
      <td align="center" bgcolor="${C.accent}" style="border-radius:999px;background:${C.accent};">
        <a href="${href}" target="_blank" style="display:inline-block;padding:15px 34px;font-family:${FONT};font-size:15px;font-weight:800;color:${C.ink};text-decoration:none;border-radius:999px;">${label}</a>
      </td>
    </tr>
  </table>`;

const callout = (html, tone = "info") => {
  const tones = {
    info: { bg: C.soft, border: C.muted },
    warn: { bg: "#fffbeb", border: C.accent },
  };
  const t = tones[tone];
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 0;">
    <tr>
      <td style="background:${t.bg};border-left:4px solid ${t.border};border-radius:10px;padding:14px 18px;font-family:${FONT};font-size:13.5px;line-height:1.65;color:${C.text};">${html}</td>
    </tr>
  </table>`;
};

const signature = (name = "The RANE &amp; SONS Team") =>
  `<p style="margin:26px 0 0;font-family:${FONT};font-size:15px;line-height:1.7;color:${C.text};">Best regards,<br><strong style="color:${C.ink};">${name}</strong></p>`;

/* ── shared page shell ── */

const layout = ({ title, preheader, body }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .px { padding-left: 22px !important; padding-right: 22px !important; }
      .code { font-size: 30px !important; letter-spacing: 6px !important; padding: 16px 12px !important; }
      .outer { padding: 16px 8px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
    <tr>
      <td align="center" class="outer" style="padding:32px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

          <!-- brand header -->
          <tr><td height="5" style="height:5px;line-height:5px;font-size:0;background:${C.accent};border-radius:20px 20px 0 0;">&nbsp;</td></tr>
          <tr>
            <td class="px" style="background:${C.ink};padding:26px 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle" width="46" height="46" style="width:46px;height:46px;border-radius:23px;background:${C.accent};font-family:${FONT};font-size:22px;font-weight:800;line-height:46px;color:${C.ink};text-align:center;">R</td>
                  <td valign="middle" style="padding-left:14px;font-family:${FONT};">
                    <div style="font-size:16px;font-weight:800;letter-spacing:0.4px;color:#ffffff;">RANE &amp; SONS PVT. LTD.</div>
                    <div style="margin-top:3px;font-size:12px;letter-spacing:0.6px;color:#94a3b8;">Construction &amp; Infrastructure</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- content -->
          <tr>
            <td class="px" style="background:#ffffff;padding:40px 44px 36px;">
${body}
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td class="px" align="center" style="background:${C.soft};border-top:1px solid ${C.line};border-radius:0 0 20px 20px;padding:26px 36px;font-family:${FONT};">
              <div style="font-size:13px;font-weight:700;color:${C.ink};">RANE &amp; SONS PVT. LTD.</div>
              <div style="margin-top:6px;font-size:12px;line-height:1.7;color:${C.muted};">101, Ranipura Main Road, Opp. Bhaiyya Ji Pyao,<br>Jagjivan Ram Mohalla, Indore, MP, India</div>
              <div style="margin-top:10px;font-size:12px;"><a href="${SITE_URL}" target="_blank" style="color:${C.accentDark};font-weight:700;text-decoration:none;">www.raneandsons.in</a></div>
              <div style="margin-top:14px;font-size:11.5px;line-height:1.6;color:#94a3b8;">This is an automated message, please do not reply to this email.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/* ── templates ── */

const VERIFICATION_EMAIL_TEMPLATE = layout({
  title: "Verify Your Email",
  preheader: "Use your verification code to complete your registration.",
  body: `
              ${iconCircle("&#9993;", "#fef3c7", C.accentDark)}
              ${heading("Verify your email")}
              ${paragraph("Hello,", "text-align:center;margin-bottom:6px;")}
              ${paragraph("Thank you for signing up! Use the verification code below to complete your registration.", "text-align:center;")}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0;">
                <tr>
                  <td align="center" class="code" style="background:${C.soft};border:2px dashed ${C.accent};border-radius:16px;padding:20px 16px;font-family:'SFMono-Regular',Consolas,'Courier New',monospace;font-size:38px;font-weight:800;letter-spacing:10px;color:${C.ink};">{verificationCode}</td>
                </tr>
              </table>
              ${paragraph("Enter this code on the verification page to confirm your account.", "text-align:center;")}
              ${callout("&#9201; <strong>This code will expire in 15 minutes</strong> for security reasons.", "warn")}
              ${callout("If you didn't create an account with us, please ignore this email.")}
              ${signature()}`,
});

const PASSWORD_RESET_SUCCESS_TEMPLATE = layout({
  title: "Password Reset Successful",
  preheader: "Your password has been changed successfully.",
  body: `
              ${iconCircle("&#10003;", "#dcfce7", "#16a34a")}
              ${heading("Password reset successful")}
              ${paragraph("Hello,", "text-align:center;margin-bottom:6px;")}
              ${paragraph("We're writing to confirm that your password has been successfully reset. You can now sign in with your new password.", "text-align:center;")}
              ${button(SIGNIN_URL, "Sign In")}
              ${callout("<strong>Wasn't you?</strong> If you did not initiate this password reset, please contact our support team immediately.", "warn")}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 0;">
                <tr>
                  <td style="background:${C.soft};border-radius:14px;padding:20px 22px;font-family:${FONT};">
                    <div style="margin-bottom:10px;font-size:13px;font-weight:800;letter-spacing:0.8px;text-transform:uppercase;color:${C.ink};">Keep your account safe</div>
                    <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;color:${C.text};">
                      <li>Use a strong, unique password</li>
                      <li>Enable two-factor authentication if available</li>
                      <li>Avoid using the same password across multiple sites</li>
                    </ul>
                  </td>
                </tr>
              </table>
              ${paragraph("Thank you for helping us keep your account secure.", "margin-top:22px;")}
              ${signature()}`,
});

const PASSWORD_RESET_REQUEST_TEMPLATE = layout({
  title: "Reset Your Password",
  preheader: "Use the secure link inside to choose a new password.",
  body: `
              ${iconCircle("&#128274;", "#fef3c7", C.accentDark)}
              ${heading("Reset your password")}
              ${paragraph("Hello,", "text-align:center;margin-bottom:6px;")}
              ${paragraph("We received a request to reset your password. Click the button below to choose a new one.", "text-align:center;")}
              <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:28px auto;">
                <tr>
                  <td align="center" bgcolor="${C.accent}" style="border-radius:999px;background:${C.accent};">
                    <a href="{resetURL}" target="_blank" style="display:inline-block;padding:15px 34px;font-family:${FONT};font-size:15px;font-weight:800;color:${C.ink};text-decoration:none;border-radius:999px;">Reset Password</a>
                  </td>
                </tr>
              </table>
              ${callout("&#9201; <strong>This link will expire in 1 hour</strong> for security reasons.", "warn")}
              ${callout("If you didn't make this request, you can safely ignore this email. Your password will not change.")}
              ${signature()}`,
});

const ACCOUNT_CREATION_TEMPLATE = layout({
  title: "Account Created Successfully",
  preheader: "Welcome aboard! Your RANE &amp; SONS account is ready.",
  body: `
              ${iconCircle("&#127881;", "#fef3c7", C.accentDark)}
              ${heading("Welcome to RANE &amp; SONS")}
              ${paragraph("Dear {userName},", "margin-bottom:8px;")}
              ${paragraph("Welcome to <strong style=\"color:" + C.ink + ";\">RANE &amp; SONS WORK &amp; MANAGEMENT SYSTEM!</strong> We&rsquo;re excited to have you on board. Your account has been successfully created &mdash; here are your login details:")}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0;background:${C.soft};border:1px solid ${C.line};border-radius:16px;">
                <tr>
                  <td style="padding:20px 22px;border-bottom:1px solid ${C.line};font-family:${FONT};">
                    <div style="font-size:11.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.muted};">Registered Email</div>
                    <div style="margin-top:4px;font-size:15px;font-weight:700;color:${C.ink};word-break:break-all;">{userEmail}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 22px;font-family:${FONT};">
                    <div style="font-size:11.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.muted};">Password</div>
                    <div style="margin-top:4px;font-size:15px;font-weight:700;color:${C.ink};word-break:break-all;font-family:'SFMono-Regular',Consolas,'Courier New',monospace;">{userPassword}</div>
                  </td>
                </tr>
              </table>
              ${callout("&#128274; For your security, please change your password after your first sign-in.", "warn")}
              ${paragraph("You can now log in and start exploring all the features we offer.", "margin-top:22px;text-align:center;")}
              ${button(SIGNIN_URL, "Login Now")}
              ${paragraph("If you have any questions or need assistance, contact our support team at <a href=\"mailto:" + SUPPORT_EMAIL + "\" style=\"color:" + C.accentDark + ";font-weight:700;text-decoration:none;\">" + SUPPORT_EMAIL + "</a>.", "text-align:center;")}
              <p style="margin:26px 0 0;font-family:${FONT};font-size:15px;line-height:1.7;color:${C.text};">Best regards,<br><strong style="color:${C.ink};">RANE &amp; SONS</strong><br><a href="${SITE_URL}" target="_blank" style="color:${C.accentDark};font-weight:700;text-decoration:none;">www.raneandsons.in</a></p>`,
});

module.exports = {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  ACCOUNT_CREATION_TEMPLATE,
};
