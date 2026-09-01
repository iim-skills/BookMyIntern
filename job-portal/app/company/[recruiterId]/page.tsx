'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Star, Building, Globe, Phone, Briefcase, MapPin, ExternalLink, ShieldCheck, MessageSquare, Clock } from 'lucide-react';
import type { IReview, IJob } from '@/types';
import StarRating from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';

interface CompanyProfile {
  firmName:    string;
  firmWebsite: string;
  firmBio:     string;
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

export default function CompanyPage() {
  const { recruiterId } = useParams<{ recruiterId: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const [data, setData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/company/${recruiterId}`)
      .then((r) => r.json())
      .then((d: CompanyData & { error?: string }) => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load company.');
        setLoading(false);
      });
  }, [recruiterId]);

  const handleContact = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setContactLoading(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId: recruiterId }),
      });
      const chat = await res.json() as { _id?: string };
      if (res.ok && chat._id) {
        router.push(`/chat/${chat._id}`);
      }
    } catch (err) {
      console.error('Failed to create/fetch conversation', err);
    } finally {
      setContactLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 select-none">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-text-muted text-xs font-semibold">Loading profile information…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 max-w-md mx-auto text-center space-y-4 select-none">
        <div className="w-12 h-12 bg-accent-rose/10 text-accent-rose rounded-full flex items-center justify-center mx-auto">
          <Building className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-extrabold text-text-primary">Profile Error</h2>
        <p className="text-xs text-text-secondary">{error || 'Company not found.'}</p>
        <Link href="/community-reviews" className="decoration-none inline-block">
          <Button variant="outline" size="sm" className="text-xs font-bold" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Reviews
          </Button>
        </Link>
      </div>
    );
  }

  const { profile, jobs, reviews, avgRating } = data;
  const recruiterName = typeof profile.userId === 'object' ? profile.userId.name : '';
  const isSignedIn = !!session;

  const initials = profile.firmName
    ? profile.firmName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'CO';

  return (
    <div className="py-6 max-w-6xl mx-auto px-4 space-y-6">
      
      {/* Back to feed */}
      <div className="select-none">
        <Link href="/community-reviews" className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors decoration-none">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Community Reviews
        </Link>
      </div>

      {/* ── COMPANY HERO & MAIN OVERVIEW CARD ── */}
      <div className="bg-white border border-surface-mid rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
        
        {/* Cover Strip */}
        <div className="bg-gradient-to-r from-primary-dark via-primary to-accent-indigo h-36 md:h-44 w-full relative" />

        {/* Profile Card Header Body */}
        <div className="relative pt-12 pb-6 px-6 md:px-8">
          
          {/* Overlapping Logo/Avatar */}
          <div className="w-20 h-20 rounded-full border-4 border-white bg-primary-light text-primary flex items-center justify-center font-display font-extrabold text-2xl absolute -top-10 left-6 md:left-8 shadow-md select-none">
            {initials}
          </div>

          {/* Action and text spacing grid */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 select-none">
                <h1 className="text-2xl font-display font-extrabold text-text-primary tracking-tight md:text-3xl">
                  {profile.firmName}
                </h1>
                <span className="inline-flex items-center text-accent-teal" title="Verified Recruiter Firm">
                  <ShieldCheck className="w-6 h-6 fill-accent-teal/10" />
                </span>
              </div>

              {/* Meta details */}
              <div className="text-xs font-semibold text-text-secondary flex flex-wrap items-center gap-x-3 gap-y-1.5 select-none">
                <span className="text-text-primary font-bold">{recruiterName}</span>
                <span className="text-slate-300 font-normal">&bull;</span>
                <span>{profile.designation}</span>
              </div>
            </div>

            {/* Right side contact button */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleContact}
                loading={contactLoading}
                className="font-bold text-xs"
                icon={<MessageSquare className="w-4 h-4" />}
              >
                Contact Recruiter
              </Button>
            </div>
          </div>

          {/* Bio info */}
          {profile.firmBio && (
            <div className="mt-6 bg-slate-50 border-l-4 border-primary p-4 rounded-r-lg">
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Company Description</h4>
              <p className="text-xs text-text-secondary leading-relaxed select-text">
                {profile.firmBio}
              </p>
            </div>
          )}

          {/* Table contact data */}
          <div className="border-t border-surface-mid mt-6 pt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              {profile.firmWebsite && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-text-muted shrink-0" />
                  <span className="text-text-muted select-none">Website:</span>
                  <a
                    href={profile.firmWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    {profile.firmWebsite}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-text-muted shrink-0" />
                <span className="text-text-muted select-none">Phone Contact:</span>
                {isSignedIn ? (
                  <span className="text-text-primary font-bold">{profile.phone}</span>
                ) : (
                  <span className="text-text-muted italic select-none">
                    ••••••••{' '}
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`}
                      className="text-primary font-bold not-italic hover:underline cursor-pointer"
                    >
                      Sign in to view
                    </Link>
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── DYNAMIC KPI STRIP FOR STATISTICS ── */}
      <div className="grid grid-cols-3 gap-4 select-none">
        <div className="bg-white border border-surface-mid rounded-xl p-4 text-center shadow-sm">
          <span className="text-lg md:text-xl font-display font-extrabold text-text-primary block font-mono">
            {jobs.length}
          </span>
          <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-1 block">Open Positions</span>
        </div>
        <div className="bg-white border border-surface-mid rounded-xl p-4 text-center shadow-sm">
          <span className="text-lg md:text-xl font-display font-extrabold text-text-primary block font-mono">
            {reviews.length}
          </span>
          <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-1 block">Total Reviews</span>
        </div>
        <div className="bg-white border border-surface-mid rounded-xl p-4 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 justify-center">
            <span className="text-lg md:text-xl font-display font-extrabold text-text-primary block font-mono leading-none">
              {avgRating !== null ? avgRating.toFixed(1) : 'N/A'}
            </span>
            {avgRating !== null && <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />}
          </div>
          <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-1 block">Average Rating</span>
        </div>
      </div>

      {/* ── TWO COLUMN GRID: ACTIVE JOBS vs REVIEWS FEED ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Positions (65%) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider select-none flex items-center gap-1.5 border-b border-surface-mid pb-3">
            <Briefcase className="w-4 h-4 text-primary" />
            Open Internships ({jobs.length})
          </h2>

          {jobs.length === 0 ? (
            <div className="bg-white border border-surface-mid border-dashed rounded-xl p-8 text-center select-none">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-extrabold text-text-secondary text-sm">No open positions</p>
              <span className="text-xs text-text-muted mt-1 block">This company isn't accepting internship submissions right now.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {jobs.map((job) => {
                const expired = new Date(job.deadline) < new Date();
                const jobLink = isSignedIn
                  ? `/jobs/${job._id}`
                  : `/login?callbackUrl=${encodeURIComponent(`/jobs/${job._id}`)}`;

                return (
                  <div
                    className="bg-white border border-surface-mid rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 flex flex-col justify-between"
                    key={job._id}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 select-none">
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                          {job.jobType}
                        </span>
                        {expired ? (
                          <span className="text-[9px] bg-accent-rose/10 text-accent-rose font-bold px-2 py-0.5 rounded uppercase font-mono">
                            Closed
                          </span>
                        ) : (
                          job.salary && (
                            <span className="text-[9px] bg-accent-teal/10 text-accent-teal font-bold px-2 py-0.5 rounded font-mono">
                              {job.salary}
                            </span>
                          )
                        )}
                      </div>
                      <h3 className="font-extrabold text-text-primary text-sm mt-3 leading-snug">
                        {job.title}
                      </h3>
                      <div className="text-[11px] text-text-secondary font-semibold mt-1.5 flex items-center gap-1 select-none">
                        <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        {job.location}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                      <Link href={jobLink} className="decoration-none">
                        <Button variant="ghost" size="sm" className="font-bold text-[11px] py-1 px-3">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Reviews Feed (35%) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider select-none flex items-center gap-1.5 border-b border-surface-mid pb-3">
            <MessageSquare className="w-4 h-4 text-primary" />
            Company Feedback ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="bg-white border border-surface-mid rounded-xl p-8 text-center select-none">
              <p className="font-semibold text-text-muted text-xs">No reviews submitted for this company yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => {
                const reviewer = typeof r.reviewerId === 'object' ? r.reviewerId : null;
                const reviewJob = typeof r.jobId === 'object' && r.jobId ? r.jobId : null;

                return (
                  <div className="bg-white border border-surface-mid rounded-xl p-4 shadow-sm" key={r._id}>
                    <div className="flex justify-between items-center gap-2 mb-3 pb-2 border-b border-slate-100 select-none">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-extrabold text-[10px] border border-primary-light/50 shrink-0">
                          {reviewer?.name ? reviewer.name[0].toUpperCase() : 'A'}
                        </div>
                        <div>
                          <div className="font-bold text-text-primary text-xs leading-tight">
                            {reviewer?.name ?? 'Anonymous'}
                          </div>
                          <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
                            {reviewer?.role ?? 'User'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <StarRating rating={r.rating} size="sm" />
                        <span className="text-[9px] text-text-muted font-bold block font-mono mt-0.5">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {reviewJob && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-light text-primary border border-primary-light/60 rounded text-[9px] font-bold mb-2 font-mono select-none">
                        re: {(reviewJob as { title?: string }).title}
                      </span>
                    )}

                    <p className="text-xs text-text-secondary leading-relaxed select-text">
                      {r.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
