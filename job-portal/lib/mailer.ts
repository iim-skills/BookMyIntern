/**
 * Nodemailer-based email sender.
 *
 * Set these in .env.local to enable email verification:
 *   SMTP_HOST   smtp.gmail.com
 *   SMTP_PORT   587
 *   SMTP_USER   your@gmail.com
 *   SMTP_PASS   your-16-char-app-password   (Google App Password — NOT login password)
 *   SMTP_FROM   BookMyIntern <your@gmail.com>
 *
 * If any of the above are missing, EMAIL_ENABLED is false and signup
 * will auto-verify all new users (no OTP step).
 */

import nodemailer from 'nodemailer';

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  ADMIN_EMAIL,
} = process.env;

/** True only when all four SMTP vars are present */
export const EMAIL_ENABLED: boolean = !!(
  MAIL_HOST && MAIL_PORT && MAIL_USER && MAIL_PASS
);

function createTransport() {
  return nodemailer.createTransport({
    host:   MAIL_HOST!,
    port:   Number(MAIL_PORT ?? 587),
    secure: Number(MAIL_PORT ?? 587) === 465,
    auth: {
      user: MAIL_USER!,
      pass: MAIL_PASS!,
    },
  });
}

/**
 * Send a 6-digit OTP verification email.
 * Throws on SMTP error — callers should catch.
 */
export async function sendVerificationEmail(
  to:   string,
  name: string,
  otp:  string,
): Promise<void> {
  if (!EMAIL_ENABLED) {
    console.warn('[mailer] EMAIL_ENABLED=false — skipping email to', to);
    return;
  }

  const from    = MAIL_USER ?? 'no-reply@BookMyIntern.com';
  const subject = 'Verify your BookMyIntern email';
  const html    = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 16px;color:#1a1a1a;">
  <h2 style="margin-bottom:8px;">Verify your email</h2>
  <p>Hi <strong>${name}</strong>,</p>
  <p>Use the code below to complete your BookMyIntern sign-up. It expires in <strong>15 minutes</strong>.</p>
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
    <span style="font-size:2.5rem;font-weight:700;letter-spacing:10px;color:#1d4ed8;">${otp}</span>
  </div>
  <p style="font-size:0.85rem;color:#6b7280;">
    If you didn't create an account, you can ignore this email.
  </p>
</body>
</html>`;

  const transport = createTransport();
  await transport.sendMail({ from, to, subject, html });
}

/**
 * Send a 2FA OTP code email.
 */
export async function send2FAEmail(
  to:   string,
  name: string,
  otp:  string,
): Promise<void> {
  if (!EMAIL_ENABLED) {
    console.warn('[mailer] EMAIL_ENABLED=false — skipping 2FA code to', to);
    return;
  }

  const from    = MAIL_USER ?? 'no-reply@BookMyIntern.com';
  const subject = 'Your BookMyIntern 2FA Code';
  const html    = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 16px;color:#1a1a1a;">
  <h2 style="margin-bottom:8px;">Your 2FA Login Code</h2>
  <p>Hi <strong>${name}</strong>,</p>
  <p>Use the code below to log in securely to your BookMyIntern account. It expires in <strong>10 minutes</strong>.</p>
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
    <span style="font-size:2.5rem;font-weight:700;letter-spacing:10px;color:#1d4ed8;">${otp}</span>
  </div>
  <p style="font-size:0.85rem;color:#6b7280;">
    If you did not request this login attempt, please change your password immediately.
  </p>
</body>
</html>`;

  const transport = createTransport();
  await transport.sendMail({ from, to, subject, html });
}

/**
 * Send a Password Reset link email.
 */
export async function sendPasswordResetEmail(
  to:   string,
  name: string,
  link: string,
): Promise<void> {
  if (!EMAIL_ENABLED) {
    console.warn('[mailer] EMAIL_ENABLED=false — skipping password reset to', to);
    return;
  }

  const from    = MAIL_USER ?? 'no-reply@BookMyIntern.com';
  const subject = 'Reset your BookMyIntern Password';
  const html    = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 16px;color:#1a1a1a;">
  <h2 style="margin-bottom:8px;">Reset your password</h2>
  <p>Hi <strong>${name}</strong>,</p>
  <p>We received a request to reset your password. Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.</p>
  <div style="margin:24px 0;text-align:center;">
    <a href="${link}" style="background:#004ac6;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Reset Password</a>
  </div>
  <p style="font-size:0.85rem;color:#6b7280;">
    Or copy and paste this link in your browser:<br/>
    <a href="${link}" style="color:#004ac6;">${link}</a>
  </p>
  <p style="font-size:0.85rem;color:#6b7280;margin-top:24px;">
    If you didn't request a password reset, you can safely ignore this email.
  </p>
</body>
</html>`;

  const transport = createTransport();
  await transport.sendMail({ from, to, subject, html });
}
