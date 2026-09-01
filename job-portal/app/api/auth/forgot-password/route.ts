import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail, EMAIL_ENABLED } from '@/lib/mailer';
import crypto from 'crypto';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { email?: string };
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });

    // To prevent email enumeration, we can return success even if user is not found,
    // but we can also log or handle offline testing mock.
    if (!user) {
      return NextResponse.json({ ok: true, message: 'If this email is registered, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetLink = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    if (EMAIL_ENABLED) {
      await sendPasswordResetEmail(user.email, user.name, resetLink);
    } else {
      console.log('EMAIL_ENABLED=false. Password Reset Link:', resetLink);
      // For testing convenience when SMTP is disabled:
      return NextResponse.json({
        ok: true,
        message: 'Mock Mode: SMTP is not configured. Reset Link generated.',
        mockLink: resetLink,
      });
    }

    return NextResponse.json({ ok: true, message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('[POST /api/auth/forgot-password]', err);
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}
