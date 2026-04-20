'use client';
import { useState, useEffect }     from 'react';
import { useSession }              from 'next-auth/react';
import { useRouter }               from 'next/navigation';
import Link                        from 'next/link';
import type { IConversation, IConversationParticipant } from '@/types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ChatInboxPage() {
  const { data: session, status } = useSession();
  const router  = useRouter();
  const [convos,   setConvos]   = useState<IConversation[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/conversations').then((r) => r.json()).then((d: IConversation[]) => {
      setConvos(Array.isArray(d) ? d : []); setLoading(false);
    });
  }, [status]);

  if (status === 'loading' || loading)
    return <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading messages…</p>;

  const myId = session?.user?.id ?? '';

  const getOther = (convo: IConversation): IConversationParticipant | null =>
    convo.participants.find((p) => p._id !== myId) ?? null;

  return (
    <div className="dashboard">
      <div className="page-hd">
        <h1>Messages</h1>
        {session?.user?.role === 'student'
          ? <Link href="/student/dashboard" className="btn btn-sm">← My Applications</Link>
          : <Link href="/recruiter/dashboard" className="btn btn-sm">← Dashboard</Link>}
      </div>

      {convos.length === 0 ? (
        <div className="empty">
          No conversations yet.<br />
          <span style={{ fontSize: '0.82rem', marginTop: 6, display: 'block' }}>
            {session?.user?.role === 'student'
              ? 'Apply to jobs and message a recruiter from your dashboard.'
              : 'View applicants and start a conversation from your dashboard.'}
          </span>
        </div>
      ) : (
        convos.map((convo) => {
          const other = getOther(convo);
          if (!other) return null;
          const initials = other.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
          const jobTitle  = convo.jobId ? (convo.jobId as { title?: string }).title ?? '' : '';
          return (
            <Link key={convo._id} href={`/chat/${convo._id}`} className="convo-card">
              <div className="convo-avatar">{initials}</div>
              <div className="convo-body">
                <div className="convo-name">
                  {other.name}
                  <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.78rem', marginLeft: 6 }}>
                    ({other.role})
                  </span>
                </div>
                {jobTitle && (
                  <div style={{ fontSize: '0.76rem', color: '#6b7280', marginBottom: 2 }}>re: {jobTitle}</div>
                )}
                <div className="convo-preview">
                  {convo.lastMessagePreview || 'No messages yet'}
                </div>
              </div>
              <div className="convo-time">{timeAgo(convo.lastMessageAt)}</div>
            </Link>
          );
        })
      )}
    </div>
  );
}
