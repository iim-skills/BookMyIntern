'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/ui/AuthenticatedLayout';
import KPICard from '@/components/ui/KPICard';
import StatusBadge from '@/components/ui/StatusBadge';
import StarRating from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';
import type { IRecruiterProfile, IReview, IJob, IApplication } from '@/types';
import { Link } from 'lucide-react';

type Tab = 'recruiters' | 'reviews' | 'jobs' | 'applications';

async function adminDelete(url: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(url, { method: 'DELETE' });
  const data = await res.json() as { ok?: boolean; error?: string };
  return { ok: res.ok, error: data.error };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('recruiters');
  const [recruiters, setRecruiters] = useState<IRecruiterProfile[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState('');

  const showFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 3000);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, revRes, jRes, aRes] = await Promise.all([
        fetch('/api/admin/recruiters'),
        fetch('/api/admin/reviews'),
        fetch('/api/admin/jobs'),
        fetch('/api/admin/applications'),
      ]);
      const rData = await rRes.json();
      const revData = await revRes.json();
      const jData = await jRes.json();
      const aData = await aRes.json();
      setRecruiters(Array.isArray(rData) ? rData : []);
      setReviews(Array.isArray(revData) ? revData : []);
      setJobs(Array.isArray(jData) ? jData : []);
      setApplications(Array.isArray(aData) ? aData : []);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') void loadAll();
  }, [status, loadAll]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-light gap-3 select-none">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-text-muted text-xs font-semibold">Validating admin credentials…</p>
      </div>
    );
  }

  const handleVerify = async (profileId: string, verify: boolean) => {
    const res = await fetch(`/api/admin/recruiters/${profileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminVerified: verify }),
    });
    if (res.ok) {
      setRecruiters((prev) =>
        prev.map((r) => (r._id === profileId ? { ...r, adminVerified: verify } : r))
      );
      showFlash(verify ? 'Recruiter account verified ✓' : 'Recruiter account unverified');
    } else {
      showFlash('Failed to update recruiter verification.');
    }
  };

  const handleDelete = async <T extends { _id: string }>(
    id: string,
    endpoint: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    if (!window.confirm('Are you sure you want to delete this item permanently? This is an administrative overwrite.')) return;
    const { ok, error } = await adminDelete(`${endpoint}/${id}`);
    if (ok) {
      setter((prev) => prev.filter((x) => x._id !== id));
      showFlash('Item deleted successfully.');
    } else {
      showFlash(error ?? 'Deletion failed.');
    }
  };

  const tabBtn = (t: Tab, label: string, count: number) => (
    <button
      onClick={() => setTab(t)}
      className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer outline-none flex items-center gap-2 ${tab === t
          ? 'border-primary text-primary'
          : 'border-transparent text-text-secondary hover:text-text-primary'
        }`}
    >
      <span>{label}</span>
      <span
        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${tab === t ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-text-muted'
          }`}
      >
        {count}
      </span>
    </button>
  );

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  const pendingRecruiters = recruiters.filter((r) => !r.adminVerified).length;
  const activeJobs = jobs.filter((j) => new Date(j.deadline) >= new Date()).length;
  const selectedApps = applications.filter((a) => a.status === 'selected').length;

  return (
    <AuthenticatedLayout allowedRoles={['admin']}>
      <div className="space-y-6">

        {/* ── TOP HEADER ── */}
        <header className="border-b border-surface-mid pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
          <div>
            <h1 className="text-xl font-display font-extrabold text-text-primary tracking-tight">Admin Control Panel</h1>
            <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs">shield</span>
              Developer Overwrite &mdash; {session?.user?.email}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadAll} className="text-xs font-bold" icon={<span className="material-symbols-outlined text-sm">refresh</span>}>
            Reload Data
          </Button>
        </header>

        {flash && (
          <div
            className={`border text-xs font-semibold rounded-xl py-3.5 px-4 flex items-center gap-2 mb-4 select-none animate-pulse ${flash.includes('failed') || flash.includes('Failed')
                ? 'bg-accent-rose/10 text-accent-rose border-accent-rose/25'
                : 'bg-accent-teal/10 text-accent-teal border-accent-teal/20'
              }`}
          >
            <span className="material-symbols-outlined text-sm">
              {flash.includes('failed') || flash.includes('Failed') ? 'error' : 'check_circle'}
            </span>
            <span>{flash}</span>
          </div>
        )}

        {/* ── KPI METRICS ROW ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Recruiters"
            value={recruiters.length}
            icon={<span className="material-symbols-outlined text-[20px]">supervisor_account</span>}
            delta={{ value: `${pendingRecruiters} pending`, isPositive: pendingRecruiters === 0 }}
          />
          <KPICard
            title="Avg Community Rating"
            value={`${avgRating} ★`}
            icon={<span className="material-symbols-outlined text-[20px] text-accent-amber">stars</span>}
            delta={{ value: `${reviews.length} reviews`, isPositive: true }}
          />
          <KPICard
            title="Active Listings"
            value={jobs.length}
            icon={<span className="material-symbols-outlined text-[20px] text-primary">work</span>}
            delta={{ value: `${activeJobs} active`, isPositive: true }}
          />
          <KPICard
            title="Student Applications"
            value={applications.length}
            icon={<span className="material-symbols-outlined text-[20px] text-accent-teal">assignment</span>}
            delta={{ value: `${selectedApps} selected`, isPositive: true }}
          />
        </section>

        {/* ── SELECTION DATABASE TABS ── */}
        <div className="flex border-b border-surface-mid select-none flex-wrap gap-2 pt-2">
          {tabBtn('recruiters', 'Recruiters', recruiters.length)}
          {tabBtn('reviews', 'Reviews', reviews.length)}
          {tabBtn('jobs', 'Jobs', jobs.length)}
          {tabBtn('applications', 'Applications', applications.length)}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12 select-none">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        )}

        {/* ── TABS CONTENT ── */}
        {!loading && (
          <div className="space-y-4">

            {/* 1. RECRUITERS TAB */}
            {tab === 'recruiters' && (
              <div className="space-y-4">
                <div className="text-xs text-text-secondary font-semibold flex items-center gap-1 select-none">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span>Recruiter profiles awaiting authorization. Verified users are unlocked to post opportunities.</span>
                </div>

                {recruiters.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-surface-mid rounded-xl text-text-muted text-xs font-semibold">
                    No recruiter accounts registered.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3.5">
                    {recruiters.map((r) => {
                      const user = typeof r.userId === 'object' ? r.userId : null;
                      return (
                        <div
                          className="bg-white p-5 border border-surface-mid rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all duration-200"
                          key={r._id}
                        >
                          <div className="min-w-0 flex-1">
                            <h3 className="font-extrabold text-sm md:text-base text-text-primary">{r.firmName}</h3>
                            <div className="text-xs font-semibold text-text-secondary mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 select-none">
                              {user && (
                                <>
                                  <span className="font-bold text-text-primary">{user.name}</span>
                                  <span className="text-slate-300">&bull;</span>
                                  <span>{user.email}</span>
                                </>
                              )}
                            </div>
                            <div className="text-xs text-text-secondary mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="font-bold">{r.designation}</span>
                              {r.firmWebsite && (
                                <>
                                  <span className="text-slate-300 select-none">&bull;</span>
                                  <a
                                    href={r.firmWebsite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline inline-flex items-center gap-0.5 font-bold"
                                  >
                                    {r.firmWebsite}
                                    <span className="material-symbols-outlined text-xs select-none">open_in_new</span>
                                  </a>
                                </>
                              )}
                            </div>
                            <p className="text-[10px] text-text-muted font-bold mt-3 select-none uppercase tracking-wide">
                              Contact: {r.phone} &nbsp;|&nbsp; Registered: {new Date(r.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex md:flex-col items-center md:items-end gap-2.5 w-full md:w-auto shrink-0 select-none border-t border-slate-100 md:border-none pt-3.5 md:pt-0">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${r.adminVerified
                                ? 'bg-accent-teal/10 text-accent-teal'
                                : 'bg-accent-amber/10 text-accent-amber'
                              }`}>
                              {r.adminVerified ? 'Verified ✓' : 'Pending Verification'}
                            </span>

                            {r.adminVerified ? (
                              <Button
                                onClick={() => void handleVerify(r._id, false)}
                                variant="danger"
                                size="sm"
                                className="text-xs font-bold w-full md:w-auto"
                                icon={<span className="material-symbols-outlined text-xs">cancel</span>}
                              >
                                Revoke Verification
                              </Button>
                            ) : (
                              <Button
                                onClick={() => void handleVerify(r._id, true)}
                                variant="primary"
                                size="sm"
                                className="text-xs font-bold w-full md:w-auto"
                                icon={<span className="material-symbols-outlined text-xs">check_circle</span>}
                              >
                                Approve Account
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. REVIEWS TAB */}
            {tab === 'reviews' && (
              <div className="space-y-4">
                <div className="text-xs text-text-secondary font-semibold flex items-center gap-1 select-none">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span>Community ratings feedback log. Click delete to prune violating records.</span>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-surface-mid rounded-xl text-text-muted text-xs font-semibold">
                    No community reviews published.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3.5">
                    {reviews.map((r) => {
                      const reviewer = typeof r.reviewerId === 'object' ? r.reviewerId : null;
                      const reviewee = typeof r.revieweeId === 'object' ? r.revieweeId : null;
                      const job = typeof r.jobId === 'object' && r.jobId ? r.jobId : null;
                      return (
                        <div
                          className="bg-white p-5 border border-surface-mid rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start gap-4 hover:shadow-md transition-all duration-200"
                          key={r._id}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold text-text-secondary select-none mb-2">
                              <span className="text-text-primary font-bold">{reviewer?.name}</span>
                              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded capitalize">({reviewer?.role})</span>
                              <span className="text-text-muted font-normal lowercase">rated</span>
                              <span className="text-text-primary font-bold">{reviewee?.name}</span>
                              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded capitalize">({reviewee?.role})</span>
                            </div>

                            {job && (
                              <div className="text-xs text-primary font-bold mb-3 flex items-center gap-1 select-none">
                                <span className="material-symbols-outlined text-xs">work</span>
                                <span>re: {(job as { title?: string }).title} at {(job as { companyName?: string }).companyName}</span>
                              </div>
                            )}

                            <StarRating rating={r.rating} size="sm" />
                            <p className="text-xs text-text-secondary leading-relaxed mt-3 whitespace-pre-wrap font-medium">
                              {r.content}
                            </p>
                            <p className="text-[10px] text-text-muted font-bold mt-3 select-none">
                              {new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>

                          <Button
                            onClick={() => void handleDelete(r._id, '/api/admin/reviews', setReviews)}
                            variant="danger"
                            size="sm"
                            className="text-xs font-bold shrink-0 self-start md:self-auto"
                            icon={<span className="material-symbols-outlined text-xs">delete</span>}
                          >
                            Delete Review
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. JOBS TAB */}
            {tab === 'jobs' && (
              <div className="space-y-4">
                <div className="text-xs text-text-secondary font-semibold flex items-center gap-1 select-none">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span>Currently published internship listings. Deletion clears matching application records.</span>
                </div>

                {jobs.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-surface-mid rounded-xl text-text-muted text-xs font-semibold">
                    No active job listings published.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3.5">
                    {jobs.map((j) => {
                      const recruiter = (j as any).recruiterId;
                      return (
                        <div
                          className="bg-white p-5 border border-surface-mid rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start gap-4 hover:shadow-md transition-all duration-200"
                          key={j._id}
                        >
                          <div className="min-w-0 flex-1">
                            <h3 className="font-extrabold text-sm md:text-base text-text-primary">{j.title}</h3>
                            <p className="text-xs font-bold text-primary mt-0.5 select-none">{j.companyName} &bull; {j.location}</p>

                            <div className="mt-3 flex flex-wrap gap-2 select-none">
                              <span className="px-2.5 py-0.5 bg-surface-light border border-surface-mid text-text-secondary text-[10px] rounded font-bold uppercase tracking-wider">
                                {j.jobType}
                              </span>
                              {j.salary && (
                                <span className="px-2.5 py-0.5 bg-accent-teal/10 text-accent-teal text-[10px] rounded font-bold uppercase tracking-wider">
                                  {j.salary}
                                </span>
                              )}
                            </div>

                            {recruiter && (
                              <div className="text-xs text-text-secondary font-semibold mt-3 flex items-center gap-1 select-none">
                                <span className="material-symbols-outlined text-xs text-text-muted">person</span>
                                <span>Publisher: {recruiter.name} ({recruiter.email})</span>
                              </div>
                            )}

                            <p className="text-[10px] text-text-muted font-bold mt-3.5 flex items-center gap-1.5 select-none uppercase tracking-wide">
                              <span className="material-symbols-outlined text-xs">calendar_today</span>
                              Deadline: {new Date(j.deadline).toLocaleDateString()} &nbsp;|&nbsp; Posted: {new Date(j.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 select-none shrink-0 self-start md:self-end">
                            <Button
                              onClick={() => void handleDelete(j._id, '/api/admin/jobs', setJobs)}
                              variant="danger"
                              size="sm"
                              className="text-xs font-bold"
                              icon={<span className="material-symbols-outlined text-xs">delete</span>}
                            >
                              Delete Listing
                            </Button>
                            <Link href={`/jobs/${j._id}`} className="decoration-none">
                              <Button variant="secondary" size="sm" className="text-xs font-bold border border-surface-mid hover:bg-slate-50">
                                Preview
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. APPLICATIONS TAB */}
            {tab === 'applications' && (
              <div className="space-y-4">
                <div className="text-xs text-text-secondary font-semibold flex items-center gap-1 select-none">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span>Student registration logs. Admin override supports removal.</span>
                </div>

                {applications.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-surface-mid rounded-xl text-text-muted text-xs font-semibold">
                    No application documents uploaded.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3.5">
                    {applications.map((a) => {
                      const job = typeof a.jobId === 'object' ? (a.jobId as IJob) : null;
                      const student = typeof a.studentId === 'object' ? (a.studentId as any) : null;
                      return (
                        <div
                          className="bg-white p-5 border border-surface-mid rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start gap-4 hover:shadow-md transition-all duration-200"
                          key={a._id}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-extrabold text-sm text-text-primary flex items-center gap-2 select-none">
                              <span>{student?.name}</span>
                              <span className="text-xs font-bold text-text-muted">({student?.email})</span>
                            </div>
                            <p className="text-xs text-text-secondary mt-1.5 select-none">
                              Applied to: <strong className="text-text-primary">{job?.title}</strong> at {job?.companyName}
                            </p>

                            <div className="flex gap-2 flex-wrap mt-3.5 items-center select-none">
                              <StatusBadge status={a.status} />

                              {a.resumePath && (
                                <a
                                  href={a.resumePath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-teal/10 text-accent-teal border border-accent-teal/15 rounded-full font-bold text-[9px] uppercase tracking-wider decoration-none"
                                >
                                  <span className="material-symbols-outlined text-xs">description</span>
                                  <span>Resume File</span>
                                </a>
                              )}
                            </div>

                            <div className="text-[10px] text-text-muted font-bold mt-3.5 flex flex-wrap items-center gap-1.5 select-none uppercase tracking-wide">
                              <span className="material-symbols-outlined text-xs">calendar_today</span>
                              <span>Applied: {new Date(a.createdAt).toLocaleDateString()}</span>
                              {a.phone && (
                                <>
                                  <span className="text-slate-300 font-normal">&bull;</span>
                                  <span className="flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-xs">call</span>
                                    {a.phone}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <Button
                            onClick={() => void handleDelete(a._id, '/api/admin/applications', setApplications)}
                            variant="danger"
                            size="sm"
                            className="text-xs font-bold shrink-0 self-start md:self-end"
                            icon={<span className="material-symbols-outlined text-xs">delete</span>}
                          >
                            Delete Application
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </AuthenticatedLayout>
  );
}
