'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, 
  Search, 
  Award, 
  Briefcase, 
  Building, 
  User, 
  Clock, 
  Compass, 
  Quote, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Check 
} from 'lucide-react';
import type { IReview } from '@/types';
import StarRating from '@/components/ui/StarRating';
import Input from '@/components/ui/Input';

function recruiterIdFromReview(r: IReview): string | null {
  if (r.reviewerRole === 'recruiter') {
    return typeof r.reviewerId === 'object' ? r.reviewerId._id : null;
  }
  return typeof r.revieweeId === 'object' ? r.revieweeId._id : null;
}

function companyNameFromReview(r: IReview & { companyName?: string | null }): string | null {
  if (r.companyName) return r.companyName;
  const job = typeof r.jobId === 'object' && r.jobId ? r.jobId : null;
  return job ? (job as { companyName?: string }).companyName ?? null : null;
}

/* ── Inline Expandable Review Card Component ── */
function CommunityReviewCard({
  review,
  onJobClick,
}: {
  review: IReview;
  onJobClick: (jobId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const reviewer = typeof review.reviewerId === 'object' ? review.reviewerId : null;
  const reviewee = typeof review.revieweeId === 'object' ? review.revieweeId : null;
  const job      = typeof review.jobId === 'object' && review.jobId ? review.jobId : null;
  const recId    = recruiterIdFromReview(review);
  const coName   = companyNameFromReview(review);

  const initials = reviewer?.name
    ? reviewer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  const hasLongContent = review.content.length > 200;

  // Helpful state mock-interaction
  const mockHelpfulCount = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < review._id.length; i++) {
      hash = review._id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 14); // 0 to 13 initial helpful count
  }, [review._id]);

  const [votes, setVotes] = useState(mockHelpfulCount);
  const [userVoted, setUserVoted] = useState<'yes' | 'no' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleVote = (type: 'yes' | 'no') => {
    if (userVoted === type) {
      setUserVoted(null);
      if (type === 'yes') setVotes((v) => v - 1);
    } else {
      if (type === 'yes') {
        setVotes((v) => v + (userVoted === 'no' ? 1 : 1));
      } else if (userVoted === 'yes') {
        setVotes((v) => v - 1);
      }
      setUserVoted(type);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/community-reviews#${review._id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Build a nice headline for the review
  const cardHeadline = useMemo(() => {
    if (reviewer?.role === 'recruiter') {
      return `Recruiter Assessment for ${reviewee?.name ?? 'Candidate'}`;
    }
    if (job && coName) {
      return `${job.title} Internship at ${coName}`;
    }
    return `Work Review & Feedback`;
  }, [reviewer, reviewee, job, coName]);

  // Color-coded rating badge background based on brand blue theme
  const badgeColorClass = useMemo(() => {
    if (review.rating >= 4) return 'bg-primary text-white border border-primary';
    if (review.rating >= 3) return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
    return 'bg-slate-400 text-white border border-slate-400';
  }, [review.rating]);

  return (
    <div 
      id={review._id}
      className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col md:flex-row gap-8 items-start animate-fadeIn"
    >
      {/* Left Column: Rating Badge & Reviewer metadata */}
      <div className="w-full md:w-48 flex md:flex-col items-start gap-5 shrink-0 md:border-r border-slate-100 md:pr-8 pb-4 md:pb-0">
        
        {/* Rating Score Badge */}
        <div className={`flex items-center gap-1.5 font-display font-extrabold px-3 py-1.5 rounded-xl text-sm font-mono shadow-xs shrink-0 select-none ${badgeColorClass}`}>
          <Star className="w-4 h-4 fill-white text-white shrink-0" />
          <span>{review.rating.toFixed(1)}</span>
        </div>

        {/* User profile info */}
        <div className="flex items-center md:items-start gap-3 md:flex-col w-full">
          <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-extrabold text-sm border border-primary-light/50 shrink-0 select-none">
            {initials}
          </div>
          <div>
            <div className="font-extrabold text-text-primary text-sm flex items-center gap-1.5 flex-wrap">
              {reviewer?.name ?? 'Anonymous'}
            </div>
            
            <div className="mt-1 flex flex-wrap gap-1 items-center">
              {reviewer?.role === 'recruiter' ? (
                <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wider select-none">
                  Company
                </span>
              ) : (
                <span className="text-[9px] bg-primary-light text-primary font-bold px-2 py-0.5 rounded border border-primary-light/50 uppercase tracking-wider select-none">
                  Student
                </span>
              )}
            </div>

            <div className="text-[10px] text-text-muted font-bold font-mono mt-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              {new Date(review.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Content and details */}
      <div className="flex-1 space-y-4 w-full">
        <div>
          {/* Headline */}
          <h3 className="text-base font-display font-extrabold text-text-primary tracking-tight leading-snug mb-2.5">
            {cardHeadline}
          </h3>

          {/* References Tags */}
          <div className="flex flex-wrap gap-2.5 mb-3.5">
            {job && (
              <button
                onClick={() => onJobClick((job as { _id: string })._id)}
                className="inline-flex items-center gap-1.5 bg-primary-light/45 border border-primary-light hover:bg-primary-light/80 transition-colors text-primary font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                <span>{(job as { title?: string }).title}</span>
              </button>
            )}

            {coName && recId && (
              <Link 
                href={`/company/${recId}`} 
                className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-text-secondary hover:text-text-primary font-bold px-3 py-1.5 rounded-lg text-xs decoration-none"
              >
                <Building className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>{coName}</span>
              </Link>
            )}

            {reviewee && (
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100/50 text-indigo-700 font-bold px-3 py-1.5 rounded-lg text-xs select-none">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>For: {reviewee.name}</span>
                <span className="text-[9px] bg-white text-indigo-500 border border-indigo-100 px-1 py-0.2 rounded font-mono uppercase scale-90">
                  {reviewee.role}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content text */}
        <div className="relative pl-4 border-l-2 border-slate-200 py-0.5 select-text">
          <Quote className="w-4 h-4 text-primary/5 absolute -top-2.5 -left-2 rotate-180 select-none pointer-events-none" />
          <p className={`text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-medium ${expanded ? '' : 'line-clamp-3'}`}>
            {review.content}
          </p>
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-dashed border-slate-100">
          
          {/* Helpfulness Vote Mock-Interaction */}
          <div className="flex items-center gap-2 text-xs select-none">
            <span className="text-[11px] text-text-muted font-bold mr-1">Was this review helpful?</span>
            
            <button
              onClick={() => handleVote('yes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-[10px] cursor-pointer transition-all ${
                userVoted === 'yes'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-slate-50 text-text-secondary border-slate-200 hover:bg-slate-100 hover:text-text-primary'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 shrink-0 ${userVoted === 'yes' ? 'fill-white' : ''}`} />
              <span>Yes ({votes})</span>
            </button>

            <button
              onClick={() => handleVote('no')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-[10px] cursor-pointer transition-all ${
                userVoted === 'no'
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-slate-50 text-text-secondary border-slate-200 hover:bg-slate-100 hover:text-text-primary'
              }`}
            >
              <ThumbsDown className={`w-3.5 h-3.5 shrink-0 ${userVoted === 'no' ? 'fill-white' : ''}`} />
              <span>No</span>
            </button>
          </div>

          {/* Share & Expand */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-text-secondary hover:text-text-primary font-bold text-[10px] cursor-pointer transition-all bg-white hover:bg-slate-50"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600 shrink-0 animate-bounce" />
                  <span className="text-green-600 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>Share</span>
                </>
              )}
            </button>

            {hasLongContent && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors bg-transparent border-none p-0 cursor-pointer pl-1"
              >
                {expanded ? 'Show Less' : 'Read Full Review'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Search/Explorer Hero Banner Component ── */
function HeroBanner({ 
  stats, 
  onWriteClick 
}: { 
  stats: { totalReviews: number, totalCompanies: number };
  onWriteClick: () => void;
}) {
  return (
    <div className="bg-gradient-to-r from-primary-light via-white to-indigo-50/20 border border-slate-200/80 rounded-3xl p-8 md:p-12 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 select-none">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
      
      <div className="space-y-4 max-w-xl z-10 text-left">
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-primary tracking-tight leading-tight">
          Explore Internship Reviews & Ratings
        </h1>
        <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-semibold">
          Gain transparency. Read honest, firsthand work and internship experiences written by real students and startup recruiters across India.
        </p>
      </div>

      {/* Stats and CTA Block */}
      <div className="flex flex-col sm:flex-row items-center gap-4 z-10 shrink-0 w-full md:w-auto">
        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
          <div className="bg-white/80 backdrop-blur-xs border border-slate-200/60 p-4 rounded-2xl text-center shadow-2xs min-w-[110px]">
            <span className="text-xl md:text-2xl font-display font-extrabold text-primary block font-mono">
              {stats.totalReviews}
            </span>
            <span className="text-[9px] text-text-muted font-extrabold uppercase tracking-wider mt-0.5 block">Reviews</span>
          </div>
          <div className="bg-white/80 backdrop-blur-xs border border-slate-200/60 p-4 rounded-2xl text-center shadow-2xs min-w-[110px]">
            <span className="text-xl md:text-2xl font-display font-extrabold text-primary block font-mono">
              {stats.totalCompanies}
            </span>
            <span className="text-[9px] text-text-muted font-extrabold uppercase tracking-wider mt-0.5 block">Companies</span>
          </div>
        </div>

        <button
          onClick={onWriteClick}
          className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-3 px-5 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-xs cursor-pointer border-none flex items-center justify-center gap-2"
        >
          <Quote className="w-3.5 h-3.5" />
          Write a Review
        </button>
      </div>
    </div>
  );
}

export default function CommunityReviewsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Client filtration
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'recruiter'>('all');
  const [ratingFilter, setRatingFilter] = useState<0 | 3 | 4>(0);

  useEffect(() => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((d: IReview[]) => {
        setReviews(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleJobClick = (jobId: string) => {
    if (session) {
      router.push(`/jobs/${jobId}`);
    } else {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/jobs/${jobId}`)}`);
    }
  };

  const handleWriteClick = () => {
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/reviews')}`);
    } else if (session.user?.role === 'student') {
      router.push('/reviews');
    } else {
      router.push('/recruiter/dashboard');
    }
  };

  // Derive stats dynamically from total dataset
  const stats = useMemo(() => {
    if (!reviews.length) return { totalReviews: 0, totalCompanies: 0 };
    const totalReviews = reviews.length;

    const companies = new Set(
      reviews.map((r) => companyNameFromReview(r)).filter(Boolean)
    );

    return {
      totalReviews,
      totalCompanies: companies.size,
    };
  }, [reviews]);

  // Perform filtering
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (roleFilter !== 'all' && r.reviewerRole !== roleFilter) return false;
      if (ratingFilter > 0 && r.rating < ratingFilter) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const reviewerName = typeof r.reviewerId === 'object' && r.reviewerId && 'name' in r.reviewerId
          ? String(r.reviewerId.name || '').toLowerCase()
          : '';
        const revieweeName = typeof r.revieweeId === 'object' && r.revieweeId && 'name' in r.revieweeId
          ? String(r.revieweeId.name || '').toLowerCase()
          : '';
        const companyName = companyNameFromReview(r)?.toLowerCase() ?? '';
        const content = (r.content || '').toLowerCase();

        return (
          reviewerName.includes(query) ||
          revieweeName.includes(query) ||
          companyName.includes(query) ||
          content.includes(query)
        );
      }

      return true;
    });
  }, [reviews, search, roleFilter, ratingFilter]);

  return (
    <div className="min-h-screen bg-slate-50/40 relative overflow-hidden">
      {/* Dynamic background shapes to add depth and vibe */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-50/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container: pt-32 pushes past the 64px (h-16) fixed navbar */}
      <div className="pt-32 pb-24 max-w-5xl md:max-w-6xl mx-auto px-4 space-y-12 relative z-10">

        {/* Top Hero Stats Banner */}
        <HeroBanner stats={stats} onWriteClick={handleWriteClick} />

        {/* Filter Row Controls */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          
          {/* Search Input */}
          <div className="w-full md:max-w-xs">
            <Input
              placeholder="Search company, reviewer, or text…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4 text-text-muted" />}
              className="h-10 text-xs border-slate-200 focus:border-primary focus:ring-primary/10"
            />
          </div>

          {/* Filter Pills with primary blue branding */}
          <div className="flex flex-wrap items-center gap-3.5 text-xs">
            {/* Role filter */}
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200/60">
              {(['all', 'student', 'recruiter'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all border-none text-[10px] uppercase tracking-wider cursor-pointer ${
                    roleFilter === role
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary bg-transparent'
                  }`}
                >
                  {role === 'all' ? 'All Reviews' : role === 'student' ? 'Student' : 'Company'}
                </button>
              ))}
            </div>

            {/* Rating Filter */}
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200/60">
              {([0, 4, 3] as const).map((stars) => (
                <button
                  key={stars}
                  onClick={() => setRatingFilter(stars)}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all border-none text-[10px] uppercase tracking-wider cursor-pointer ${
                    ratingFilter === stars
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary bg-transparent'
                  }`}
                >
                  {stars === 0 ? 'Any Stars' : `★ ${stars}+`}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Main Review feed: Wide cards in a column layout (Glassdoor Style) */}
        {loading ? (
          <div className="py-20 text-center select-none space-y-4">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-text-muted text-xs font-semibold">Loading feed reviews…</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center max-w-md mx-auto select-none">
            <Compass className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <p className="font-extrabold text-text-primary text-sm">No reviews match filters</p>
            <span className="text-xs text-text-muted mt-2 block leading-relaxed font-medium">
              Try adjusting your search query, rating criteria, or filters.
            </span>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredReviews.map((r) => (
              <CommunityReviewCard key={r._id} review={r} onJobClick={handleJobClick} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
