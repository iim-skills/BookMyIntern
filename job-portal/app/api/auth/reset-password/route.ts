import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { token?: string; email?: string; password?: string };
    const { token, email, password } = body;

    if (!token || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset token. Please request a new one.' },
        { status: 400 }
      );
    }

    // Update password, clear token, and increment tokenVersion to invalidate existing sessions
    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    return NextResponse.json({ ok: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('[POST /api/auth/reset-password]', err);
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}
