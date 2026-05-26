import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import RecruiterProfile from '@/models/RecruiterProfile';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const user = await User.findById(session.user.id)
      .select('name email role createdAt emailVerified')
      .lean();
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    let recruiterProfile = null;
    if (session.user.role === 'recruiter') {
      recruiterProfile = await RecruiterProfile
        .findOne({ userId: session.user.id })
        .lean();
    }

    return NextResponse.json(JSON.parse(JSON.stringify({ user, recruiterProfile })));
  } catch (err) {
    console.error('[GET /api/profile]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json() as { name?: string };
    const { name } = body;

    if (!name || !name.trim())
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });

    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { name: name.trim() },
      { new: true }
    ).select('name email role createdAt').lean();

    return NextResponse.json(JSON.parse(JSON.stringify(user)));
  } catch (err) {
    console.error('[PATCH /api/profile]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
