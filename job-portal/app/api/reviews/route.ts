import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';
import Application from '@/models/Application';
import mongoose from 'mongoose';

// GET /api/reviews?revieweeId=xxx   → reviews written about that person
// GET /api/reviews?mine=1           → reviews written BY me
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const revieweeId = searchParams.get('revieweeId');
    const mine       = searchParams.get('mine');

    const session = await getServerSession(authOptions);

    let filter: Record<string, unknown> = {};
    if (revieweeId) {
      filter = { revieweeId: new mongoose.Types.ObjectId(revieweeId) };
    } else if (mine && session) {
      filter = { reviewerId: new mongoose.Types.ObjectId(session.user.id) };
    }

    const reviews = await Review
      .find(filter)
      .populate('reviewerId', 'name role')
      .populate('revieweeId', 'name role')
      .populate('jobId',      'title companyName')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(reviews)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// POST /api/reviews
// body: { revieweeId, jobId?, rating, content }
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json() as {
      revieweeId?: string;
      jobId?:      string;
      rating?:     number;
      content?:    string;
    };
    const { revieweeId, jobId, rating, content } = body;

    if (!revieweeId)
      return NextResponse.json({ error: 'revieweeId is required.' }, { status: 400 });
    if (!rating || rating < 1 || rating > 5)
      return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
    if (!content?.trim())
      return NextResponse.json({ error: 'Review content is required.' }, { status: 400 });
    if (content.length > 1000)
      return NextResponse.json({ error: 'Review too long (max 1000 chars).' }, { status: 400 });
    if (revieweeId === session.user.id)
      return NextResponse.json({ error: 'You cannot review yourself.' }, { status: 400 });

    await connectDB();

    // Verify a connection exists between reviewer and reviewee via an application
    const myId    = new mongoose.Types.ObjectId(session.user.id);
    const otherId = new mongoose.Types.ObjectId(revieweeId);

    let eligible = false;
    if (session.user.role === 'student') {
      // Student reviewing recruiter: must have applied to one of the recruiter's jobs
      const app = await Application.findOne({ studentId: myId })
        .populate('jobId', 'recruiterId deadline')
        .lean() as { jobId: { recruiterId: { toString(): string }; deadline: Date } | null } | null;

      if (app) {
        // Either jobId matches and app exists, or just check any application to recruiter
        const Application2 = (await import('@/models/Application')).default;
        const Job = (await import('@/models/Job')).default;
        const recruiterJobs = await Job.find({ recruiterId: otherId }, '_id deadline').lean();
        const jobIds = recruiterJobs.map((j) => j._id);
        const appForRecruiter = await Application2.findOne({
          studentId: myId,
          jobId:     { $in: jobIds },
          status:    { $in: ['selected', 'rejected', 'on-hold', 'interview', 'reviewed'] },
        }).lean();
        eligible = !!appForRecruiter;
        // Also allow if job deadline has passed
        if (!eligible) {
          const anyApp = await Application2.findOne({ studentId: myId, jobId: { $in: jobIds } }).lean();
          if (anyApp) {
            const jobDoc = recruiterJobs.find((j) => j._id.toString() === anyApp.jobId.toString());
            if (jobDoc && new Date(jobDoc.deadline) < new Date()) eligible = true;
          }
        }
      }
    } else {
      // Recruiter reviewing student: student must have applied to one of my jobs with terminal/advanced status
      const Job = (await import('@/models/Job')).default;
      const myJobs = await Job.find({ recruiterId: myId }, '_id').lean();
      const jobIds = myJobs.map((j) => j._id);
      const appForStudent = await Application.findOne({
        studentId: otherId,
        jobId:     { $in: jobIds },
        status:    { $in: ['selected', 'rejected', 'on-hold', 'interview', 'reviewed'] },
      }).lean();
      eligible = !!appForStudent;
    }

    if (!eligible)
      return NextResponse.json(
        { error: 'You can only review someone you have worked with (application must be in a reviewed/advanced stage).' },
        { status: 403 }
      );

    // Check for existing review (unique index will also catch this)
    const existing = await Review.findOne({
      reviewerId: myId,
      revieweeId: otherId,
      jobId:      jobId ? new mongoose.Types.ObjectId(jobId) : null,
    });
    if (existing)
      return NextResponse.json({ error: 'You have already reviewed this person for this job.' }, { status: 409 });

    const review = await Review.create({
      reviewerId:   session.user.id,
      revieweeId,
      jobId:        jobId || null,
      rating:       Math.round(rating),
      content:      content.trim(),
      reviewerRole: session.user.role,
    });

    await review.populate('reviewerId', 'name role');
    await review.populate('revieweeId', 'name role');
    await review.populate('jobId',      'title companyName');
    return NextResponse.json(JSON.parse(JSON.stringify(review)), { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 11000)
      return NextResponse.json({ error: 'You have already reviewed this person for this job.' }, { status: 409 });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
