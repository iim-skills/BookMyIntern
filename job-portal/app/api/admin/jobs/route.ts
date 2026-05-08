import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Job from '@/models/Job';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    await connectDB();
    const jobs = await Job.find({}).populate('recruiterId', 'name email').sort({ createdAt: -1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(jobs)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
