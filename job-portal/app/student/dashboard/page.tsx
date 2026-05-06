'use client';
import { useState, useEffect }                         from 'react';
import { useSession }                                  from 'next-auth/react';
import { useRouter }                                   from 'next/navigation';
import Link                                            from 'next/link';
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

const TERMINAL: ApplicationStatus[] = [
  'selected', 'rejected', 'on-hold', 'interview', 'reviewed',
];

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [apps,        setApps]        = useState<IApplication[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [chatLoading, setChatLoading] = useState<string | null>(null);

  // ── FIX: plain object instead of Set — React 18 re-renders reliably ──────
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'authenticated' && session.user.role !== 'student')
      router.replace('/jobs');
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/applications/student')
      .then((r) => r.json())
      .then((d: IApplication[]) => {
        setApps(Array.isArray(d) ? d : []);
        setLoading(false);
      });
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
    } finally {
      setChatLoading(null);
    }
  };

  if (status === 'loading' || loading)
    return (
      <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
        Loading…
      </p>
    );

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
          <Link href="/reviews" className="btn btn-sm btn-review">
            ⭐ Reviews
          </Link>
          <Link href="/chat" className="btn btn-sm btn-chat">
            Messages
          </Link>
          <Link href="/jobs" className="btn btn-primary btn-sm">
            Browse Jobs
          </Link>
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="empty">
          No applications yet.{' '}
          <Link href="/jobs">Browse jobs →</Link>
        </div>
      ) : (
        apps.map((app) => {
          const job = app.jobId as IJob | null;
          if (!job || typeof job === 'string') return null;

          const cls       = STATUS_CLS[app.status] ?? '';
          const canReview =
            TERMINAL.includes(app.status) ||
            new Date(job.deadline) < new Date();

          // ── FIX: read from plain object ───────────────────────────────
          const isOpen = !!expanded[app._id];

          return (
            <div className="card" key={app._id}>
              {/* ── Top row ── */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                {/* Left: job info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card-title">
                    <Link href={`/jobs/${job._id}`}>{job.title}</Link>
                  </div>
                  <div className="card-sub">
                    {job.companyName} &mdash; {job.location}
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <span className="tag">{job.jobType}</span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#9ca3af' }}>
                    Applied: {new Date(app.createdAt).toLocaleDateString()}
                    &nbsp;|&nbsp;
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </p>
                </div>

                {/* Right: status + action buttons */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 7,
                    flexShrink: 0,
                  }}
                >
                  <span
                    className={`tag ${cls}`}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {STATUS_LABEL[app.status] ?? app.status}
                  </span>

                  <button
                    className="btn btn-sm btn-chat"
                    onClick={() => void startChat(app)}
                    disabled={chatLoading === app._id}
                  >
                    {chatLoading === app._id ? '…' : ' Message Recruiter'}
                  </button>

                  {canReview && (
                    <Link
                      href="/reviews?tab=write"
                      className="btn btn-sm btn-review"
                    >
                      ⭐ Write Review
                    </Link>
                  )}

                  {/* Toggle button */}
                  <button
                    className="btn btn-sm"
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => toggleExpand(app._id)}
                  >
                    {isOpen ? 'Hide details ▲' : 'View details ▼'}
                  </button>
                </div>
              </div>

              {/* ── Expandable detail panel ── */}
              {isOpen && (
                <div className="app-details-panel">
                  {/* Key-value grid */}
                  {(app.phone ||
                    app.yearsOfExperience ||
                    app.education ||
                    app.applicantSkills) && (
                    <div className="app-details-grid">
                      {app.phone && (
                        <>
                          <span className="app-detail-label">Phone</span>
                          <span>{app.phone}</span>
                        </>
                      )}
                      {app.yearsOfExperience && (
                        <>
                          <span className="app-detail-label">Experience</span>
                          <span>{app.yearsOfExperience}</span>
                        </>
                      )}
                      {app.education && (
                        <>
                          <span className="app-detail-label">Education</span>
                          <span>{app.education}</span>
                        </>
                      )}
                      {app.applicantSkills && (
                        <>
                          <span className="app-detail-label">Skills</span>
                          <span>{app.applicantSkills}</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Cover letter */}
                  {app.coverLetter && (
                    <div style={{ marginTop: 10 }}>
                      <div
                        className="app-detail-label"
                        style={{ marginBottom: 4 }}
                      >
                        Cover Letter
                      </div>
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: '#374151',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          background: '#f9fafb',
                          padding: '10px 12px',
                          borderRadius: 5,
                        }}
                      >
                        {app.coverLetter}
                      </p>
                    </div>
                  )}

                  {/* Resume link */}
                  {app.resumePath ? (
                    <div
                      style={{
                        marginTop: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <span className="app-detail-label">Resume</span>
                      <a
                        href={app.resumePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm"
                        style={{
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        {' '}
                        {app.resumeFilename || 'View Resume'}
                      </a>
                    </div>
                  ) : (
                    <p
                      style={{
                        marginTop: 10,
                        fontSize: '0.8rem',
                        color: '#9ca3af',
                      }}
                    >
                      No resume uploaded.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
