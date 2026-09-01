import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import mongoose from 'mongoose';

interface Ctx { params: { id: string } }

/**
 * GET /api/conversations/[id]/messages
 *   ?since=<ISO date>  → only return messages AFTER that timestamp (for polling)
 *   (no param)         → return all messages (initial load)
 *
 * Also marks all incoming messages (senderId ≠ you) as read — awaited so the
 * unread count is accurate by the time the Navbar polls next.
 */
export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    const convo = await Conversation.findOne({ _id: params.id, participants: userId }, '_id');
    if (!convo) return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });

    // Build query — optionally filter by `since` for incremental polling
    const { searchParams } = new URL(req.url);
    const since = searchParams.get('since');
    const msgFilter: Record<string, unknown> = { conversationId: params.id };
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) msgFilter.createdAt = { $gt: sinceDate };
    }

    const messages = await Message
      .find(msgFilter)
      .populate('senderId', 'name')
      .sort({ createdAt: 1 })
      .lean();

    // ── Mark as read — AWAITED so the count is accurate on next Navbar poll ──
    await Message.updateMany(
      {
        conversationId: params.id,
        senderId:       { $ne:   userId },
        readBy:         { $nin:  [userId] },  // $nin is explicit for array membership
      },
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
    const convo  = await Conversation.findOne({ _id: params.id, participants: userId }, '_id participants');
    if (!convo) return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });

    const msg = await Message.create({
      conversationId: params.id,
      senderId:       session.user.id,
      content:        content.trim(),
      readBy:         [session.user.id],   // sender always "reads" their own message
    });

    const preview = content.trim().slice(0, 60) + (content.trim().length > 60 ? '…' : '');
    await Conversation.updateOne(
      { _id: params.id },
      { lastMessagePreview: preview, lastMessageAt: new Date() }
    );

    // ── Dispatch message in-app notification ────────────────────────────
    try {
      const otherUserId = convo.participants.find((p) => p.toString() !== session.user.id);
      if (otherUserId) {
        const NotificationModel = require('@/models/Notification').default;
        const existingNotification = await NotificationModel.findOne({
          userId: otherUserId,
          type: 'message',
          read: false
        });
        if (!existingNotification) {
          await NotificationModel.create({
            userId: otherUserId,
            title: 'New Message',
            message: `You have received a new message from ${session.user.name}.`,
            type: 'message',
          });
        }
      }
    } catch (notifyErr) {
      console.error('Failed to create message notification:', notifyErr);
    }

    await msg.populate('senderId', 'name');
    return NextResponse.json(JSON.parse(JSON.stringify(msg)), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
