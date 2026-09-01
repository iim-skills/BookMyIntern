'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, MessageSquare, Shield, CheckCircle2, AlertCircle, Info, Briefcase, Building, ChevronRight, ArrowLeft } from 'lucide-react';
import AuthenticatedLayout from '@/components/ui/AuthenticatedLayout';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import StarRating from '@/components/ui/StarRating';
import type { IReview, IApplication, IJob, ApplicationStatus } from '@/types';

/* ── Average rating summary with distribution ── */
function AvgRating({ reviews }: { reviews: IReview[] }) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const idx = Math.min(Math.max(Math.round(r.rating) - 1, 0), 4);
    counts[idx]++;
  });

  return (
    <div className="bg-white border border-surface-mid rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition-all duration-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      {/* Avg Score Block */}
      <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-surface-mid pb-6 md:pb-0 md:pr-6 text-center select-none">
        <span className="text-5xl font-display font-extrabold text-text-primary tracking-tight">{avg.toFixed(1)}</span>
        <span className="text-xs text-text-muted font-bold mt-1 uppercase font-mono">out of 5.0</span>
        <div className="mt-2.5">
          <StarRating rating={Math.round(avg)} size="md" />
        </div>
        <p className="text-xs text-text-secondary mt-3 font-semibold">
          Based on {reviews.length} platform review{reviews.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Distribution Bars */}
      <div className="md:col-span-8 space-y-2">
        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Rating Distribution</h4>
        {[5, 4, 3, 2, 1].map((starVal) => {
          const count = counts[starVal - 1];
          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
          return (
            <div key={starVal} className="flex items-center gap-3 text-xs text-text-secondary">
              <span className="w-8 text-right font-semibold select-none flex items-center justify-end gap-0.5">
                {starVal} <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              </span>
              <div className="flex-1 h-2 bg-surface-light rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-amber rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 font-mono text-text-muted font-bold text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Helpers to extract company info from a review ── */
function recruiterIdFromReview(r: IReview): string | null {
  if (r.reviewerRole === 'recruiter') {
    return typeof r.reviewerId === 'object' ? r.reviewerId._id : null;
  }
  return typeof r.revieweeId === 'object' ? r.revieweeId._id : null;
}

function companyNameFromReview(r: IReview): string | null {
  const job = typeof r.jobId === 'object' && r.jobId ? r.jobId : null;
  return job ? (job as { companyName?: string }).companyName ?? null : null;
}

/* ── Single review card ── */
function ReviewCard({ review }: { review: IReview }) {
  const reviewer = typeof review.reviewerId === 'object' ? review.reviewerId : null;
  const job      = typeof review.jobId === 'object' && review.jobId ? review.jobId : null;
  const recId    = recruiterIdFromReview(review);
  const coName   = companyNameFromReview(review);

  const initials = reviewer?.name
    ? reviewer.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  return (
    <div className="bg-white border border-surface-mid rounded-xl p-5 mb-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-extrabold text-xs border border-primary-light/50 shrink-0 select-none">
            {initials}
          </div>
          <div>
            <div className="font-extrabold text-text-primary text-sm flex items-center gap-1.5 flex-wrap">
              {reviewer?.name ?? 'Anonymous'}
              <span className="text-[9px] bg-slate-100 text-text-secondary font-bold px-2 py-0.5 rounded border border-surface-mid uppercase tracking-wider">
                {reviewer?.role ?? 'User'}
              </span>
            </div>
            <div className="text-[10px] text-text-muted font-bold font-mono mt-0.5">
              {new Date(review.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center bg-slate-50 border border-surface-mid rounded-lg px-2.5 py-1">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-xs font-extrabold text-text-primary ml-1 font-mono">{review.rating.toFixed(1)}</span>
        </div>
      </div>

      {job && (
        <div className="bg-slate-50/70 border border-surface-mid/50 rounded-lg px-3.5 py-2 mb-3.5 flex flex-wrap items-center gap-1.5 text-xs text-text-secondary">
          <Briefcase className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold text-text-muted">Job:</span>
          <Link href={`/jobs/${(job as { _id: string })._id}`} className="font-bold text-primary hover:underline">
            {(job as { title?: string }).title}
          </Link>
          {coName && recId && (
            <>
              <span className="text-slate-300 font-normal">&bull;</span>
              <Building className="w-3.5 h-3.5 text-primary" />
              <Link href={`/company/${recId}`} className="font-bold text-text-primary hover:text-primary hover:underline">
                {coName}
              </Link>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap font-medium pl-1">
        {review.content}
      </p>
    </div>
  );
}

const TERMINAL: ApplicationStatus[] = [
  'selected', 'rejected', 'on-hold', 'interview', 'reviewed',
];

export default function ReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  type Tab = 'about-me' | 'write';
  const [tab, setTab] = useState<Tab>('about-me');
  const [aboutMeReviews, setAboutMeReviews] = useState<IReview[]>([]);
  const [myApps, setMyApps] = useState<IApplication[]>([]);
  const [writtenIds, setWrittenIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Write-form state
  const [selectedApp, setSelectedApp] = useState('');
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const myId = session.user.id;

    fetch(`/api/reviews?revieweeId=${myId}`)
      .then((r) => r.json())
      .then((d: IReview[]) => setAboutMeReviews(Array.isArray(d) ? d : []));

    if (session.user.role === 'student') {
      fetch('/api/applications/student')
        .then((r) => r.json())
        .then((d: IApplication[]) => {
          setMyApps(Array.isArray(d) ? d : []);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    fetch('/api/reviews?mine=1')
      .then((r) => r.json())
      .then((d: IReview[]) => {
        if (Array.isArray(d)) {
          setWrittenIds(new Set(d.map((rv) => {
            const jid = typeof rv.jobId === 'object' && rv.jobId
              ? (rv.jobId as { _id: string })._id : '';
            const rid = typeof rv.revieweeId === 'object'
              ? rv.revieweeId._id : rv.revieweeId;
            return `${rid}__${jid}`;
          })));
        }
      });
  }, [status, session]);

  const eligibleApps = myApps.filter((app) => {
    const job = app.jobId as IJob | null;
    if (!job || typeof job === 'string') return false;
    return TERMINAL.includes(app.status) || new Date(job.deadline) < new Date();
  });

  const selApp         = eligibleApps.find((a) => a._id === selectedApp);
  const recruiterId    = selApp ? ((selApp.jobId as IJob)?.recruiterId ?? '') : '';
  const jobIdForReview = selApp ? ((selApp.jobId as IJob)?._id ?? '') : '';
  const alreadyDone    = selectedApp
    ? writtenIds.has(`${recruiterId}__${jobIdForReview}`) : false;

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    setFormMsg('');
    if (!selectedApp)    { setFormMsg('Please select a job/application.'); return; }
    if (!rating)         { setFormMsg('Please select a rating.'); return; }
    if (!content.trim()) { setFormMsg('Please write a review.'); return; }
    setFormLoading(true);
    const res  = await fetch('/api/reviews', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        revieweeId: recruiterId,
        jobId:      jobIdForReview || undefined,
        rating,
        content,
      }),
    });
    const data = await res.json() as { error?: string };
    setFormLoading(false);
    if (!res.ok) { setFormMsg(data.error ?? 'Error submitting review.'); return; }
    setFormMsg('Review submitted successfully!');
    setWrittenIds((p) => new Set([...p, `${recruiterId}__${jobIdForReview}`]));
    setRating(0);
    setContent('');
    setSelectedApp('');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 select-none">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-text-muted text-xs font-semibold">Loading reviews…</p>
      </div>
    );
  }

  const role = session?.user?.role ?? '';
  const dashHref = role === 'recruiter' ? '/recruiter/dashboard'
                 : role === 'admin'     ? '/admin/dashboard'
                 : '/student/dashboard';

  return (
    <AuthenticatedLayout allowedRoles={['student', 'recruiter', 'admin']}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-mid pb-6 select-none">
          <div>
            <h1 className="text-xl font-display font-extrabold text-text-primary tracking-tight">My Reviews</h1>
            <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider mt-0.5">Ratings and feedback provided or received by you</p>
          </div>
          <Link href={dashHref} className="decoration-none">
            <Button variant="outline" size="sm" className="text-xs font-bold" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-surface-mid gap-1 select-none">
          <button
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-200 outline-none ${
              tab === 'about-me'
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-text-primary hover:border-surface-mid'
            }`}
            onClick={() => setTab('about-me')}
          >
            Reviews Received ({aboutMeReviews.length})
          </button>
          {role === 'student' && (
            <button
              className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-200 outline-none ${
                tab === 'write'
                  ? 'text-primary border-primary'
                  : 'text-text-secondary border-transparent hover:text-text-primary hover:border-surface-mid'
              }`}
              onClick={() => setTab('write')}
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Tab content: About Me / Received */}
        {tab === 'about-me' && (
          <div className="animate-fadeIn space-y-4">
            <AvgRating reviews={aboutMeReviews} />
            {aboutMeReviews.length === 0 ? (
              <div className="bg-white border border-surface-mid rounded-xl p-8 text-center select-none">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                <p className="font-extrabold text-text-primary text-sm">No reviews about you yet</p>
                <span className="text-xs text-text-muted mt-1.5 max-w-sm mx-auto block leading-relaxed font-medium">
                  Complete assignments, internships, or interviews to receive ratings from recruiters.
                </span>
              </div>
            ) : (
              aboutMeReviews.map((r) => (
                <ReviewCard key={r._id} review={r} />
              ))
            )}
          </div>
        )}

        {/* Tab content: Write Review (students only) */}
        {tab === 'write' && role === 'student' && (
          <div className="animate-fadeIn space-y-6">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-xs text-text-secondary leading-relaxed flex items-start gap-3">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                You can review a company after your job or internship has ended (status reached <strong className="text-text-primary">selected, rejected, interview, on-hold, or reviewed</strong>, or when the application deadline has passed).
              </span>
            </div>

            {eligibleApps.length === 0 ? (
              <div className="bg-white border border-surface-mid rounded-xl p-8 text-center select-none">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                <p className="font-extrabold text-text-primary text-sm">No completed internships to review yet</p>
                <span className="text-xs text-text-muted mt-1.5 max-w-sm mx-auto block leading-relaxed font-medium">
                  Apply to opportunities and progress through the hiring process to unlock reviews.
                </span>
              </div>
            ) : (
              <div className="bg-white border border-surface-mid rounded-xl p-6 shadow-sm">
                {formMsg && (
                  <div className={`p-4 rounded-xl mb-6 flex items-start gap-2.5 text-xs font-semibold ${
                    formMsg.includes('success')
                      ? 'bg-accent-teal/10 text-accent-teal border border-accent-teal/20'
                      : 'bg-accent-rose/10 text-accent-rose border border-accent-rose/20'
                  }`}>
                    {formMsg.includes('success') ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent-teal" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-accent-rose" />
                    )}
                    <span>{formMsg}</span>
                  </div>
                )}

                <form onSubmit={submitReview} className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Select an Internship / Application *</label>
                    <select
                      value={selectedApp}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedApp(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-surface-mid rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm font-semibold bg-white"
                    >
                      <option value="">Choose application...</option>
                      {eligibleApps.map((app) => {
                        const job  = app.jobId as IJob;
                        const rid  = job?.recruiterId ?? '';
                        const jid  = job?._id ?? '';
                        const done = writtenIds.has(`${rid}__${jid}`);
                        return (
                          <option key={app._id} value={app._id} disabled={done}>
                            {job?.title} — {job?.companyName} ({app.status}) {done ? ' ✓ Reviewed' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {alreadyDone && (
                    <div className="p-4 rounded-xl bg-primary/5 text-primary border border-primary/20 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      You have already submitted feedback for this internship.
                    </div>
                  )}

                  {!alreadyDone && selectedApp && (
                    <div className="space-y-5">
                      {selApp && (
                        <div className="bg-slate-50 border border-surface-mid rounded-xl p-3 flex items-center gap-2 text-xs">
                          <span className="font-semibold text-text-secondary">Reviewing:</span>
                          <Link href={`/company/${recruiterId}`} className="font-extrabold text-primary hover:underline flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5" />
                            {(selApp.jobId as IJob)?.companyName}
                          </Link>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Your Rating *</label>
                        <div className="flex items-center gap-3">
                          <StarRating rating={rating} interactive onChange={setRating} size="lg" />
                          {rating > 0 && (
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 font-mono">
                              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="relative">
                        <div className="flex justify-between items-baseline mb-1">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Your Review *</label>
                          <span className="text-[10px] font-bold font-mono text-text-muted">
                            {content.length}/1000
                          </span>
                        </div>
                        <Textarea
                          value={content}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                          placeholder="Share your experience — work culture, mentorship, projects, growth, and the onboarding/interview process..."
                          maxLength={1000}
                          rows={5}
                        />
                      </div>

                      <Button
                        type="submit"
                        loading={formLoading}
                        className="px-6 py-3 font-bold"
                        icon={<Star className="w-4 h-4" />}
                      >
                        Submit Review
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        )}

      </div>
    </AuthenticatedLayout>
  );
}
