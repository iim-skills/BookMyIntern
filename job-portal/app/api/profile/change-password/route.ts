import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { EMAIL_ENABLED, sendVerificationEmail } from '@/lib/mailer';

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── GET: probe whether email is configured — NO side effects ─────────────────
// The profile page calls this on load to decide whether to show the OTP flow
// or the direct-password flow. It must never send an email.
export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  return NextResponse.json({ emailEnabled: EMAIL_ENABLED });
}

// ── POST: OTP send / verify / direct password change ─────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json() as {
      mode?: 'otp' | 'verify' | 'direct';
      otp?: string;
      newPassword?: string;
      currentPassword?: string;
    };

    const { mode } = body;
    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    // ── mode='otp': send OTP to user's email ────────────────────────────────
    if (mode === 'otp') {
      if (!EMAIL_ENABLED)
        return NextResponse.json(
          { error: 'Email is not configured on this server. Use current password to change.' },
          { status: 503 }
        );

      const otp    = generateOTP();
      const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

      user.verificationToken = otp;
      user.tokenExpiry       = expiry;
      await user.save();

      await sendVerificationEmail(user.email, user.name as string, otp);
      return NextResponse.json({ ok: true });
    }

    // ── mode='verify': check OTP and set new password ───────────────────────
    if (mode === 'verify') {
      const { otp, newPassword } = body;

      if (!otp || !newPassword)
        return NextResponse.json({ error: 'OTP and new password are required.' }, { status: 400 });
      if (newPassword.length < 6)
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });

      if (!user.verificationToken || !user.tokenExpiry)
        return NextResponse.json(
          { error: 'No OTP found. Please request a new one.' },
          { status: 400 }
        );
      if (new Date() > new Date(user.tokenExpiry))
        return NextResponse.json(
          { error: 'OTP has expired. Please request a new one.' },
          { status: 400 }
        );
      if (user.verificationToken !== otp.trim())
        return NextResponse.json({ error: 'Incorrect OTP.' }, { status: 400 });

      user.password          = newPassword;
      user.verificationToken = null;
      user.tokenExpiry       = null;
      await user.save(); // pre-save hook hashes the password
      return NextResponse.json({ ok: true });
    }

    // ── mode='direct': verify current password then change ──────────────────
    if (mode === 'direct') {
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword)
        return NextResponse.json(
          { error: 'Current and new password are required.' },
          { status: 400 }
        );
      if (newPassword.length < 6)
        return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 });

      const valid = await user.comparePassword(currentPassword);
      if (!valid)
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });

      user.password = newPassword;
      await user.save();
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid mode.' }, { status: 400 });
  } catch (err) {
    console.error('[POST /api/profile/change-password]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
