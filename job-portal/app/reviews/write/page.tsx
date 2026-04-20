'use client';
import { useState, ChangeEvent, FormEvent, Suspense } from 'react';
import { useSession }       from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link                 from 'next/link';

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

function WriteReviewForm() {
  const { data: session, status } = useSession();
  const router      = useRouter();
  const params      = useSearchParams();
  const studentId   = params.get('studentId')   ?? '';
  const jobId       = params.get('jobId')        ?? '';
  const studentName = params.get('studentName')  ?? 'the student';

  const [rating,   setRating]   = useState(0);
  const [content,  setContent]  = useState('');
  const [msg,      setMsg]      = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  if (status === 'unauthenticated') { router.replace('/login'); return null; }
  if (session && session.user.role !== 'recruiter') { router.replace('/jobs'); return null; }

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setMsg('');
    if (!rating)         { setMsg('Please select a rating.'); return; }
    if (!content.trim()) { setMsg('Please write a review.'); return; }
    setLoading(true);
    const res  = await fetch('/api/reviews', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ revieweeId: studentId, jobId: jobId || undefined, rating, content }),
    });
    const data = await res.json() as { error?: string };
    setLoading(false);
    if (!res.ok) { setMsg(data.error ?? 'Error submitting review.'); return; }
    setDone(true);
  };

  if (done) return (
    <div className="card" style={{ textAlign: 'center', padding: 32 }}>
      <div style={{ fontSize: '2rem', marginBottom: 10 }}>⭐</div>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>Review submitted!</p>
      <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 18 }}>
        Your review of {studentName} has been saved.
      </p>
      <Link href="/recruiter/dashboard" className="btn btn-primary">← Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="card">
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>Review {studentName}</h2>
      <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 16 }}>
        Share your experience working with this candidate.
      </p>
      {msg && <div className={`alert ${msg.includes('Error') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}
      <form onSubmit={submit}>
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
            placeholder="Describe the candidate's work quality, attitude, skills, and professionalism…"
            rows={5}
            maxLength={1000}
          />
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 3, textAlign: 'right' }}>
            {content.length}/1000
          </div>
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Review'}
          </button>
          <Link href="/recruiter/dashboard" className="btn">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <div className="dashboard">
      <div className="page-hd">
        <h1>Write a Review</h1>
        <Link href="/recruiter/dashboard" className="btn btn-sm">← Dashboard</Link>
      </div>
      <Suspense fallback={<p style={{ color: '#9ca3af' }}>Loading…</p>}>
        <WriteReviewForm />
      </Suspense>
    </div>
  );
}
