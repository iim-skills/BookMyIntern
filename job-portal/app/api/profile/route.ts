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
      .select('name email role createdAt emailVerified twoFactorEnabled collegeName graduationYear currentYearOfStudy')
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

    const body = await req.json() as {
      name?: string;
      twoFactorEnabled?: boolean;
      collegeName?: string;
      graduationYear?: string;
      currentYearOfStudy?: string;
      revokeSessions?: boolean;
    };
    const { name, twoFactorEnabled, collegeName, graduationYear, currentYearOfStudy, revokeSessions } = body;

    await connectDB();
    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      if (!name.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
      updateData.name = name.trim();
    }

    if (twoFactorEnabled !== undefined) {
      updateData.twoFactorEnabled = twoFactorEnabled;
    }

    if (collegeName !== undefined) {
      updateData.collegeName = collegeName.trim();
    }

    if (graduationYear !== undefined) {
      updateData.graduationYear = graduationYear.trim();
    }

    if (currentYearOfStudy !== undefined) {
      updateData.currentYearOfStudy = currentYearOfStudy.trim();
    }

    if (revokeSessions) {
      // Increment tokenVersion by 1
      const dbUser = await User.findById(session.user.id);
      if (dbUser) {
        dbUser.tokenVersion = (dbUser.tokenVersion || 0) + 1;
        await dbUser.save();
      }
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true }
    ).select('name email role createdAt twoFactorEnabled collegeName graduationYear currentYearOfStudy').lean();

    return NextResponse.json(JSON.parse(JSON.stringify(user)));
  } catch (err) {
    console.error('[PATCH /api/profile]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
