'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/ui/AuthenticatedLayout';
import Button from '@/components/ui/Button';
import type { IConversation, IConversationParticipant } from '@/types';

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ChatInboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [convos, setConvos] = useState<IConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/conversations')
      .then((r) => r.json())
      .then((d: IConversation[]) => {
        setConvos(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-light gap-3 select-none">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-text-muted text-xs font-semibold">Loading inbox correspondence…</p>
      </div>
    );
  }

  const myId = session?.user?.id ?? '';

  const getOther = (convo: IConversation): IConversationParticipant | null =>
    convo.participants.find((p) => p._id !== myId) ?? null;

  return (
    <AuthenticatedLayout allowedRoles={['student', 'recruiter', 'admin']}>
      <div className="space-y-6">
        
        {/* ── TOP HEADER ── */}
        <header className="border-b border-surface-mid pb-4 flex justify-between items-center select-none">
          <div>
            <h1 className="text-xl font-display font-extrabold text-text-primary tracking-tight">Messages</h1>
            <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider mt-0.5">Your platform correspondence history</p>
          </div>
          
          <Link href={session?.user?.role === 'recruiter' ? '/recruiter/dashboard' : session?.user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} className="decoration-none">
            <Button variant="outline" size="sm" className="text-xs font-bold" icon={<span className="material-symbols-outlined text-sm font-bold">arrow_back</span>}>
              Dashboard
            </Button>
          </Link>
        </header>

        {/* ── CONVERSATIONS LIST ── */}
        {convos.length === 0 ? (
          <div className="text-center border border-dashed border-surface-mid rounded-xl py-16 px-5 bg-white shadow-sm max-w-md mx-auto select-none">
            <span className="material-symbols-outlined text-4xl text-text-muted mb-2">forum</span>
            <h4 className="font-extrabold text-text-secondary text-sm">No conversations yet</h4>
            <p className="text-xs text-text-muted font-medium mt-1.5 leading-relaxed">
              {session?.user?.role === 'student'
                ? 'Apply to internships and start a conversation with a recruiter from your applications portal.'
                : 'Browse candidates for your posted listings and open a dialogue directly.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 animate-fadeIn">
            {convos.map((convo) => {
              const other = getOther(convo);
              if (!other) return null;

              const initials = other.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              const jobTitle = convo.jobId ? (convo.jobId as { title?: string }).title ?? '' : '';

              return (
                <Link
                  key={convo._id}
                  href={`/chat/${convo._id}`}
                  className="bg-white p-5 border border-surface-mid rounded-xl shadow-sm hover:border-primary hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4 decoration-none"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* User initials circle */}
                    <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center font-extrabold text-sm border border-primary-light/50 shrink-0 select-none">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap font-extrabold text-text-primary text-sm select-none">
                        <span>{other.name}</span>
                        <span className="text-[9px] bg-slate-100 text-text-secondary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-surface-mid">
                          {other.role}
                        </span>
                      </div>
                      
                      {jobTitle && (
                        <div className="text-[11px] text-primary font-bold mt-1.5 flex items-center gap-1 select-none">
                          <span className="material-symbols-outlined text-[13px] leading-none">work</span>
                          <span>re: {jobTitle}</span>
                        </div>
                      )}

                      <span className="text-xs text-text-secondary font-medium mt-1 block truncate">
                        {convo.lastMessagePreview || 'No messages exchanged yet'}
                      </span>
                    </div>
                  </div>

                  {/* Time ago metadata */}
                  <span className="text-[10px] text-text-muted font-bold whitespace-nowrap self-start md:self-center select-none font-mono">
                    {timeAgo(convo.lastMessageAt)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </AuthenticatedLayout>
  );
}
