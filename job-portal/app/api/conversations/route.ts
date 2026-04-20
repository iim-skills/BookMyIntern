import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Conversation from '@/models/Conversation';
import mongoose from 'mongoose';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const convos = await Conversation
      .find({ participants: new mongoose.Types.ObjectId(session.user.id) })
      .populate('participants', 'name email role')
      .populate('jobId', 'title companyName')
      .sort({ lastMessageAt: -1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(convos)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json() as { otherUserId?: string; jobId?: string };
    const { otherUserId, jobId } = body;
    if (!otherUserId)
      return NextResponse.json({ error: 'otherUserId is required.' }, { status: 400 });

    await connectDB();

    const myId    = new mongoose.Types.ObjectId(session.user.id);
    const otherId = new mongoose.Types.ObjectId(otherUserId);

    // Find existing conversation between these two users for this job
    const query: Record<string, unknown> = {
      participants: { $all: [myId, otherId], $size: 2 },
    };
    if (jobId) query.jobId = new mongoose.Types.ObjectId(jobId);

    let convo = await Conversation.findOne(query);

    if (!convo) {
      convo = await Conversation.create({
        participants: [myId, otherId],
        jobId:        jobId ? new mongoose.Types.ObjectId(jobId) : null,
        lastMessagePreview: '',
        lastMessageAt: new Date(),
      });
    }

    // Populate before returning
    await convo.populate('participants', 'name email role');
    await convo.populate('jobId', 'title companyName');
    return NextResponse.json(JSON.parse(JSON.stringify(convo)), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
