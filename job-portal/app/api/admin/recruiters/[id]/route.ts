import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import RecruiterProfile from '@/models/RecruiterProfile';

interface Ctx { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    const body = await req.json() as { adminVerified?: boolean };
    if (typeof body.adminVerified !== 'boolean')
      return NextResponse.json({ error: 'adminVerified (boolean) required.' }, { status: 400 });
    await connectDB();
    const profile = await RecruiterProfile
      .findByIdAndUpdate(params.id, { adminVerified: body.adminVerified }, { new: true })
      .populate('userId', 'name email');
    if (!profile) return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(profile)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
