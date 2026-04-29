'use client';
import { useState, useEffect } from 'react';
import { useSession }          from 'next-auth/react';
import { useRouter }           from 'next/navigation';
import Link                    from 'next/link';
import type { IReview }        from '@/types';

/* ── Star display ──────────────────────────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: '0.9rem', color: n <= rating ? '#f59e0b' : '#d1d5db' }}>
          ★
        </span>
      ))}
    </span>
  );
}

/* ── Helper: extract recruiter id from a review ────────────────────────────── */
function recruiterIdFromReview(r: IReview): string | null {
  // If the reviewer is a recruiter the reviewee is a student; company = reviewer.
  // If the reviewer is a student the reviewee is the recruiter; company = reviewee.
  if (r.reviewerRole === 'recruiter') {
    return typeof r.reviewerId === 'object' ? r.reviewerId._id : null;
  }
  return typeof r.revieweeId === 'object' ? r.revieweeId._id : null;
}

function companyNameFromReview(r: IReview): string | null {
  const job = typeof r.jobId === 'object' && r.jobId ? r.jobId : null;
  return job ? (job as { companyName?: string }).companyName ?? null : null;
}

/* ── Single review card ────────────────────────────────────────────────────── */
function ReviewCard({
  review,
  onJobClick,
}: {
  review: IReview;
  onJobClick: (jobId: string) => void;
}) {
  const reviewer = typeof review.reviewerId === 'object' ? review.reviewerId : null;
  const reviewee = typeof review.revieweeId === 'object' ? review.revieweeId : null;
  const job      = typeof review.jobId === 'object' && review.jobId ? review.jobId : null;
  const recId    = recruiterIdFromReview(review);
  const coName   = companyNameFromReview(review);

  return (
    <div className="review-card">
      <div className="review-header">
        <div>
          <span className="reviewer-name">{reviewer?.name ?? 'Anonymous'}</span>
          <span style={{
            fontSize: '0.75rem', color: '#9ca3af',
            marginLeft: 7, textTransform: 'capitalize',
          }}>
            ({reviewer?.role})
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stars rating={review.rating} />
          <span className="review-meta">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Job title (auth-gated click) + company name (public link) */}
      {job && (
        <div className="review-job">
          re:{' '}
          {/* Clicking the job title requires sign-in */}
          <button
            className="link-btn"
            onClick={() => onJobClick((job as { _id: string })._id)}
            style={{
              background: 'none', border: 'none', padding: 0,
              color: '#2563eb', cursor: 'pointer', fontSize: 'inherit',
              fontFamily: 'inherit', textDecoration: 'underline',
            }}
          >
            {(job as { title?: string }).title}
          </button>

          {/* Company name → public company detail page */}
          {coName && recId && (
            <> &mdash; <Link href={`/company/${recId}`}>{coName}</Link></>
          )}
        </div>
      )}

      {/* "About" line — who the review is about */}
      {reviewee && (
        <div style={{ fontSize: '0.76rem', color: '#6b7280', marginBottom: 5 }}>
          About: <strong>{reviewee.name}</strong>
          <span style={{ textTransform: 'capitalize', marginLeft: 5, color: '#9ca3af' }}>
            ({reviewee.role})
          </span>
        </div>
      )}

      <p className="review-body">{review.content}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════════════════════ */
export default function CommunityReviewsPage() {
  const { data: session }        = useSession();
  const router                   = useRouter();
  const [reviews, setReviews]    = useState<IReview[]>([]);
  const [loading, setLoading]    = useState(true);

  useEffect(() => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((d: IReview[]) => {
        setReviews(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /** When a visitor clicks a job title we require sign-in. */
  const handleJobClick = (jobId: string) => {
    if (session) {
      router.push(`/jobs/${jobId}`);
    } else {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/jobs/${jobId}`)}`);
    }
  };

  return (
    <div className="dashboard">
      <div className="page-hd">
        <h1>Community Reviews</h1>
        <p style={{ fontSize: '0.84rem', color: '#6b7280', marginTop: 4 }}>
          Reviews from everyone on the platform. Click a company name to see its profile.
        </p>
      </div>

      {loading && (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>
          Loading reviews…
        </p>
      )}

      {!loading && reviews.length === 0 && (
        <div className="empty">No community reviews yet.</div>
      )}

      {!loading && reviews.map((r) => (
        <ReviewCard key={r._id} review={r} onJobClick={handleJobClick} />
      ))}
    </div>
  );
}
