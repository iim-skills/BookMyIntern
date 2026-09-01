'use client';

import {
  useState, useEffect, useRef,
  ChangeEvent, KeyboardEvent, useCallback,
} from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Briefcase, Radio, ArrowDown, User, MessageSquare, AlertCircle } from 'lucide-react';
import AuthenticatedLayout from '@/components/ui/AuthenticatedLayout';
import Button from '@/components/ui/Button';
import type { IConversation, IConversationParticipant, IMessage } from '@/types';

function formatTime(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(d: string) {
  if (!d) return '';
  const dt = new Date(d);
  const now = new Date();
  if (dt.toDateString() === now.toDateString()) return 'Today';
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (dt.toDateString() === yest.toDateString()) return 'Yesterday';
  return dt.toLocaleDateString();
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [convo, setConvo] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [atBottom, setAtBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTsRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAtBottom(isBottom);
    if (isBottom) setNewCount(0);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;

    // Load conversation metadata
    fetch('/api/conversations')
      .then((r) => r.json())
      .then((d: IConversation[]) => {
        const found = Array.isArray(d) ? d.find((c) => c._id === id) ?? null : null;
        if (!found) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setConvo(found);
      });

    // Initial load
    const initialLoad = async () => {
      try {
        const res = await fetch(`/api/conversations/${id}/messages`);
        const data = await res.json() as IMessage[];
        if (!Array.isArray(data)) return;
        setMessages(data);
        if (data.length > 0) lastTsRef.current = data[data.length - 1].createdAt;
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Incremental polling
    const poll = async () => {
      const since = lastTsRef.current;
      const url = since
        ? `/api/conversations/${id}/messages?since=${encodeURIComponent(since)}`
        : `/api/conversations/${id}/messages`;

      try {
        const res = await fetch(url);
        const data = await res.json() as IMessage[];
        if (!Array.isArray(data) || data.length === 0) return;

        lastTsRef.current = data[data.length - 1].createdAt;

        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const fresh = data.filter((m) => !existingIds.has(m._id));
          if (fresh.length === 0) return prev;

          const el = scrollRef.current;
          const isAtBottom = el ? el.scrollHeight - el.scrollTop - el.clientHeight < 80 : true;
          if (!isAtBottom) setNewCount((n) => n + fresh.length);

          return [...prev, ...fresh];
        });
      } catch (err) {
        console.error(err);
      }
    };

    void initialLoad();
    pollRef.current = setInterval(() => { void poll(); }, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, id]);

  // Auto-scroll when already at the bottom
  useEffect(() => {
    if (atBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, atBottom]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewCount(0);
    setAtBottom(true);
  };

  const sendMessage = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText('');
    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const msg = await res.json() as IMessage & { error?: string };
      if (res.ok) {
        lastTsRef.current = msg.createdAt;
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          return exists ? prev : [...prev, msg];
        });
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
      } else {
        setText(content);
      }
    } catch (err) {
      console.error(err);
      setText(content);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-light gap-3 select-none">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-text-muted text-xs font-semibold">Loading conversation feed…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-surface-light flex flex-col items-center justify-center p-8 select-none">
        <div className="w-14 h-14 rounded-full bg-accent-rose/10 text-accent-rose flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-extrabold text-text-primary">Conversation Not Found</p>
        <Link href="/chat" className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Messages
        </Link>
      </div>
    );
  }

  const myId = session?.user?.id ?? '';
  const other = convo?.participants.find((p: IConversationParticipant) => p._id !== myId);
  const jobTitle = convo?.jobId ? (convo.jobId as { title?: string }).title : null;

  const initials = other?.name
    ? other.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  let lastDate = '';

  return (
    <AuthenticatedLayout allowedRoles={['student', 'recruiter', 'admin']}>
      <div className="space-y-4 flex flex-col min-h-[82vh]">
        
        {/* Back navigation */}
        <div className="select-none">
          <Link
            href="/chat"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors decoration-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Messages
          </Link>
        </div>

        {/* ── CHAT WORKSPACE BOX ── */}
        <div className="flex-grow bg-white border border-surface-mid rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[60vh]">
          
          {/* Header */}
          <div className="p-4 bg-white border-b border-surface-mid flex items-center justify-between gap-4 select-none">
            <div className="flex items-center gap-3">
              {/* Other avatar */}
              <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-extrabold text-sm border border-primary-light/50 shrink-0">
                {initials}
              </div>
              
              <div>
                <h3 className="font-extrabold text-sm text-text-primary leading-tight">
                  {other?.name ?? 'Correspondence partner'}
                </h3>
                <div className="text-[10px] text-text-secondary font-semibold mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="capitalize">{other?.role}</span>
                  {jobTitle && (
                    <>
                      <span className="text-slate-300 font-normal">&bull;</span>
                      <span className="inline-flex items-center gap-1 font-bold text-primary">
                        <Briefcase className="w-3 h-3" />
                        re: {jobTitle}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Pulsating green Live polling tag */}
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-teal"></span>
              </span>
              <span>Live Updates</span>
            </div>
          </div>

          {/* Messages Stream Container */}
          <div className="flex-grow bg-slate-50/50 relative overflow-hidden flex flex-col">
            <div
              className="flex-grow overflow-y-auto p-5 space-y-4 custom-scrollbar"
              ref={scrollRef}
              onScroll={handleScroll}
            >
              {messages.length === 0 && (
                <div className="text-center text-text-muted text-xs font-semibold py-16 flex flex-col items-center justify-center select-none">
                  <MessageSquare className="w-8 h-8 text-slate-300 mb-1.5 animate-bounce" />
                  <span>No message logs yet. Initiate correspondence below!</span>
                </div>
              )}

              {messages.map((msg) => {
                const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
                const isMine = senderId === myId;
                const dateLabel = formatDate(msg.createdAt);
                const showDate = dateLabel !== lastDate;
                lastDate = dateLabel;

                return (
                  <div key={msg._id} className="space-y-1">
                    {showDate && (
                      <div className="text-center my-4 text-[9px] uppercase tracking-wider font-bold text-text-muted select-none">
                        {dateLabel}
                      </div>
                    )}
                    
                    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap shadow-sm ${
                            isMine
                              ? 'bg-primary text-white rounded-2xl rounded-tr-none'
                              : 'bg-white border border-surface-mid text-text-primary rounded-2xl rounded-tl-none font-medium'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-text-muted font-bold mt-1 px-1 select-none font-mono">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>

            {/* Scroll-to-bottom notification pill */}
            {newCount > 0 && !atBottom && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white hover:bg-primary-dark border-none font-bold text-[10px] px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition-all cursor-pointer select-none"
              >
                <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                <span>{newCount} new message{newCount > 1 ? 's' : ''}</span>
              </button>
            )}
          </div>

          {/* Text Input Panel */}
          <div className="p-3 bg-white border-t border-surface-mid flex gap-2.5 items-end">
            <textarea
              value={text}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              rows={1}
              maxLength={2000}
              className="flex-1 w-full px-3.5 py-2.5 border border-surface-mid rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-xs resize-none font-sans max-h-28 min-h-[38px] leading-relaxed font-medium"
            />
            
            <Button
              onClick={() => void sendMessage()}
              disabled={sending || !text.trim()}
              loading={sending}
              icon={<Send className="w-3.5 h-3.5" />}
              className="h-[38px] px-5 text-xs font-bold shrink-0"
            >
              Send
            </Button>
          </div>

        </div>

      </div>
    </AuthenticatedLayout>
  );
}
