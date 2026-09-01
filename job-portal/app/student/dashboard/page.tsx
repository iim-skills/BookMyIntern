'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/ui/AuthenticatedLayout';
import KPICard from '@/components/ui/KPICard';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import SkeletonCard from '@/components/ui/SkeletonCard';
import type { IApplication, IJob, ApplicationStatus } from '@/types';

const TERMINAL: ApplicationStatus[] = [
  'selected', 'rejected', 'on-hold', 'interview', 'reviewed',
];

// Helper to resolve company logos or fallbacks
const getCompanyLogo = (companyName: string) => {
  const name = companyName.toLowerCase();
  if (name.includes('google')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdUB3QQkdUoKAZtKJJWJwdV8rc97vQ3mou8LZDMu04Q2pIMtuQ1jaQkoijPjXRMqUBkx0SPg3JG0nzIar32BmdD5ow7fm971NrkxerhqeyZOuQnPbRL-VS_slV1D84P8KWzga3JsSmwO6KKh-VBcdihTeot1HjdwZzchMg0Pjh_h2VCQK3TriWJzPNeS0ShN-FXeGezxy1Rx0eD3tpUnZUq1HFX8-VDb_Web2CV3v9B3KmXE278SFigoJdehaVViBhvAC47eD7bODU';
  }
  if (name.includes('spotify')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyS99Pm6i-rd7df9RZSE0G6HApIO_Bb6U_2LLtn96SRcAnQiqLL0SLL9Zl3Wcm8LNlusPyLsfUTD4WQUcF0uVTdJEDnWycf8wqTzdDiDaQNUFHL8gfim0iksnmRJGQlgnWZ5uev1LF_U9zl--fj7erESM9g9mFso5gyOvJgzLIVhSyGf4jAJWSCnqdF9VaZUrHpgFjE-a2soqimJMVG0a269JV6VtsIZZe7n7cFD01c-0XffBim2YXQE4F0RSqPyW7CVuApCQ6ye-h';
  }
  if (name.includes('amazon')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDivvapzqUEdxgFYIP8YcR_XdhaGBUiVhWUYlRWL1f7GTIEzCDTcrhslfuAOPpqTsPG9pnYliAhb1NJBH14wVaMU3flfOg7eG_0wTReK7MKhmDmrZkltywwS89eYFh9X7rfwHTJUkusA45WNEmThTRZzvwaXmAMhziJ8c7X4LaQ7QI35gl63_lno6HA4s9hkdXNJbnPo92LDGj1bmd9C5TS3MAT5G_lPowYWHddBBssM_m9JL08SYtcUvbvcnBCe__FD66m63-ea0E';
  }
  if (name.includes('apple')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVWH0z031mk5Hg6zkW_6dilHIceQ5R2_kluBguZTHUGwF3zlxaFTfddNXLCGU4fq-5HhQzERqLTSWppsH8P3gwkRcRomlY6G2HlHRH1-eSUFBwev1K72CwsYP29EMlso3-lMD5IIMaUufMmZgAL5ySYTm2dIenwUujgmZIxQMPoLiD8iOOVTq_fkunOEnQpF5hcezeFTXHj8suptVRK_v2eLM9gf4WyvYCjlF_qkPpvOUxtowe7JAiZhPlJhmvgIfhVCMWg678j0nX';
  }
  if (name.includes('microsoft')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUxE12iCs8OTnM0CZ1B7cKGvRESuFWNfHnRJimNV_wmPl7Yc4RyNj2hJzpfae0pdfMnf3MR_neeacZQMuHYO6c-oddxesvRHI9kHNM098CNyEiDOKcsFZTdQ31CpaKRwKbMEu-ywS3yCMCbZVXdWeFdXa904H53Xc_OaGRCeX21BashoRxbmeq8xihK20xwSG-kRC7z4KvyMkxZJE8naIi7k8TIXEFzhGDOX8nr15DZQPUNKguVSI1GNisodEfOQWP1cjT3eT2qWTU';
  }
  return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=60';
};

