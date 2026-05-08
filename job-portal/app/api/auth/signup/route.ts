import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { isEmailAllowed } from '@/lib/emailValidator';
import { EMAIL_ENABLED, sendVerificationEmail } from '@/lib/mailer';

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      name?: string; email?: string; password?: string;
      role?: string; adminKey?: string;
    };
    const { name, email, password, role, adminKey } = body;

    if (!name || !email || !password || !role)
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    if (!['student', 'recruiter', 'admin'].includes(role))
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });

    // ── Admin signup requires the secret key ──────────────────────────────
    if (role === 'admin') {
      const expectedKey = process.env.ADMIN_SIGNUP_KEY?.trim();
      if (!expectedKey)
        return NextResponse.json(
          { error: 'Admin signup is not enabled on this server.' },
          { status: 403 }
        );
      if (!adminKey || adminKey.trim() !== expectedKey)
        return NextResponse.json(
          { error: 'Invalid admin secret key.' },
          { status: 403 }
        );
    }

    // ── Block disposable email addresses ──────────────────────────────────
    const emailCheck = isEmailAllowed(email);
    if (!emailCheck.ok)
      return NextResponse.json({ error: emailCheck.reason }, { status: 400 });

    await connectDB();
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });

    const otp    = generateOTP();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    // Admins are always email-verified immediately — no OTP step
    const isAdmin = role === 'admin';

    await User.create({
      name, email, password, role,
      emailVerified:     isAdmin || !EMAIL_ENABLED,
      verificationToken: isAdmin || !EMAIL_ENABLED ? null : otp,
      tokenExpiry:       isAdmin || !EMAIL_ENABLED ? null : expiry,
    });

    if (!isAdmin && EMAIL_ENABLED) {
      await sendVerificationEmail(email, name, otp);
      return NextResponse.json({ ok: true, requiresVerification: true }, { status: 201 });
    }

    return NextResponse.json({ ok: true, requiresVerification: false }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
