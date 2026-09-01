import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';
import Application from '@/models/Application';
import Job from '@/models/Job';           // static — no more dynamic import()
import RecruiterProfile from '@/models/RecruiterProfile';
import mongoose from 'mongoose';

/**
 * GET /api/reviews
 *   ?revieweeId=xxx  → reviews about that person
 *   ?mine=1          → reviews written by me
 *   (no params)      → ALL reviews (community feed)
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const revieweeId = searchParams.get('revieweeId');
    const mine       = searchParams.get('mine');
    const session    = await getServerSession(authOptions);

    let filter: Record<string, unknown> = {};
    if (revieweeId) {
      filter = { revieweeId: new mongoose.Types.ObjectId(revieweeId) };
    } else if (mine && session) {
      filter = { reviewerId: new mongoose.Types.ObjectId(session.user.id) };
    }
    // else: no filter → return all reviews for community feed

    const reviews = await Review
      .find(filter)
      .populate('reviewerId', 'name role')
      .populate('revieweeId', 'name role')
      .populate('jobId',      'title companyName')
      .sort({ createdAt: -1 })
      .limit(200)          // safety cap for community feed
      .lean();

    // Fetch recruiter profiles to obtain firmName as companyName fallback
    const recruiterIds = new Set<string>();
    reviews.forEach((r: any) => {
      if (r.reviewerRole === 'recruiter' && r.reviewerId) {
        recruiterIds.add(typeof r.reviewerId === 'object' ? r.reviewerId._id.toString() : r.reviewerId.toString());
      } else if (r.reviewerRole === 'student' && r.revieweeId) {
        recruiterIds.add(typeof r.revieweeId === 'object' ? r.revieweeId._id.toString() : r.revieweeId.toString());
      }
    });

    const profiles = await RecruiterProfile.find({
      userId: { $in: Array.from(recruiterIds).map(id => new mongoose.Types.ObjectId(id)) }
    }, 'userId firmName').lean();

    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p.firmName]));

    const reviewsWithCompany = reviews.map((r: any) => {
      const recId = r.reviewerRole === 'recruiter'
        ? (typeof r.reviewerId === 'object' ? r.reviewerId._id.toString() : r.reviewerId.toString())
        : (typeof r.revieweeId === 'object' ? r.revieweeId._id.toString() : r.revieweeId.toString());
      
      const firmName = profileMap.get(recId) || null;
      return {
        ...r,
        companyName: firmName
      };
    });

    return NextResponse.json(JSON.parse(JSON.stringify(reviewsWithCompany)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * body: { revieweeId, jobId?, rating, content }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json() as {
      revieweeId?: string; jobId?: string; rating?: number; content?: string;
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

    const myId    = new mongoose.Types.ObjectId(session.user.id);
    const otherId = new mongoose.Types.ObjectId(revieweeId);

    // ── Eligibility check (all static imports now) ──────────────────────────
    let eligible = false;

    if (session.user.role === 'student') {
      // Find recruiter's job IDs, then check if student applied + is in advanced stage OR deadline passed
      const recruiterJobs = await Job.find({ recruiterId: otherId }, '_id deadline').lean();
      const jobIds        = recruiterJobs.map((j) => j._id);

      if (jobIds.length > 0) {
        const advancedApp = await Application.findOne({
          studentId: myId,
          jobId:     { $in: jobIds },
          status:    { $in: ['selected', 'rejected', 'on-hold', 'interview', 'reviewed'] },
        }).lean();
        eligible = !!advancedApp;

        if (!eligible) {
          // Also allow if any application's job deadline has passed
          const anyApp = await Application.findOne({ studentId: myId, jobId: { $in: jobIds } }).lean();
          if (anyApp) {
            const jobDoc = recruiterJobs.find(
              (j) => j._id.toString() === anyApp.jobId.toString()
            );
            if (jobDoc && new Date(jobDoc.deadline) < new Date()) eligible = true;
          }
        }
      }
    } else {
      // Recruiter reviewing student — student must have applied to one of my jobs
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

    const existing = await Review.findOne({
      reviewerId: myId,
      revieweeId: otherId,
      jobId:      jobId ? new mongoose.Types.ObjectId(jobId) : null,
    });
    if (existing)
      return NextResponse.json(
        { error: 'You have already reviewed this person for this job.' },
        { status: 409 }
      );

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

    // ── Dispatch review in-app notification ────────────────────────────
    try {
      const NotificationModel = require('@/models/Notification').default;
      await NotificationModel.create({
        userId: revieweeId,
        title: 'New Review Received',
        message: `${session.user.name} submitted a ${rating}-star review for you.`,
        type: 'review',
      });
    } catch (notifyErr) {
      console.error('Failed to create review notification:', notifyErr);
    }

    return NextResponse.json(JSON.parse(JSON.stringify(review)), { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    if (
      typeof err === 'object' && err !== null &&
      'code' in err && (err as { code: number }).code === 11000
    )
      return NextResponse.json(
        { error: 'You have already reviewed this person for this job.' },
        { status: 409 }
      );
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