// Helper to compute initials from company name safely
const getCompanyInitials = (companyName: string) => {
  if (!companyName) return 'CO';
  const parts = companyName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [apps, setApps] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState<string | null>(null);

  // Filter Tabs: All | Applied | Shortlisted | Interview | Offered | Rejected
  const [activeTab, setActiveTab] = useState<'All' | 'Applied' | 'Shortlisted' | 'Interview' | 'Offered' | 'Rejected'>('All');

  // Expanded card state dictionary
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Slide-out notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Profile completion percentage state
  const [profilePercent, setProfilePercent] = useState(72);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // Load applications
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/applications/student')
      .then((r) => r.json())
      .then((d: IApplication[]) => {
        setApps(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  // Load user profile for progress calculations
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          const u = data.user;
          let filled = 0;
          const total = 5;
          if (u.name) filled++;
          if (u.email) filled++;
          if (u.collegeName) filled++;
          if (u.graduationYear) filled++;
          if (u.currentYearOfStudy) filled++;
          const calculated = Math.round((filled / total) * 100);
          setProfilePercent(calculated);
        }
      })
      .catch(() => {});
  }, [status]);

  // Load notifications
  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const d = await res.json();
        setNotifications(Array.isArray(d) ? d : []);
      }
    } catch {}
  };

  useEffect(() => {
    if (status !== 'authenticated') return;
    void loadNotifications();
    const id = setInterval(() => { void loadNotifications(); }, 20000);
    return () => clearInterval(id);
  }, [status]);

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({}) });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ id }) });
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  // Close notifications on outside click (excluding the trigger and the drawer itself)
  useEffect(() => {
    const handleClose = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target) &&
        (!drawerRef.current || !drawerRef.current.contains(target))
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClose);
    return () => document.removeEventListener('mousedown', handleClose);
  }, []);

  const startChat = async (app: IApplication) => {
    const job = app.jobId as IJob;
    if (!job || typeof job === 'string') return;
    setChatLoading(app._id);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId: job.recruiterId, jobId: job._id }),
      });
      const data = await res.json() as { _id?: string };
      if (res.ok && data._id) router.push(`/chat/${data._id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(null);
    }
  };

  // Metric counts
  const totalCount = apps.length;
  const pendingCount = apps.filter((a) => a.status === 'pending' || a.status === 'reviewed').length;
  const interviewCount = apps.filter((a) => a.status === 'interview').length;
  const offeredCount = apps.filter((a) => a.status === 'selected').length;

  // Filter application array based on selected tab
  const filteredApps = apps.filter((app) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Applied') return app.status === 'pending';
    if (activeTab === 'Shortlisted') return app.status === 'reviewed';
    if (activeTab === 'Interview') return app.status === 'interview';
    if (activeTab === 'Offered') return app.status === 'selected';
    if (activeTab === 'Rejected') return app.status === 'rejected';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthenticatedLayout allowedRoles={['student']}>
      <div className="space-y-6">
        
        {/* ── TOP HEADER HEADER ── */}
        <header className="flex justify-between items-center select-none border-b border-surface-mid pb-4">
          <div>
            <h1 className="text-xl font-display font-extrabold text-text-primary tracking-tight">Student Dashboard</h1>
            <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider mt-0.5">Application logs &amp; metrics</p>
          </div>

          {/* Action alerts panel */}
          <div className="flex items-center gap-3 relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-slate-100 rounded-full transition-colors border border-surface-mid bg-white cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-amber text-[9px] text-white font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ── WELCOME BANNER WITH PROGRESS RING ── */}
        <section className="bg-white p-6 border border-surface-mid rounded-card-lg shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-all duration-200">
          <div className="space-y-3 flex-grow text-center md:text-left">
            <h2 className="text-2xl font-display font-extrabold text-text-primary tracking-tight">
              Good morning, {session?.user?.name?.split(' ')[0] || 'Applicant'} 👋
            </h2>
            <p className="text-xs text-text-secondary font-medium max-w-xl leading-relaxed">
              {totalCount === 0
                ? 'Welcome to BookMyIntern! Complete your credentials to start applying for top-tier Indian startups.'
                : `You have submitted ${totalCount} applications so far. Keep an eye on updates and reply to recruiter messages.`}
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1.5 justify-center md:justify-start">
              <Link href="/profile" className="decoration-none">
                <Button variant="primary" size="sm" className="font-bold text-xs shadow-sm">
                  Complete Profile
                </Button>
              </Link>
              <Link href="/jobs" className="decoration-none">
                <Button variant="outline" size="sm" className="font-bold text-xs">
                  Find Internships
                </Button>
              </Link>
            </div>
          </div>

          {/* Progress circle */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 select-none">
            <div
              className="w-18 h-18 rounded-full flex items-center justify-center relative shadow-sm"
              style={{
                background: `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#2563eb ${profilePercent}%, #f1f5f9 0)`
              }}
            >
              <span className="font-display font-extrabold text-sm text-primary">{profilePercent}%</span>
            </div>
            <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Profile Completed</span>
          </div>
        </section>

        {/* ── KPI METRICS CARDS ROW ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Applications"
            value={totalCount}
            icon={<span className="material-symbols-outlined text-[20px]">description</span>}
          />
          <KPICard
            title="Pending Review"
            value={pendingCount}
            icon={<span className="material-symbols-outlined text-[20px]">schedule</span>}
          />
          <KPICard
            title="Interviews"
            value={interviewCount}
            icon={<span className="material-symbols-outlined text-[20px]">forum</span>}
          />
          <KPICard
            title="Offers Received"
            value={offeredCount}
            icon={<span className="material-symbols-outlined text-[20px]">check_circle</span>}
          />
        </section>

        {/* ── APPLICATIONS SECTION ── */}
        <section className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
            <h3 className="text-base font-display font-extrabold text-text-primary uppercase tracking-wider">
              My Applications
            </h3>
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {(['All', 'Applied', 'Shortlisted', 'Interview', 'Offered', 'Rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition-all border border-transparent cursor-pointer ${
                    activeTab === tab
                      ? 'bg-primary text-white shadow-sm font-extrabold'
                      : 'bg-white hover:bg-slate-50 text-text-secondary border-surface-mid'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center border border-dashed border-surface-mid rounded-xl py-14 px-4 bg-white shadow-sm max-w-md mx-auto select-none">
              <span className="material-symbols-outlined text-4xl text-text-muted mb-2">find_in_page</span>
              <h4 className="font-extrabold text-text-secondary text-sm">No applications found</h4>
              <p className="text-xs text-text-muted font-medium mt-2 leading-relaxed">
                No roles match the active filter criteria. Clear filters or browse open listings.
              </p>
              <Link href="/jobs" className="inline-block mt-4 decoration-none">
                <Button variant="primary" size="sm" className="text-xs font-bold shadow-sm">
                  Browse Internships &rarr;
                </Button>
              </Link>
            </div>
          ) : (
            // Desktop Table / Mobile List
            <div className="bg-white border border-surface-mid rounded-xl overflow-hidden shadow-sm">
              
              {/* Desktop view table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold text-text-secondary">
                  <thead>
                    <tr className="bg-slate-50 border-b border-surface-mid text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      <th className="p-4 px-6">Company</th>
                      <th className="p-4">Job Title</th>
                      <th className="p-4">Applied Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApps.map((app) => {
                      const job = app.jobId as IJob | null;
                      if (!job || typeof job === 'string') return null;
                      
                      const canReview = TERMINAL.includes(app.status) || new Date(job.deadline) < new Date();
                      const isOpen = !!expanded[app._id];

                      return (
                        <Fragment key={app._id}>
                          <tr className={`hover:bg-slate-50/50 transition-colors ${isOpen ? 'bg-slate-50/20' : ''}`}>
                            <td className="p-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg border border-surface-mid bg-white flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm">
                                  <img src={getCompanyLogo(job.companyName)} className="w-6 h-6 object-contain" alt={job.companyName} />
                                </div>
                                <span className="font-extrabold text-text-primary">{job.companyName}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Link href={`/jobs/${job._id}`} className="font-extrabold text-text-primary hover:text-primary transition-colors decoration-none">
                                {job.title}
                              </Link>
                            </td>
                            <td className="p-4 font-mono text-text-muted">
                              {new Date(app.createdAt || '').toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <StatusBadge status={app.status} />
                            </td>
                            <td className="p-4 text-right pr-6 select-none">
                              <div className="flex gap-2 justify-end items-center">
                                <Button
                                  onClick={() => startChat(app)}
                                  disabled={chatLoading === app._id}
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs font-bold shrink-0"
                                >
                                  {chatLoading === app._id ? '...' : 'Message'}
                                </Button>
                                
                                {canReview && (
                                  <Link href={`/reviews/write?recruiterId=${job.recruiterId}&jobId=${job._id}`} className="decoration-none">
                                    <Button variant="ghost" size="sm" className="text-xs font-bold text-accent-indigo hover:bg-accent-indigo/5 shrink-0">
                                      Review
                                    </Button>
                                  </Link>
                                )}

                                <button
                                  onClick={() => toggleExpand(app._id)}
                                  className="p-1.5 border border-surface-mid rounded-lg text-text-muted hover:text-text-primary bg-transparent hover:bg-slate-50 cursor-pointer transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px] flex items-center justify-center">
                                    {isOpen ? 'expand_less' : 'expand_more'}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded detail row */}
                          {isOpen && (
                            <tr>
                              <td colSpan={5} className="p-6 bg-slate-50/40 border-b border-slate-100">
                                <div className="space-y-4 animate-fadeIn text-xs font-semibold text-text-secondary">
                                  
                                  {/* Info parameters */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-surface-mid shadow-sm">
                                    {app.phone && (
                                      <div>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Phone</p>
                                        <p className="text-text-primary font-extrabold mt-0.5">{app.phone}</p>
                                      </div>
                                    )}
                                    {app.yearsOfExperience && (
                                      <div>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Experience</p>
                                        <p className="text-text-primary font-extrabold mt-0.5">{app.yearsOfExperience} Years</p>
                                      </div>
                                    )}
                                    {app.education && (
                                      <div>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Education</p>
                                        <p className="text-text-primary font-extrabold mt-0.5">{app.education}</p>
                                      </div>
                                    )}
                                    {app.applicantSkills && (
                                      <div>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Skills Submitted</p>
                                        <p className="text-text-primary font-extrabold mt-0.5">{app.applicantSkills}</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Cover Letter */}
                                  {app.coverLetter && (
                                    <div className="space-y-1">
                                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Cover Letter Pitch</p>
                                      <p className="bg-white p-4 rounded-xl border border-surface-mid text-text-secondary font-medium leading-relaxed whitespace-pre-wrap">
                                        {app.coverLetter}
                                      </p>
                                    </div>
                                  )}

                                  {/* Resume path */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Resume Submitted:</span>
                                    {app.resumePath ? (
                                      <a
                                        href={app.resumePath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-surface-mid rounded-lg text-xs font-bold text-text-primary decoration-none transition-colors shadow-sm"
                                      >
                                        <span className="material-symbols-outlined text-[16px] text-text-muted">description</span>
                                        <span>{app.resumeFilename || 'View Resume'}</span>
                                      </a>
                                    ) : (
                                      <span className="italic text-text-muted text-xs">No file submitted</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile list view */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredApps.map((app) => {
                  const job = app.jobId as IJob | null;
                  if (!job || typeof job === 'string') return null;

                  const canReview = TERMINAL.includes(app.status) || new Date(job.deadline) < new Date();
                  const isOpen = !!expanded[app._id];

                  return (
                    <div key={app._id} className="p-4 space-y-3.5">
                      <div className="flex gap-3 justify-between items-start">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-lg border border-surface-mid bg-white flex items-center justify-center p-1 overflow-hidden shrink-0">
                            <img src={getCompanyLogo(job.companyName)} className="w-6 h-6 object-contain" alt={job.companyName} />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-text-primary leading-tight">
                              <Link href={`/jobs/${job._id}`} className="decoration-none text-inherit">{job.title}</Link>
                            </h4>
                            <p className="text-[10px] text-text-secondary mt-0.5">{job.companyName} &bull; {job.location}</p>
                          </div>
                        </div>

                        <StatusBadge status={app.status} className="shrink-0" />
                      </div>

                      <div className="flex justify-between items-center select-none pt-2 border-t border-slate-50">
                        <span className="text-[10px] text-text-muted font-mono">{new Date(app.createdAt || '').toLocaleDateString()}</span>
                        
                        <div className="flex items-center gap-1.5">
                          <Button
                            onClick={() => startChat(app)}
                            disabled={chatLoading === app._id}
                            variant="ghost"
                            size="sm"
                            className="py-1 text-xs font-bold"
                          >
                            Chat
                          </Button>
                          
                          {canReview && (
                            <Link href={`/reviews/write?recruiterId=${job.recruiterId}&jobId=${job._id}`} className="decoration-none">
                              <Button variant="ghost" size="sm" className="py-1 text-xs text-accent-indigo font-bold">
                                Review
                              </Button>
                            </Link>
                          )}

                          <button
                            onClick={() => toggleExpand(app._id)}
                            className="p-1 border border-surface-mid rounded-lg text-text-muted hover:text-text-primary bg-transparent hover:bg-slate-50 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px] flex items-center justify-center">
                              {isOpen ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="pt-3 border-t border-dashed border-slate-100 space-y-3 animate-fadeIn text-[11px] font-semibold text-text-secondary">
                          <div className="bg-slate-50 p-3 rounded-lg space-y-1.5 border border-surface-mid">
                            {app.phone && <p><strong>Phone:</strong> {app.phone}</p>}
                            {app.education && <p><strong>Education:</strong> {app.education}</p>}
                            {app.yearsOfExperience && <p><strong>Experience:</strong> {app.yearsOfExperience} Years</p>}
                            {app.applicantSkills && <p><strong>Skills:</strong> {app.applicantSkills}</p>}
                          </div>
                          {app.coverLetter && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-text-muted font-bold uppercase">Cover Letter</p>
                              <p className="bg-white p-3 rounded-lg border border-surface-mid text-xs font-medium leading-relaxed whitespace-pre-wrap">{app.coverLetter}</p>
                            </div>
                          )}
                          {app.resumePath && (
                            <a
                              href={app.resumePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-surface-mid rounded-lg text-xs font-bold text-text-primary decoration-none"
                            >
                              <span className="material-symbols-outlined text-sm">description</span>
                              <span>View Resume</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </section>

        {/* ── SLIDE-OUT NOTIFICATIONS DRAWER ── */}
        {showNotifications && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-black/35 z-40 transition-opacity duration-300 animate-fadeIn"
              onClick={() => setShowNotifications(false)}
            />

            {/* Drawer Sheet */}
            <div
              ref={drawerRef}
              className="fixed top-0 right-0 h-full w-[320px] bg-white border-l border-surface-mid shadow-2xl z-50 transform transition-transform duration-300 translate-x-0 p-5 flex flex-col animate-slideLeft select-none"
            >
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="text-sm font-display font-extrabold text-text-primary uppercase tracking-wider">
                  Notifications
                </h3>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-primary hover:underline border-none bg-transparent cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Scroll list */}
              <div className="flex-grow overflow-y-auto py-4 space-y-3.5 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center text-text-muted text-xs py-8 font-medium">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3 rounded-xl transition-all cursor-pointer border ${
                        n.read
                          ? 'bg-white border-surface-mid hover:bg-slate-50'
                          : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-extrabold text-xs text-text-primary leading-tight">
                          {n.title}
                        </span>
                        <span className="text-[9px] text-text-muted font-bold whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary mt-1 leading-normal font-semibold">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-slate-100">
                <Button
                  onClick={() => setShowNotifications(false)}
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs font-bold py-2"
                >
                  Close Drawer
                </Button>
              </div>
            </div>
          </>
        )}

      </div>
    </AuthenticatedLayout>
  );
}
