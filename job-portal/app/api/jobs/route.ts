import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Job from '@/models/Job';
import RecruiterProfile from '@/models/RecruiterProfile';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const paginate = searchParams.get('paginate') === 'true';
    const search = searchParams.get('search') || '';
    const jobType = searchParams.get('jobType') || '';
    const location = searchParams.get('location') || '';

    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (location) {
      if (location.toLowerCase() === 'remote') {
        query.location = { $regex: 'remote', $options: 'i' };
      } else {
        query.location = { $regex: location, $options: 'i' };
      }
    }

    if (paginate) {
      const page = Number(searchParams.get('page') || 1);
      const limit = Number(searchParams.get('limit') || 10);
      const skip = (page - 1) * limit;

      const total = await Job.countDocuments(query);
      const jobs = await Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return NextResponse.json({
        jobs: JSON.parse(JSON.stringify(jobs)),
        total,
        page,
        pages: Math.ceil(total / limit)
      });
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(jobs)));
  } catch (err) {
    console.error('[GET /api/jobs]', err);
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
      stipendAmount?: number; durationWeeks?: number; ppoPossibility?: boolean;
      internCertificate?: boolean;
    };
    const {
      companyName, title, description, location, jobType, salary, skills, deadline, eligibility,
      stipendAmount, durationWeeks, ppoPossibility, internCertificate
    } = body;

    if (!companyName || !title || !description || !location || !jobType || !deadline)
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });

    const skillArr: string[] = Array.isArray(skills)
      ? skills
      : (skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : []);

    const job = await Job.create({
      recruiterId: session.user.id, companyName, title, description, location, jobType,
      salary: salary ?? '', skills: skillArr, deadline: new Date(deadline), eligibility: eligibility ?? '',
      stipendAmount: stipendAmount ?? 0,
      durationWeeks: durationWeeks ?? 0,
      ppoPossibility: !!ppoPossibility,
      internCertificate: !!internCertificate,
      views: 0,
    });
    return NextResponse.json(JSON.parse(JSON.stringify(job)), { status: 201 });
  } catch (err) {
    console.error('[POST /api/jobs]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
