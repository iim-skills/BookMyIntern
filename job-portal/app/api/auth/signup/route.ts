import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      name?: string; email?: string; password?: string; role?: string;
    };
    const { name, email, password, role } = body;
    if (!name || !email || !password || !role)
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    if (!['student', 'recruiter'].includes(role))
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    await connectDB();
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    await User.create({ name, email, password, role });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
