'use client';
import {
  useState, useEffect, useRef,
  ChangeEvent, KeyboardEvent, useCallback,
} from 'react';
import { useSession }            from 'next-auth/react';
import { useRouter, useParams }  from 'next/navigation';
import Link                      from 'next/link';
import type { IConversation, IConversationParticipant, IMessage } from '@/types';

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDate(dateStr: string): string {
  const d   = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString();
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [convo,      setConvo]      = useState<IConversation | null>(null);
  const [messages,   setMessages]   = useState<IMessage[]>([]);
  const [text,       setText]       = useState('');
  const [sending,    setSending]    = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);
  // Scroll-to-bottom notification
  const [newCount,   setNewCount]   = useState(0);
  const [atBottom,   setAtBottom]   = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null); // the scrollable messages container
  const bottomRef = useRef<HTMLDivElement>(null); // invisible sentinel at the very bottom
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevLen   = useRef(0);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  /* ── Track whether the user is scrolled to the bottom ── */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 80; // px from bottom
    const isBottom  = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setAtBottom(isBottom);
    if (isBottom) setNewCount(0);
  }, []);

  /* ── Load conversation + messages; start poll ── */
  useEffect(() => {
    if (status !== 'authenticated') return;

    // Load conversation meta
    fetch('/api/conversations')
      .then((r) => r.json())
      .then((d: IConversation[]) => {
        const found = Array.isArray(d) ? d.find((c) => c._id === id) ?? null : null;
        if (!found) { setNotFound(true); setLoading(false); return; }
        setConvo(found);
      });

    const loadMsgs = async () => {
      const res  = await fetch(`/api/conversations/${id}/messages`);
      const data = await res.json() as IMessage[];
      if (!Array.isArray(data)) return;

      setMessages((prev) => {
        const incoming = data.length - prevLen.current;
        if (incoming > 0 && prevLen.current > 0) {
          // Check if user is NOT at bottom — if so, show notification
          const el = scrollRef.current;
          const isAtBottom = el
            ? el.scrollHeight - el.scrollTop - el.clientHeight < 80
            : true;
          if (!isAtBottom) setNewCount((n) => n + incoming);
        }
        prevLen.current = data.length;
        return data;
      });
    };

    void loadMsgs().then(() => setLoading(false));
    pollRef.current = setInterval(() => { void loadMsgs(); }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [status, id]);

  /* ── Auto-scroll only when user is already at bottom ── */
  useEffect(() => {
    if (atBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, atBottom]);

  /* ── Scroll to bottom + clear notification ── */
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewCount(0);
    setAtBottom(true);
  };

  /* ── Send message ── */
  const sendMessage = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true); setText('');
    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ content }),
      });
      const msg = await res.json() as IMessage & { error?: string };
      if (res.ok) {
        setMessages((prev) => { prevLen.current = prev.length + 1; return [...prev, msg]; });
        // Always scroll down after your own message
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
      } else {
        setText(content); // restore on error
      }
    } finally { setSending(false); }
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); }
  };

  if (status === 'loading' || loading)
    return <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading chat…</p>;
  if (notFound)
    return <p style={{ padding: 40 }}>Conversation not found. <Link href="/chat">← Back</Link></p>;

  const myId  = session?.user?.id ?? '';
  const other = convo?.participants.find((p: IConversationParticipant) => p._id !== myId);
  const jobTitle = convo?.jobId ? (convo.jobId as { title?: string }).title : null;

  let lastDate = '';

  return (
    <div className="dashboard" style={{ paddingBottom: 0 }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/chat">← All Messages</Link>
      </div>

      <div className="chat-layout">
        {/* ── Header ── */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-name">{other?.name ?? 'Unknown'}</div>
            <div className="chat-meta">
              {other?.role}
              {jobTitle && <> &mdash; re: <strong>{jobTitle}</strong></>}
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Refreshes every 3s</span>
        </div>

        {/* ── Messages + scroll-to-bottom notification ── */}
        <div className="chat-messages-wrap">
          <div
            className="chat-messages"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {messages.length === 0 && (
              <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', marginTop: 24 }}>
                No messages yet. Say hello!
              </p>
            )}

            {messages.map((msg) => {
              const senderId  = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
              const isMine    = senderId === myId;
              const senderName = typeof msg.senderId === 'object' ? msg.senderId.name : '';
              const dateLabel  = formatDate(msg.createdAt);
              const showDate   = dateLabel !== lastDate;
              lastDate         = dateLabel;

              return (
                <div key={msg._id}>
                  {showDate && (
                    <div style={{ textAlign: 'center', margin: '8px 0', fontSize: '0.72rem', color: '#9ca3af' }}>
                      {dateLabel}
                    </div>
                  )}

                  {/* ── FIX: msg-outer caps max-width; msg-bubble shrinks to content ── */}
                  <div className={`msg-row ${isMine ? 'mine' : 'theirs'}`}>
                    <div className="msg-outer">
                      {!isMine && senderName && (
                        <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: 2, marginLeft: 4 }}>
                          {senderName}
                        </div>
                      )}
                      <div className="msg-bubble">{msg.content}</div>
                      <div className="msg-meta">{formatTime(msg.createdAt)}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>

          {/* ── Scroll-to-bottom notification ── */}
          {newCount > 0 && !atBottom && (
            <button className="scroll-to-bottom-btn" onClick={scrollToBottom}>
              ↓ {newCount} new message{newCount > 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* ── Input bar ── */}
        <div className="chat-input-bar">
          <textarea
            value={text}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            rows={2}
            maxLength={2000}
          />
          <button
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end', padding: '9px 16px' }}
            onClick={() => void sendMessage()}
            disabled={sending || !text.trim()}
          >
            {sending ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
