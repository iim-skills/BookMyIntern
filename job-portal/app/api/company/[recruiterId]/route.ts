import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import RecruiterProfile from '@/models/RecruiterProfile';
import Job from '@/models/Job';
import Review from '@/models/Review';
import mongoose from 'mongoose';

interface Ctx { params: { recruiterId: string } }

export async function GET(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    await connectDB();
    const rid = new mongoose.Types.ObjectId(params.recruiterId);

    // Run all three queries in parallel
    const [profile, jobs, reviews] = await Promise.all([
      RecruiterProfile.findOne({ userId: rid })
        .populate('userId', 'name email')
        .lean(),
      Job.find({ recruiterId: rid })
        .sort({ createdAt: -1 })
        .select('title jobType location salary deadline eligibility skills companyName')
        .lean(),
      Review.find({ revieweeId: rid })
        .populate('reviewerId', 'name role')
        .populate('jobId', 'title')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!profile)
      return NextResponse.json({ error: 'Company not found.' }, { status: 404 });

    const avgRating = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

    return NextResponse.json(JSON.parse(JSON.stringify({ profile, jobs, reviews, avgRating })));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
