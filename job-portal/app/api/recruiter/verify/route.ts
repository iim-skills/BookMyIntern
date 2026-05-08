import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import RecruiterProfile from '@/models/RecruiterProfile';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'recruiter')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    await connectDB();
    const profile = await RecruiterProfile.findOne({ userId: session.user.id }).lean();
    return NextResponse.json({
      submitted:     !!profile,
      adminVerified: profile ? !!(profile as { adminVerified?: boolean }).adminVerified : false,
      profile:       profile ? JSON.parse(JSON.stringify(profile)) : null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'recruiter')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    const body = await req.json() as {
      firmName?: string; firmWebsite?: string; designation?: string; phone?: string;
    };
    const { firmName, firmWebsite, designation, phone } = body;
    if (!firmName || !designation || !phone)
      return NextResponse.json({ error: 'firmName, designation and phone are required.' }, { status: 400 });
    await connectDB();
    const existing = await RecruiterProfile.findOne({ userId: session.user.id });
    if (existing) return NextResponse.json({ error: 'Already submitted.' }, { status: 409 });
    const profile = await RecruiterProfile.create({
      userId: session.user.id, firmName,
      firmWebsite: firmWebsite ?? '', designation, phone,
      adminVerified: false,
    });
    return NextResponse.json(JSON.parse(JSON.stringify(profile)), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
