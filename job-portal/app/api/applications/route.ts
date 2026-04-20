import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student')
      return NextResponse.json({ error: 'Only students can apply.' }, { status: 401 });
    const body = await req.json() as { jobId?: string };
    const { jobId } = body;
    if (!jobId) return NextResponse.json({ error: 'jobId required.' }, { status: 400 });
    await connectDB();
    const job = await Job.findById(jobId);
    if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    if (new Date(job.deadline) < new Date())
      return NextResponse.json({ error: 'Application deadline has passed.' }, { status: 400 });
    const existing = await Application.findOne({ jobId, studentId: session.user.id });
    if (existing) return NextResponse.json({ error: 'Already applied.' }, { status: 409 });
    const app = await Application.create({ jobId, studentId: session.user.id });
    return NextResponse.json(JSON.parse(JSON.stringify(app)), { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 11000)
      return NextResponse.json({ error: 'Already applied.' }, { status: 409 });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
