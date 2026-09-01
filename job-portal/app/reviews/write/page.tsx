'use client';

import { useState, ChangeEvent, FormEvent, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, CheckCircle2, AlertCircle, User, Award } from 'lucide-react';
import AuthenticatedLayout from '@/components/ui/AuthenticatedLayout';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import StarRating from '@/components/ui/StarRating';

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
  if (session && session.user?.role !== 'recruiter') { router.replace('/'); return null; }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg('');
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

  if (done) {
    return (
      <div className="bg-white border border-surface-mid rounded-xl p-8 text-center max-w-md mx-auto shadow-sm animate-fadeIn select-none">
        <div className="w-16 h-16 bg-accent-teal/10 text-accent-teal rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-teal/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-display font-extrabold text-text-primary mb-2">Review Submitted!</h3>
        <p className="text-xs text-text-secondary mb-6 leading-relaxed font-semibold">
          Your review of <span className="text-primary font-bold">{studentName}</span> has been logged and published.
        </p>
        <Link href="/recruiter/dashboard" className="decoration-none">
          <Button variant="primary" className="w-full font-bold" icon={<ArrowLeft className="w-4 h-4" />}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const initials = studentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white border border-surface-mid rounded-xl p-6 shadow-md max-w-xl mx-auto">
      <div className="flex items-center gap-3 border-b border-surface-mid pb-4 mb-5 select-none">
        <div className="w-10 h-10 bg-primary-light text-primary rounded-full flex items-center justify-center font-extrabold text-xs border border-primary-light/50 shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-text-primary leading-tight">Review {studentName}</h2>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">Share your candidate work evaluation details</p>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-2.5 text-xs font-semibold ${
          msg.includes('Error') || msg.includes('Please')
            ? 'bg-accent-rose/10 text-accent-rose border border-accent-rose/20'
            : 'bg-accent-teal/10 text-accent-teal border border-accent-teal/20'
        }`}>
          {msg.includes('Error') || msg.includes('Please') ? (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{msg}</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <div className="flex flex-col gap-1.5 select-none">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Candidate Work Rating *</label>
          <div className="flex items-center gap-3">
            <StarRating rating={rating} interactive onChange={setRating} size="lg" />
            {rating > 0 && (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-100 font-mono">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="flex justify-between items-baseline mb-1">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Candidate Review *</label>
            <span className="text-[10px] font-bold font-mono text-text-muted">
              {content.length}/1000
            </span>
          </div>
          <Textarea
            value={content}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            placeholder="Describe the candidate's quality of work, professional attitude, punctuality, and overall impact…"
            maxLength={1000}
            rows={6}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={loading || !rating || !content.trim()}
            loading={loading}
            className="flex-1 font-bold text-xs"
            icon={<Star className="w-3.5 h-3.5" />}
          >
            Submit Review
          </Button>
          <Link href="/recruiter/dashboard" className="flex-1 decoration-none">
            <Button variant="secondary" type="button" className="w-full font-bold text-xs">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <AuthenticatedLayout allowedRoles={['recruiter']}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top heading strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-mid pb-6 select-none">
          <div>
            <h1 className="text-xl font-display font-extrabold text-text-primary tracking-tight">Write a Review</h1>
            <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider mt-0.5">Provide candidate performance feedback and ratings</p>
          </div>
          <Link href="/recruiter/dashboard" className="decoration-none">
            <Button variant="outline" size="sm" className="text-xs font-bold" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Dashboard
            </Button>
          </Link>
        </div>

        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-12 gap-2 select-none">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-text-muted text-xs font-semibold">Loading review form…</p>
          </div>
        }>
          <WriteReviewForm />
        </Suspense>
      </div>
    </AuthenticatedLayout>
  );
}
