import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Application from '@/models/Application';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();

    // Select ALL application fields explicitly — including resumePath /
    // resumeFilename — so nothing is omitted regardless of schema state.
    const apps = await Application
      .find({ studentId: session.user.id })
      .select(
        'jobId studentId status phone yearsOfExperience education ' +
        'applicantSkills coverLetter resumePath resumeFilename createdAt updatedAt'
      )
      .populate('jobId', 'title companyName location jobType deadline recruiterId')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(apps)));
  } catch (err) {
    console.error('[GET /api/applications/student]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
