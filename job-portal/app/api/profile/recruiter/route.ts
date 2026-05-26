import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import RecruiterProfile from '@/models/RecruiterProfile';

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'recruiter')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json() as {
      firmName?: string;
      firmWebsite?: string;
      designation?: string;
      phone?: string;
    };

    const { firmName, firmWebsite, designation, phone } = body;

    if (!firmName?.trim() || !designation?.trim() || !phone?.trim())
      return NextResponse.json(
        { error: 'Firm name, designation and phone are required.' },
        { status: 400 }
      );

    await connectDB();

    const profile = await RecruiterProfile.findOneAndUpdate(
      { userId: session.user.id },
      {
        firmName:    firmName.trim(),
        firmWebsite: firmWebsite?.trim() ?? '',
        designation: designation.trim(),
        phone:       phone.trim(),
      },
      { new: true }
    ).lean();

    if (!profile)
      return NextResponse.json({ error: 'Recruiter profile not found.' }, { status: 404 });

    return NextResponse.json(JSON.parse(JSON.stringify(profile)));
  } catch (err) {
    console.error('[PATCH /api/profile/recruiter]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
