'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useSession }  from 'next-auth/react';
import { useRouter }   from 'next/navigation';
import Link            from 'next/link';
import type { IReview, IApplication, IJob, ApplicationStatus } from '@/types';

/* ── Star rating picker ─────────────────── */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star ${n <= (hovered || value) ? 'filled' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        >★</span>
      ))}
    </div>
  );
}

/* ── Static star display ─────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars-display">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`star-display ${n <= rating ? 'filled' : ''}`}>★</span>
      ))}
    </span>
  );
}

/* ── Average rating display ─────────────── */
function AvgRating({ reviews }: { reviews: IReview[] }) {
  if (reviews.length === 0) return null;
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

/* ── Review card ─────────────────────────── */
function ReviewCard({ review, myId }: { review: IReview; myId: string }) {
  const reviewer = typeof review.reviewerId === 'object' ? review.reviewerId : null;
  const job      = typeof review.jobId      === 'object' && review.jobId ? review.jobId : null;
  const isAboutMe = (typeof review.revieweeId === 'object' ? review.revieweeId._id : review.revieweeId) === myId;
  return (
    <div className="review-card">
      <div className="review-header">
        <div>
          <span className="reviewer-name">{reviewer?.name ?? 'Unknown'}</span>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 7, textTransform: 'capitalize' }}>
            ({reviewer?.role})
          </span>
          {isAboutMe && (
            <span className="tag tag-purple" style={{ marginLeft: 8 }}>About you</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stars rating={review.rating} />
          <span className="review-meta">{new Date(review.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      {job && (
        <div className="review-job">
          re: {(job as { title?: string; companyName?: string }).title} —{' '}
          {(job as { title?: string; companyName?: string }).companyName}
        </div>
      )}
      <p className="review-body">{review.content}</p>
    </div>
  );
}

const TERMINAL: ApplicationStatus[] = ['selected', 'rejected', 'on-hold', 'interview', 'reviewed'];

export default function ReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab,           setTab]          = useState<'about-me' | 'write'>('about-me');
  const [aboutMeReviews,setAboutMeReviews]= useState<IReview[]>([]);
  const [myApps,        setMyApps]       = useState<IApplication[]>([]);  // for students writing reviews
  const [loading,       setLoading]      = useState(true);

  // Write review form state
  const [selectedApp,   setSelectedApp]  = useState<string>('');     // application _id
  const [rating,        setRating]       = useState(0);
  const [content,       setContent]      = useState('');
  const [formMsg,       setFormMsg]      = useState('');
  const [formLoading,   setFormLoading]  = useState(false);
  const [writtenIds,    setWrittenIds]   = useState<Set<string>>(new Set()); // app ids already reviewed

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const myId = session.user.id;

    // Fetch reviews about me
    fetch(`/api/reviews?revieweeId=${myId}`)
      .then((r) => r.json())
      .then((d: IReview[]) => setAboutMeReviews(Array.isArray(d) ? d : []));

    // Fetch my applications (student) or trust recruiter to see who applied (recruiter handled differently)
    if (session.user.role === 'student') {
      fetch('/api/applications/student')
        .then((r) => r.json())
        .then((d: IApplication[]) => { setMyApps(Array.isArray(d) ? d : []); setLoading(false); });
    } else {
      setLoading(false);
    }

    // Fetch reviews I already wrote to mark them
    fetch('/api/reviews?mine=1')
      .then((r) => r.json())
      .then((d: IReview[]) => {
        if (Array.isArray(d)) {
          // For students: track which jobId+reviewee combos are done
          setWrittenIds(new Set(d.map((r) => {
            const jid = typeof r.jobId === 'object' && r.jobId ? (r.jobId as { _id: string })._id : '';
            const rid = typeof r.revieweeId === 'object' ? r.revieweeId._id : r.revieweeId;
            return `${rid}__${jid}`;
          })));
        }
      });
  }, [status, session]);

  // Eligible apps: status is terminal OR deadline has passed
  const eligibleApps = myApps.filter((app) => {
    const job = app.jobId as IJob | null;
    if (!job || typeof job === 'string') return false;
    const deadlinePassed = new Date(job.deadline) < new Date();
    const isTerminal     = TERMINAL.includes(app.status);
    return isTerminal || deadlinePassed;
  });

  const selectedAppObj = eligibleApps.find((a) => a._id === selectedApp);
  const recruiterIdForSelected = selectedAppObj
    ? ((selectedAppObj.jobId as IJob)?.recruiterId ?? '')
    : '';
  const jobIdForSelected = selectedAppObj
    ? ((selectedAppObj.jobId as IJob)?._id ?? '')
    : '';
  const alreadyReviewed = selectedApp
    ? writtenIds.has(`${recruiterIdForSelected}__${jobIdForSelected}`)
    : false;

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    setFormMsg('');
    if (!selectedApp)    { setFormMsg('Please select a job/application.'); return; }
    if (!rating)         { setFormMsg('Please select a rating.'); return; }
    if (!content.trim()) { setFormMsg('Please write a review.'); return; }

    setFormLoading(true);
    const res  = await fetch('/api/reviews', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        revieweeId: recruiterIdForSelected,
        jobId:      jobIdForSelected || undefined,
        rating,
        content,
      }),
    });
    const data = await res.json() as { error?: string; _id?: string };
    setFormLoading(false);

    if (!res.ok) { setFormMsg(data.error ?? 'Error submitting review.'); return; }
    setFormMsg('Review submitted successfully!');
    setWrittenIds((prev) => new Set([...prev, `${recruiterIdForSelected}__${jobIdForSelected}`]));
    setRating(0); setContent(''); setSelectedApp('');
  };

  if (status === 'loading' || loading)
    return <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading…</p>;

  return (
    <div className="dashboard">
      <div className="page-hd">
        <h1>Reviews</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {session?.user?.role === 'student'
            ? <Link href="/student/dashboard" className="btn btn-sm">← My Applications</Link>
            : <Link href="/recruiter/dashboard" className="btn btn-sm">← Dashboard</Link>}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'about-me' ? 'active' : ''}`} onClick={() => setTab('about-me')}>
          Reviews About Me ({aboutMeReviews.length})
        </button>
        {session?.user?.role === 'student' && (
          <button className={`tab-btn ${tab === 'write' ? 'active' : ''}`} onClick={() => setTab('write')}>
            Write a Review
          </button>
        )}
      </div>

      {/* ── Tab: About Me ── */}
      {tab === 'about-me' && (
        <div>
          <AvgRating reviews={aboutMeReviews} />
          {aboutMeReviews.length === 0 ? (
            <div className="empty">No reviews yet. Complete a job or internship to receive one.</div>
          ) : (
            aboutMeReviews.map((r) => (
              <ReviewCard key={r._id} review={r} myId={session?.user?.id ?? ''} />
            ))
          )}
        </div>
      )}

      {/* ── Tab: Write Review (students only) ── */}
      {tab === 'write' && session?.user?.role === 'student' && (
        <div>
          <p style={{ fontSize: '0.84rem', color: '#6b7280', marginBottom: 16 }}>
            You can review a company/recruiter after your job or internship has ended
            (application is in a reviewed/advanced stage, or the deadline has passed).
          </p>

          {eligibleApps.length === 0 ? (
            <div className="empty">
              No completed jobs or internships to review yet.<br />
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
                  <select
                    value={selectedApp}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedApp(e.target.value)}
                  >
                    <option value="">Choose…</option>
                    {eligibleApps.map((app) => {
                      const job = app.jobId as IJob;
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

                {alreadyReviewed && (
                  <div className="alert alert-success">You have already reviewed this company for this job.</div>
                )}

                {!alreadyReviewed && selectedApp && (
                  <>
                    <div className="form-group">
                      <label>Your Rating *</label>
                      <div style={{ marginTop: 4 }}>
                        <StarPicker value={rating} onChange={setRating} />
                        {rating > 0 && (
                          <span style={{ fontSize: '0.78rem', color: '#6b7280', marginLeft: 8 }}>
                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Your Review *</label>
                      <textarea
                        value={content}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                        placeholder="Share your experience — the work culture, mentorship, projects, growth opportunities…"
                        rows={5}
                        maxLength={1000}
                      />
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
