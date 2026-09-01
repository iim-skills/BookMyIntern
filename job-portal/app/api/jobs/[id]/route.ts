import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Job from '@/models/Job';
import Application from '@/models/Application';

interface Ctx { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    await connectDB();
    const job = await Job.findByIdAndUpdate(
      params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).lean();
    if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(job)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'recruiter')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    await connectDB();
    const job = await Job.findById(params.id);
    if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    if (job.recruiterId.toString() !== session.user.id)
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    const data = await req.json() as Record<string, unknown>;
    if (data.skills && !Array.isArray(data.skills))
      data.skills = (data.skills as string).split(',').map((s) => s.trim()).filter(Boolean);
    if (data.deadline) data.deadline = new Date(data.deadline as string);
    Object.assign(job, data);
    await job.save();
    return NextResponse.json(JSON.parse(JSON.stringify(job)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'recruiter')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    await connectDB();
    const job = await Job.findById(params.id);
    if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    if (job.recruiterId.toString() !== session.user.id)
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    await job.deleteOne();
    await Application.deleteMany({ jobId: params.id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
