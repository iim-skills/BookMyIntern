import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Job from '@/models/Job';
import RecruiterProfile from '@/models/RecruiterProfile';

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const jobs = await Job.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(jobs)));
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
    await connectDB();
    const profile = await RecruiterProfile.findOne({ userId: session.user.id });
    if (!profile || !profile.adminVerified)
      return NextResponse.json(
        { error: 'Your recruiter profile has not been verified by an admin yet.' },
        { status: 403 }
      );
    const body = await req.json() as {
      companyName?: string; title?: string; description?: string; location?: string;
      jobType?: string; salary?: string; skills?: string | string[];
      deadline?: string; eligibility?: string;
    };
    const { companyName, title, description, location, jobType, salary, skills, deadline, eligibility } = body;
    if (!companyName || !title || !description || !location || !jobType || !deadline)
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    const skillArr: string[] = Array.isArray(skills)
      ? skills
      : (skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : []);
    const job = await Job.create({
      recruiterId: session.user.id, companyName, title, description, location, jobType,
      salary: salary ?? '', skills: skillArr, deadline: new Date(deadline), eligibility: eligibility ?? '',
    });
    return NextResponse.json(JSON.parse(JSON.stringify(job)), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
