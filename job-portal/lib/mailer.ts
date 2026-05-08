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
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

/** True only when all four SMTP vars are present */
export const EMAIL_ENABLED: boolean = !!(
  SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS
);

function createTransport() {
  return nodemailer.createTransport({
    host:   SMTP_HOST!,
    port:   Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT ?? 587) === 465,
    auth: {
      user: SMTP_USER!,
      pass: SMTP_PASS!,
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

  const from    = SMTP_FROM ?? SMTP_USER ?? 'no-reply@BookMyIntern.com';
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
