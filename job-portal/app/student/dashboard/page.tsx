'use client';
import { useState, useEffect }                    from 'react';
import { useSession }                             from 'next-auth/react';
import { useRouter }                              from 'next/navigation';
import Link                                       from 'next/link';
import type { IApplication, IJob, ApplicationStatus } from '@/types';

const STATUS_CLS: Record<ApplicationStatus, string> = {
  pending:   's-pending',
  reviewed:  's-reviewed',
  interview: 's-interview',
  'on-hold': 's-on-hold',
  selected:  's-selected',
  rejected:  's-rejected',
};
const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending:   'Pending',
  reviewed:  'Reviewed',
  interview: 'Interview',
  'on-hold': 'On Hold',
  selected:  'Selected ✓',
  rejected:  'Rejected',
};

const TERMINAL: ApplicationStatus[] = ['selected', 'rejected', 'on-hold', 'interview', 'reviewed'];

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apps,        setApps]        = useState<IApplication[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [chatLoading, setChatLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'authenticated' && session.user.role !== 'student') router.replace('/jobs');
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/applications/student')
      .then((r) => r.json())
      .then((d: IApplication[]) => { setApps(Array.isArray(d) ? d : []); setLoading(false); });
  }, [status]);

  const startChat = async (app: IApplication) => {
    const job = app.jobId as IJob;
    if (!job || typeof job === 'string') return;
    setChatLoading(app._id);
    try {
      const res  = await fetch('/api/conversations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ otherUserId: job.recruiterId, jobId: job._id }),
      });
      const data = await res.json() as { _id?: string };
      if (res.ok && data._id) router.push(`/chat/${data._id}`);
    } finally { setChatLoading(null); }
  };

  if (status === 'loading' || loading)
    return <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading…</p>;

  return (
    <div className="dashboard">
      <div className="page-hd">
        <div>
          <h1>My Applications</h1>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 3 }}>
            Logged in as {session?.user?.name}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/reviews"          className="btn btn-sm btn-review">⭐ Reviews</Link>
          <Link href="/chat"             className="btn btn-sm btn-chat">Messages</Link>
          <Link href="/jobs"             className="btn btn-primary btn-sm">Browse Jobs</Link>
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="empty">No applications yet. <Link href="/jobs">Browse jobs →</Link></div>
      ) : (
        apps.map((app) => {
          const job = app.jobId as IJob | null;
          if (!job || typeof job === 'string') return null;
          const cls          = STATUS_CLS[app.status] ?? '';
          const canReview    = TERMINAL.includes(app.status) || new Date(job.deadline) < new Date();
          return (
            <div className="card" key={app._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div className="card-title">
                    <Link href={`/jobs/${job._id}`}>{job.title}</Link>
                  </div>
                  <div className="card-sub">{job.companyName} &mdash; {job.location}</div>
                  <div style={{ marginBottom: 6 }}>
                    <span className="tag">{job.jobType}</span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#9ca3af' }}>
                    Applied: {new Date(app.createdAt).toLocaleDateString()}
                    &nbsp;|&nbsp;
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7 }}>
                  <span className={`tag ${cls}`} style={{ whiteSpace: 'nowrap' }}>
                    {STATUS_LABEL[app.status] ?? app.status}
                  </span>
                  <button
                    className="btn btn-sm btn-chat"
                    onClick={() => void startChat(app)}
                    disabled={chatLoading === app._id}
                  >
                    {chatLoading === app._id ? '…' : '💬 Message Recruiter'}
                  </button>
                  {canReview && (
                    <Link href="/reviews?tab=write" className="btn btn-sm btn-review">
                      ⭐ Write Review
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
