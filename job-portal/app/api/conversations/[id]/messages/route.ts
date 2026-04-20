import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import mongoose from 'mongoose';

interface Ctx { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Ensure user is a participant
    const convo = await Conversation.findOne({ _id: params.id, participants: userId });
    if (!convo) return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });

    const messages = await Message
      .find({ conversationId: params.id })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 })
      .lean();

    // Mark all messages NOT sent by current user as read (fire-and-forget, non-blocking)
    void Message.updateMany(
      { conversationId: params.id, senderId: { $ne: userId }, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    return NextResponse.json(JSON.parse(JSON.stringify(messages)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json() as { content?: string };
    const { content } = body;
    if (!content?.trim())
      return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
    if (content.length > 2000)
      return NextResponse.json({ error: 'Message too long (max 2000 chars).' }, { status: 400 });

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const convo  = await Conversation.findOne({ _id: params.id, participants: userId });
    if (!convo) return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });

    // Sender is always considered to have read their own message
    const msg = await Message.create({
      conversationId: params.id,
      senderId:       session.user.id,
      content:        content.trim(),
      readBy:         [session.user.id],
    });

    const preview = content.trim().slice(0, 60) + (content.trim().length > 60 ? '…' : '');
    convo.lastMessagePreview = preview;
    convo.lastMessageAt      = new Date();
    await convo.save();

    await msg.populate('senderId', 'name');
    return NextResponse.json(JSON.parse(JSON.stringify(msg)), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
