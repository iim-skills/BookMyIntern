import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { EMAIL_ENABLED, sendVerificationEmail } from '@/lib/mailer';

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── POST: verify the OTP ──────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { email?: string; otp?: string };
    const { email, otp } = body;

    if (!email || !otp)
      return NextResponse.json(
        { error: 'Email and verification code are required.' },
        { status: 400 }
      );

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return NextResponse.json({ error: 'No account found.' }, { status: 404 });

    if (user.emailVerified)
      return NextResponse.json({ ok: true, alreadyVerified: true });

    if (!user.verificationToken || !user.tokenExpiry)
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      );

    if (new Date() > new Date(user.tokenExpiry))
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );

    if (user.verificationToken !== otp.trim())
      return NextResponse.json(
        { error: 'Incorrect code. Please check your email and try again.' },
        { status: 400 }
      );

    // Mark verified
    user.emailVerified     = true;
    user.verificationToken = null;
    user.tokenExpiry       = null;
    await user.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/auth/verify-email]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// ── PUT: resend a fresh OTP ───────────────────────────────────────────────────
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { email?: string };
    const { email } = body;

    if (!email)
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });

    if (!EMAIL_ENABLED)
      return NextResponse.json(
        { error: 'Email verification is not configured on this server.' },
        { status: 503 }
      );

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return NextResponse.json({ error: 'No account found.' }, { status: 404 });

    if (user.emailVerified)
      return NextResponse.json({ ok: true, alreadyVerified: true });

    const otp    = generateOTP();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    user.verificationToken = otp;
    user.tokenExpiry       = expiry;
    await user.save();

    await sendVerificationEmail(user.email, user.name, otp);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/auth/verify-email]', err);
    return NextResponse.json({ error: 'Failed to resend code. Please try again.' }, { status: 500 });
  }
}
