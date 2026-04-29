'use client';
import { useState, useEffect } from 'react';
import { useParams }           from 'next/navigation';
import { useSession }          from 'next-auth/react';
import Link                    from 'next/link';
import type { IReview }        from '@/types';

interface CompanyProfile {
  firmName:    string;
  firmWebsite: string;
  firmBio:     string;   // company description / about section
  designation: string;
  phone:       string;
  userId:      { name: string; email: string } | string;
}
interface CompanyJob {
  _id:         string;
  title:       string;
  jobType:     string;
  location:    string;
  salary:      string;
  deadline:    string;
  companyName: string;
}
interface CompanyData {
  profile:   CompanyProfile;
  jobs:      CompanyJob[];
  reviews:   IReview[];
  avgRating: number | null;
}

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

export default function CompanyPage() {
  const { recruiterId }          = useParams<{ recruiterId: string }>();
  const { data: session }        = useSession();
  const [data,    setData]       = useState<CompanyData | null>(null);
  const [loading, setLoading]    = useState(true);
  const [error,   setError]      = useState('');

  useEffect(() => {
    fetch(`/api/company/${recruiterId}`)
      .then((r) => r.json())
      .then((d: CompanyData & { error?: string }) => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load company.'); setLoading(false); });
  }, [recruiterId]);

  if (loading)
    return (
      <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading…</p>
    );
  if (error || !data)
    return (
      <p style={{ padding: 40 }}>
        {error || 'Company not found.'}{' '}
        <Link href="/community-reviews">← Community Reviews</Link>
      </p>
    );

  const { profile, jobs, reviews, avgRating } = data;
  const recruiterName = typeof profile.userId === 'object' ? profile.userId.name : '';
  const isSignedIn    = !!session;

  return (
    <div className="dashboard">
      <div style={{ marginBottom: 14 }}>
        <Link href="/community-reviews">← Community Reviews</Link>
      </div>

      {/* ── Company header ── */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>
          {profile.firmName}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: 10 }}>
          {recruiterName} &mdash; {profile.designation}
        </div>

        {avgRating !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              {avgRating.toFixed(1)}
            </span>
            <Stars rating={Math.round(avgRating)} />
            <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
              ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        {/* About / bio — always visible */}
        {profile.firmBio && (
          <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.6, marginBottom: 14 }}>
            {profile.firmBio}
          </p>
        )}

        <table style={{ fontSize: '0.85rem', borderCollapse: 'collapse' }}>
          <tbody>
            {profile.firmWebsite && (
              <tr>
                <td style={{ color: '#6b7280', paddingRight: 16, paddingBottom: 6 }}>Website</td>
                <td style={{ paddingBottom: 6 }}>
                  <a href={profile.firmWebsite} target="_blank" rel="noopener noreferrer">
                    {profile.firmWebsite}
                  </a>
                </td>
              </tr>
            )}
            <tr>
              <td style={{ color: '#6b7280', paddingRight: 16, paddingBottom: 6 }}>Phone</td>
              <td style={{ paddingBottom: 6 }}>
                {isSignedIn ? (
                  /* Signed-in: show the real number */
                  <span>{profile.phone}</span>
                ) : (
                  /* Guest: show a teaser + sign-in prompt */
                  <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    ••••••••&nbsp;
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(`/company/${recruiterId}`)}`}
                      style={{ color: '#2563eb', fontStyle: 'normal' }}
                    >
                      Sign in to view
                    </Link>
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Open positions ── */}
      {jobs.length > 0 && (
        <>
          <div className="sec-title">Open Positions ({jobs.length})</div>
          {jobs.map((job) => {
            const expired = new Date(job.deadline) < new Date();
            return (
              <div className="card" key={job._id} style={{ padding: '12px 16px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', gap: 10,
                }}>
                  <div>
                    {isSignedIn ? (
                      <Link href={`/jobs/${job._id}`} style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {job.title}
                      </Link>
                    ) : (
                      /* Guest: job title links to sign-in */
                      <Link
                        href={`/login?callbackUrl=${encodeURIComponent(`/jobs/${job._id}`)}`}
                        style={{ fontWeight: 600, fontSize: '0.9rem' }}
                      >
                        {job.title}
                      </Link>
                    )}
                    <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 2 }}>
                      {job.location}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className="tag">{job.jobType}</span>
                    {job.salary  && <span className="tag tag-green">{job.salary}</span>}
                    {expired     && <span className="tag tag-red">Closed</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ── Reviews ── */}
      <div className="sec-title">
        Reviews from Employees / Interns ({reviews.length})
      </div>
      {reviews.length === 0 ? (
        <div className="empty">No reviews yet for this company.</div>
      ) : (
        reviews.map((r) => {
          const reviewer = typeof r.reviewerId === 'object' ? r.reviewerId : null;
          const job      = typeof r.jobId === 'object' && r.jobId ? r.jobId : null;
          return (
            <div className="review-card" key={r._id}>
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
                  <Stars rating={r.rating} />
                  <span className="review-meta">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {job && (
                <div className="review-job">
                  re: {(job as { title?: string }).title}
                </div>
              )}
              <p className="review-body">{r.content}</p>
            </div>
          );
        })
      )}
    </div>
  );
}
