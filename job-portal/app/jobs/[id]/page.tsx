'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ApplyModal from '@/components/ApplyModal';
import Button from '@/components/ui/Button';
import type { IJob, IApplication } from '@/types';

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

export default function JobDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [job, setJob] = useState<IJob | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flashMsg, setFlashMsg] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Similar Jobs list
  const [similarJobs, setSimilarJobs] = useState<IJob[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Load job details
  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((d: IJob & { error?: string }) => {
        if (d.error) {
          setNotFound(true);
        } else {
          setJob(d);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  // Check if student applied
  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'student') return;
    fetch('/api/applications/student')
      .then((r) => r.json())
      .then((d: IApplication[]) => {
        if (Array.isArray(d)) {
          setApplied(d.some((a) => (typeof a.jobId === 'object' ? a.jobId._id : a.jobId) === id));
        }
      })
      .catch(() => {});
  }, [status, session, id]);

  // Load similar opportunities
  useEffect(() => {
    if (!job) return;
    fetch('/api/jobs')
      .then((r) => r.json())
      .then((d: IJob[] | { jobs: IJob[] }) => {
        const list = Array.isArray(d) ? d : (d && Array.isArray(d.jobs) ? d.jobs : []);
        const currentSkills = new Set(job.skills?.map((s) => s.toLowerCase()) || []);
        const matched = list
          .filter((j) => j._id !== job._id)
          .map((j) => {
            const score = j.skills?.filter((s) => currentSkills.has(s.toLowerCase())).length || 0;
            return { job: j, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((x) => x.job);
        setSimilarJobs(matched);
      })
      .catch(() => {});
  }, [job]);

  const handleApplyClick = () => {
    if (!session) {
      router.push(`/login?callbackUrl=/jobs/${id}`);
      return;
    }
    setShowModal(true);
  };

  const handleApplySuccess = () => {
    setApplied(true);
    setShowModal(false);
    setFlashMsg('Application submitted successfully! 🎉');
    setTimeout(() => setFlashMsg(''), 4000);
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-light flex flex-col items-center justify-center gap-3.5 select-none">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-text-muted text-xs font-semibold">Loading details…</p>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen bg-surface-light flex flex-col items-center justify-center p-8 select-none">
        <div className="w-14 h-14 rounded-full bg-accent-rose/10 text-accent-rose flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-2xl">error</span>
        </div>
        <p className="text-sm font-extrabold text-text-primary">Opportunity Not Found</p>
        <Link href="/jobs" className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Listings
        </Link>
      </div>
    );
  }

  const expired = new Date(job.deadline) < new Date();
  const isStudent = session?.user?.role === 'student';

  const getEmploymentType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time': return 'FULL_TIME';
      case 'part-time': return 'PART_TIME';
      case 'internship': return 'INTERN';
      case 'contract': return 'CONTRACT';
      default: return 'FULL_TIME';
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': job.title,
    'description': job.description,
    'datePosted': job.createdAt || new Date().toISOString(),
    'validThrough': job.deadline,
    'employmentType': getEmploymentType(job.jobType),
    'hiringOrganization': {
      '@type': 'Organization',
      'name': job.companyName,
    },
    'jobLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': job.location,
        'addressCountry': 'IN',
      }
    },
    ...(job.jobType === 'internship' && job.stipendAmount ? {
      'baseSalary': {
        '@type': 'MonetaryAmount',
        'currency': 'INR',
        'value': {
          '@type': 'QuantitativeValue',
          'value': job.stipendAmount,
          'unitText': 'MONTH',
        }
      }
    } : {})
  };

  return (
    <div className="bg-surface-light min-h-screen antialiased text-text-primary pt-24 pb-16 px-4 md:px-8 font-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[900px] mx-auto space-y-6">
        
        {/* ── BREADCRUMB TRAIL ── */}
        <nav className="flex items-center gap-1.5 text-xs text-text-muted font-semibold select-none">
          <Link href="/jobs" className="hover:text-primary transition-colors decoration-none">Browse Jobs</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span>{job.companyName}</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-text-secondary">{job.title}</span>
        </nav>

        {flashMsg && (
          <div className="bg-accent-teal/10 text-accent-teal border border-accent-teal/20 text-xs font-semibold rounded-xl py-3 px-4 flex items-center gap-2 animate-pulse select-none">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{flashMsg}</span>
          </div>
        )}

        {/* ── TOP card INFORMATION HEADER ── */}
        <div className="bg-white border border-surface-mid rounded-card-lg shadow-sm p-8 relative flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          
          <div className="flex gap-4 items-center">
            {/* Logo */}
            <div className="w-16 h-16 rounded-full bg-white border border-surface-mid flex items-center justify-center p-2 shadow-sm relative shrink-0 select-none">
              <img
                alt={job.companyName}
                src={getCompanyLogo(job.companyName)}
                className="w-10 h-10 object-contain rounded-full"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent-teal text-white flex items-center justify-center border-2 border-white select-none">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-display font-extrabold tracking-tight text-text-primary leading-tight">
                {job.title}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-primary select-none">
                <span>{job.companyName}</span>
                <span className="text-slate-300 font-normal">&bull;</span>
                <a href="#" className="inline-flex items-center gap-0.5 text-text-secondary hover:text-primary transition-colors decoration-none">
                  website
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </div>
            </div>
          </div>

          {/* Action trigger panel */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 select-none">
            <button
              onClick={toggleSave}
              className={`p-2.5 rounded-lg border hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer bg-white shrink-0 ${
                isSaved ? 'text-accent-rose border-accent-rose/25 bg-accent-rose/5' : 'text-text-muted border-surface-mid'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
              >
                bookmark
              </span>
            </button>

            {!session && (
              <Button onClick={handleApplyClick} variant="primary" size="lg" className="w-full md:w-auto text-xs font-bold py-2.5">
                Sign in to Apply
              </Button>
            )}

            {isStudent && (
              applied ? (
                <span className="w-full md:w-auto text-center px-6 py-2.5 bg-accent-teal/10 text-accent-teal border border-accent-teal/20 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 font-sans">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Applied Successfully
                </span>
              ) : (
                <Button
                  onClick={handleApplyClick}
                  disabled={expired}
                  variant={expired ? 'secondary' : 'primary'}
                  size="lg"
                  className="w-full md:w-auto text-xs font-bold py-2.5"
                >
                  {expired ? 'Applications Closed' : 'Apply Now'}
                </Button>
              )
            )}

            {!isStudent && session && (
              <span className="text-xs font-bold text-text-muted italic px-2">Recruiters cannot apply</span>
            )}
          </div>
        </div>

        {/* Meta details horizontal strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 bg-white border border-surface-mid p-5 rounded-xl shadow-sm text-xs font-semibold text-text-secondary select-none">
          <div className="space-y-1">
            <span className="text-[10px] text-text-muted font-bold uppercase">Location</span>
            <p className="text-xs font-extrabold text-text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
              {job.location}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-text-muted font-bold uppercase">Employment Type</span>
            <p className="text-xs font-extrabold text-text-primary flex items-center gap-1 capitalize">
              <span className="material-symbols-outlined text-[16px] text-primary">work</span>
              {job.jobType}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-text-muted font-bold uppercase">Salary / Stipend</span>
            <p className="text-xs font-extrabold text-accent-teal flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-[16px] text-accent-teal">payments</span>
              {job.jobType === 'internship'
                ? (job.stipendAmount && job.stipendAmount > 0 ? `₹${job.stipendAmount.toLocaleString()}/mo` : 'Unpaid')
                : (job.salary || 'Competitive')}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-text-muted font-bold uppercase">Duration</span>
            <p className="text-xs font-extrabold text-text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
              {job.jobType === 'internship' ? `${job.durationWeeks || 0} Weeks` : 'N/A'}
            </p>
          </div>
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-text-muted font-bold uppercase">Deadline</span>
            <p className={`text-xs font-extrabold flex items-center gap-1 ${expired ? 'text-accent-rose' : 'text-accent-amber'}`}>
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              {new Date(job.deadline).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* ── MAIN CONTENT: 2-COLUMN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6 items-start">
          
          {/* Left: Content panel */}
          <div className="bg-white border border-surface-mid rounded-xl p-8 shadow-sm space-y-6">
            
            {/* Description */}
            <div className="space-y-2.5">
              <h2 className="text-sm font-display font-extrabold text-text-primary uppercase tracking-wider">
                About the role
              </h2>
              <p className="text-xs leading-relaxed text-text-secondary whitespace-pre-wrap font-medium">
                {job.description}
              </p>
            </div>

            {/* Simulated bullet points for what you will do */}
            <div className="space-y-3 pt-2">
              <h2 className="text-sm font-display font-extrabold text-text-primary uppercase tracking-wider">
                What you'll do
              </h2>
              <ul className="space-y-2.5 list-none text-xs text-text-secondary font-semibold">
                {[
                  'Collaborate with team members to conceptualize, design, and implement technical solutions.',
                  'Test and validate program deliverables to ensure performance compatibility and security standards.',
                  'Troubleshoot codebase issues and implement optimization improvements.'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-accent-teal mt-1.5 shrink-0" />
                    <span className="leading-normal">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Who we are looking for (Eligibility) */}
            {job.eligibility && (
              <div className="space-y-2.5 pt-2">
                <h2 className="text-sm font-display font-extrabold text-text-primary uppercase tracking-wider">
                  Who we're looking for
                </h2>
                <p className="text-xs leading-relaxed text-text-secondary whitespace-pre-wrap font-medium">
                  {job.eligibility}
                </p>
              </div>
            )}

            {/* Required Skills tags */}
            {job.skills && job.skills.length > 0 && (
              <div className="space-y-3 pt-2 select-none">
                <h2 className="text-sm font-display font-extrabold text-text-primary uppercase tracking-wider">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary text-[10px] rounded-full font-bold uppercase tracking-wider"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sticky company info & similar jobs */}
          <aside className="space-y-6 lg:sticky lg:top-[162px]">
            
            {/* Company detail card */}
            <div className="bg-white border border-surface-mid rounded-xl p-5 shadow-sm space-y-4 text-xs font-semibold text-text-secondary">
              <h3 className="text-xs font-display font-extrabold text-text-primary uppercase tracking-wider border-b border-slate-100 pb-2">
                Company Profile
              </h3>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border border-surface-mid flex items-center justify-center p-1 overflow-hidden shrink-0 bg-white">
                  <img src={getCompanyLogo(job.companyName)} className="w-7 h-7 object-contain" alt={job.companyName} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-text-primary leading-tight">{job.companyName}</h4>
                  <p className="text-[10px] text-text-muted mt-0.5 font-bold uppercase">Tech startup</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-text-secondary">
                <div className="flex justify-between">
                  <span className="text-text-muted font-medium">Industry</span>
                  <span className="font-extrabold text-text-primary">Software Development</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-medium">Company Size</span>
                  <span className="font-extrabold text-text-primary">50 - 200 Employees</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-medium">Location</span>
                  <span className="font-extrabold text-text-primary">{job.location}</span>
                </div>
              </div>
            </div>

            {/* Similar opportunities */}
            {similarJobs.length > 0 && (
              <div className="bg-white border border-surface-mid rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-display font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span className="material-symbols-outlined text-sm text-primary">workspaces</span>
                  Similar Roles
                </h3>
                
                <div className="space-y-3">
                  {similarJobs.map((sj) => (
                    <div
                      key={sj._id}
                      onClick={() => router.push(`/jobs/${sj._id}`)}
                      className="group border border-slate-100/50 hover:border-primary/20 hover:shadow-sm rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="font-extrabold text-xs text-text-primary group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                          {sj.title}
                        </h4>
                        <p className="text-[10px] text-text-secondary font-semibold mt-0.5 truncate">{sj.companyName}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 select-none">
                        <span className="text-[8px] font-extrabold text-accent-indigo uppercase tracking-wider">{sj.jobType}</span>
                        <span className="text-[9px] font-extrabold text-accent-teal font-mono">
                          {sj.jobType === 'internship' && sj.stipendAmount
                            ? `₹${sj.stipendAmount.toLocaleString()}`
                            : 'Competitive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

        </div>

      </div>

      {showModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowModal(false)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}
