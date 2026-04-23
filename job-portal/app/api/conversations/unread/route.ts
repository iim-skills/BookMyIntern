import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import mongoose from 'mongoose';


export const dynamic = 'force-dynamic';
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ count: 0 });

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Get all conversation IDs the user belongs to
    const convos = await Conversation.find({ participants: userId }, '_id').lean();
    const convoIds = convos.map((c) => c._id);

    if (convoIds.length === 0) return NextResponse.json({ count: 0 });

    // Count messages in those conversations not sent by user and not yet read by user
    const count = await Message.countDocuments({
      conversationId: { $in: convoIds },
      senderId:       { $ne:  userId  },
      readBy:         { $ne:  userId  },
    });

    return NextResponse.json({ count });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ count: 0 });
  }
}
