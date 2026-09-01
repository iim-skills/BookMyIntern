import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';

interface Ctx { params: { jobId: string; appId: string } }

const VALID_STATUSES = ['pending', 'reviewed', 'interview', 'on-hold', 'selected', 'rejected'];

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'recruiter')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json() as { status?: string };
    const { status } = body;
    if (!status || !VALID_STATUSES.includes(status))
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });

    await connectDB();

    // Verify job ownership before allowing status change
    const job = await Job.findById(params.jobId);
    if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    if (job.recruiterId.toString() !== session.user.id)
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

    const app = await Application.findOneAndUpdate(
      { _id: params.appId, jobId: params.jobId },
      { $set: { status } },
      { new: true }
    );
    if (!app) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });

    // ── Dispatch student in-app notification ─────────────────────────────────
    try {
      const Notification = require('@/models/Notification').default;
      await Notification.create({
        userId: app.studentId,
        title: 'Application Status Updated',
        message: `Your application for "${job.title}" has been marked as "${status.toUpperCase()}".`,
        type: 'application',
      });
    } catch (notifyErr) {
      console.error('Failed to create status update notification:', notifyErr);
    }

    return NextResponse.json(JSON.parse(JSON.stringify(app)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
