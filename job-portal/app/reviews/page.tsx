'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useSession }  from 'next-auth/react';
import { useRouter }   from 'next/navigation';
import Link            from 'next/link';
import type { IReview, IApplication, IJob, ApplicationStatus } from '@/types';

/* ── Shared helpers ──────────────────────────────────────────────────────── */

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hov, setHov] = useState(0);
  return (
    <div className="stars">
      {[1,2,3,4,5].map((n) => (
        <span key={n} className={`star ${n <= (hov || value) ? 'filled' : ''}`}
          onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
          onClick={() => onChange(n)}>★</span>
      ))}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars-display">
      {[1,2,3,4,5].map((n) => (
        <span key={n} className={`star-display ${n <= rating ? 'filled' : ''}`}>★</span>
      ))}
    </span>
  );
}

function AvgRating({ reviews }: { reviews: IReview[] }) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <div className="avg-rating">
        <span className="avg-num">{avg.toFixed(1)}</span>
        <Stars rating={Math.round(avg)} />
        <span className="avg-sub">based on {reviews.length} review{reviews.length > 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

/* Extracts recruiterId from a review (works for both student-about-recruiter and vice-versa) */
function recruiterIdFromReview(r: IReview, myRole: string | undefined): string | null {
  // If reviewer is recruiter → reviewee is student, company is the reviewer
  // If reviewer is student   → reviewee is recruiter, company is the reviewee
  if (r.reviewerRole === 'recruiter') {
    return typeof r.reviewerId === 'object' ? r.reviewerId._id : null;
  }
  // reviewer is student, reviewee is recruiter
  return typeof r.revieweeId === 'object' ? r.revieweeId._id : null;
}

function companyNameFromReview(r: IReview): string | null {
  const job = typeof r.jobId === 'object' && r.jobId ? r.jobId : null;
  return job ? (job as { companyName?: string }).companyName ?? null : null;
}

function ReviewCard({
  review, myId, showAboutMe = false,
}: {
  review: IReview; myId: string; showAboutMe?: boolean;
}) {
  const reviewer  = typeof review.reviewerId === 'object' ? review.reviewerId : null;
  const reviewee  = typeof review.revieweeId === 'object' ? review.revieweeId : null;
  const job       = typeof review.jobId === 'object' && review.jobId ? review.jobId : null;
  const aboutMe   = showAboutMe && (typeof review.revieweeId === 'object'
    ? review.revieweeId._id === myId
    : review.revieweeId === myId);

  // Build a clickable company link when the review involves a recruiter
  const recId    = recruiterIdFromReview(review, reviewer?.role);
  const coName   = companyNameFromReview(review);

  return (
    <div className="review-card">
      <div className="review-header">
        <div>
          <span className="reviewer-name">{reviewer?.name ?? 'Anonymous'}</span>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 7, textTransform: 'capitalize' }}>
            ({reviewer?.role})
          </span>
          {aboutMe && <span className="tag tag-purple" style={{ marginLeft: 8 }}>About you</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stars rating={review.rating} />
          <span className="review-meta">{new Date(review.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Job + company link */}
      {job && (
        <div className="review-job">
          re:{' '}
          <Link href={`/jobs/${(job as { _id: string })._id}`}>
            {(job as { title?: string }).title}
          </Link>
          {coName && recId && (
            <> &mdash; <Link href={`/company/${recId}`}>{coName}</Link></>
          )}
        </div>
      )}

      {/* Reviewed-about line when in community feed */}
      {showAboutMe && reviewee && (
        <div style={{ fontSize: '0.76rem', color: '#6b7280', marginBottom: 5 }}>
          About:{' '}
          <strong>{reviewee.name}</strong>
          <span style={{ textTransform: 'capitalize', marginLeft: 5, color: '#9ca3af' }}>
            ({reviewee.role})
          </span>
        </div>
      )}

      <p className="review-body">{review.content}</p>
    </div>
  );
}

/* ── Constants ─────────────────────────────────────────────────────────────── */
const TERMINAL: ApplicationStatus[] = ['selected', 'rejected', 'on-hold', 'interview', 'reviewed'];

/* ══════════════════════════════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════════════════════════════ */
export default function ReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  type Tab = 'about-me' | 'community' | 'write';
  const [tab,            setTab]           = useState<Tab>('about-me');
  const [aboutMeReviews, setAboutMeReviews]= useState<IReview[]>([]);
  const [communityReviews,setCommunityReviews] = useState<IReview[]>([]);
  const [myApps,         setMyApps]        = useState<IApplication[]>([]);
  const [writtenIds,     setWrittenIds]    = useState<Set<string>>(new Set());
  const [loading,        setLoading]       = useState(true);
  const [commLoading,    setCommLoading]   = useState(false);
  const [commLoaded,     setCommLoaded]    = useState(false);

  // Write form
  const [selectedApp,  setSelectedApp]  = useState('');
  const [rating,       setRating]       = useState(0);
  const [content,      setContent]      = useState('');
  const [formMsg,      setFormMsg]      = useState('');
  const [formLoading,  setFormLoading]  = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  // Load "about me" reviews + apps on mount
  useEffect(() => {
    if (status !== 'authenticated') return;
    const myId = session.user.id;

    fetch(`/api/reviews?revieweeId=${myId}`)
      .then((r) => r.json())
      .then((d: IReview[]) => setAboutMeReviews(Array.isArray(d) ? d : []));

    if (session.user.role === 'student') {
      fetch('/api/applications/student')
        .then((r) => r.json())
        .then((d: IApplication[]) => { setMyApps(Array.isArray(d) ? d : []); setLoading(false); });
    } else {
      setLoading(false);
    }

    fetch('/api/reviews?mine=1')
      .then((r) => r.json())
      .then((d: IReview[]) => {
        if (Array.isArray(d)) {
          setWrittenIds(new Set(d.map((r) => {
            const jid = typeof r.jobId === 'object' && r.jobId ? (r.jobId as { _id: string })._id : '';
            const rid = typeof r.revieweeId === 'object' ? r.revieweeId._id : r.revieweeId;
            return `${rid}__${jid}`;
          })));
        }
      });
  }, [status, session]);

  // Lazy-load community reviews only when that tab is first opened
  const openCommunity = () => {
    setTab('community');
    if (commLoaded) return;
    setCommLoading(true);
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((d: IReview[]) => {
        setCommunityReviews(Array.isArray(d) ? d : []);
        setCommLoaded(true);
        setCommLoading(false);
      });
  };

  // Eligible apps for writing reviews
  const eligibleApps = myApps.filter((app) => {
    const job = app.jobId as IJob | null;
    if (!job || typeof job === 'string') return false;
    return TERMINAL.includes(app.status) || new Date(job.deadline) < new Date();
  });

  const selApp = eligibleApps.find((a) => a._id === selectedApp);
  const recruiterId    = selApp ? ((selApp.jobId as IJob)?.recruiterId ?? '') : '';
  const jobIdForReview = selApp ? ((selApp.jobId as IJob)?._id ?? '')       : '';
  const alreadyDone    = selectedApp ? writtenIds.has(`${recruiterId}__${jobIdForReview}`) : false;

  const submitReview = async (e: FormEvent) => {
    e.preventDefault(); setFormMsg('');
    if (!selectedApp)    { setFormMsg('Please select a job/application.'); return; }
    if (!rating)         { setFormMsg('Please select a rating.'); return; }
    if (!content.trim()) { setFormMsg('Please write a review.'); return; }
    setFormLoading(true);
    const res  = await fetch('/api/reviews', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revieweeId: recruiterId, jobId: jobIdForReview || undefined, rating, content }),
    });
    const data = await res.json() as { error?: string };
    setFormLoading(false);
    if (!res.ok) { setFormMsg(data.error ?? 'Error submitting review.'); return; }
    setFormMsg('Review submitted successfully!');
    setWrittenIds((p) => new Set([...p, `${recruiterId}__${jobIdForReview}`]));
    setRating(0); setContent(''); setSelectedApp('');
    // Refresh "about me" in case the community feed needs updating
    setCommLoaded(false);
  };

  if (status === 'loading' || loading)
    return <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading…</p>;

  const myId = session?.user?.id ?? '';

  return (
    <div className="dashboard">
      <div className="page-hd">
        <h1>Reviews</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {session?.user?.role === 'student'
            ? <Link href="/student/dashboard"   className="btn btn-sm">← My Applications</Link>
            : <Link href="/recruiter/dashboard" className="btn btn-sm">← Dashboard</Link>}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'about-me'  ? 'active' : ''}`}
          onClick={() => setTab('about-me')}>
          About Me ({aboutMeReviews.length})
        </button>
        <button className={`tab-btn ${tab === 'community' ? 'active' : ''}`}
          onClick={openCommunity}>
          Community Reviews
        </button>
        {session?.user?.role === 'student' && (
          <button className={`tab-btn ${tab === 'write' ? 'active' : ''}`}
            onClick={() => setTab('write')}>
            Write a Review
          </button>
        )}
      </div>

      {/* ── Tab: About Me ── */}
      {tab === 'about-me' && (
        <div>
          <AvgRating reviews={aboutMeReviews} />
          {aboutMeReviews.length === 0
            ? <div className="empty">No reviews about you yet. Complete a job to receive one.</div>
            : aboutMeReviews.map((r) => (
                <ReviewCard key={r._id} review={r} myId={myId} />
              ))
          }
        </div>
      )}

      {/* ── Tab: Community Reviews ── */}
      {tab === 'community' && (
        <div>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 16 }}>
            Reviews from everyone on the platform. Click a company name to see its full profile.
          </p>
          {commLoading && (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: 32 }}>Loading reviews…</p>
          )}
          {!commLoading && communityReviews.length === 0 && (
            <div className="empty">No community reviews yet.</div>
          )}
          {!commLoading && communityReviews.map((r) => (
            <ReviewCard key={r._id} review={r} myId={myId} showAboutMe />
          ))}
        </div>
      )}

      {/* ── Tab: Write Review (students only) ── */}
      {tab === 'write' && session?.user?.role === 'student' && (
        <div>
          <p style={{ fontSize: '0.84rem', color: '#6b7280', marginBottom: 16 }}>
            You can review a company after your job or internship has ended
            (status reached review/interview/on-hold/selected/rejected, or deadline passed).
          </p>
          {eligibleApps.length === 0 ? (
            <div className="empty">
              No completed jobs to review yet.<br />
              <span style={{ fontSize: '0.82rem', marginTop: 6, display: 'block' }}>
                Apply to jobs and progress through the hiring process to unlock reviews.
              </span>
            </div>
          ) : (
            <div className="card">
              {formMsg && (
                <div className={`alert ${formMsg.includes('success') ? 'alert-success' : 'alert-error'}`}>
                  {formMsg}
                </div>
              )}
              <form onSubmit={submitReview}>
                <div className="form-group">
                  <label>Select a Job / Application *</label>
                  <select value={selectedApp}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedApp(e.target.value)}>
                    <option value="">Choose…</option>
                    {eligibleApps.map((app) => {
                      const job  = app.jobId as IJob;
                      const rid  = job?.recruiterId ?? '';
                      const jid  = job?._id ?? '';
                      const done = writtenIds.has(`${rid}__${jid}`);
                      return (
                        <option key={app._id} value={app._id} disabled={done}>
                          {job?.title} — {job?.companyName} ({app.status}){done ? ' ✓ Reviewed' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {alreadyDone && (
                  <div className="alert alert-success">
                    You have already reviewed this company for this job.
                  </div>
                )}

                {!alreadyDone && selectedApp && (
                  <>
                    {/* Show clickable company link */}
                    {selApp && (
                      <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 12 }}>
                        Reviewing:{' '}
                        <Link href={`/company/${recruiterId}`}>
                          {(selApp.jobId as IJob)?.companyName}
                        </Link>
                      </p>
                    )}
                    <div className="form-group">
                      <label>Your Rating *</label>
                      <div style={{ marginTop: 4 }}>
                        <StarPicker value={rating} onChange={setRating} />
                        {rating > 0 && (
                          <span style={{ fontSize: '0.78rem', color: '#6b7280', marginLeft: 8 }}>
                            {['','Poor','Fair','Good','Very Good','Excellent'][rating]}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Your Review *</label>
                      <textarea value={content}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                        placeholder="Share your experience — work culture, mentorship, projects, growth…"
                        rows={5} maxLength={1000} />
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 3, textAlign: 'right' }}>
                        {content.length}/1000
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={formLoading}>
                      {formLoading ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </>
                )}
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
