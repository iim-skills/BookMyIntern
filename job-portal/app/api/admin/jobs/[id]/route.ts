import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Job from '@/models/Job';
import Application from '@/models/Application';

interface Ctx { params: { id: string } }

export async function DELETE(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    await connectDB();
    const job = await Job.findByIdAndDelete(params.id);
    if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    await Application.deleteMany({ jobId: params.id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
