import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';

interface Ctx { params: { jobId: string } }

export async function GET(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'recruiter')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();

    const job = await Job.findById(params.jobId);
    if (!job)
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    if (job.recruiterId.toString() !== session.user.id)
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

    // Select ALL application fields explicitly
    const applicants = await Application
      .find({ jobId: params.jobId })
      .select(
        'jobId studentId status phone yearsOfExperience education ' +
        'applicantSkills coverLetter resumePath resumeFilename createdAt updatedAt'
      )
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(applicants)));
  } catch (err) {
    console.error('[GET /api/recruiter/jobs/[jobId]/applicants]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
