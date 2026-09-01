'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ApplyModal from '@/components/ApplyModal';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
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

// Helper to compute initials from company name safely
const getCompanyInitials = (companyName: string) => {
  if (!companyName) return 'CO';
  const parts = companyName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function JobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [allJobs, setAllJobs] = useState<IJob[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Search terms (Debounced backend fetch)
  const [searchVal, setSearchVal] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // UI Filter Checklist states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [stipendLimit, setStipendLimit] = useState<number>(50000);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedPerks, setSelectedPerks] = useState<string[]>([]);

  // Sorting
  const [sortBy, setSortBy] = useState('Relevance');

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // Toggle for Industry list expansion
  const [showAllIndustries, setShowAllIndustries] = useState(false);

  const [loading, setLoading] = useState(true);
  const [flashMsg, setFlashMsg] = useState('');

  // Selection drawers
  const [applyJob, setApplyJob] = useState<IJob | null>(null);
  const [detailJob, setDetailJob] = useState<IJob | null>(null);

  // Sync search inputs from URL query parameters if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      const locParam = params.get('location');
      if (roleParam) {
        setSearchVal(roleParam);
        setSearchRole(roleParam);
      }
      if (locParam) {
        setSearchLocation(locParam);
      }
    }
  }, []);

  // Debounce searchVal -> searchRole
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchRole(searchVal);
      setPage(1); // reset page on search
    }, 455);
    return () => clearTimeout(timer);
  }, [searchVal]);

  // Load all matching jobs from backend (unpaginated on server, filtered/paginated on client)
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      search: searchRole,
      location: searchLocation,
    });

    fetch(`/api/jobs?${params.toString()}`)
      .then((r) => r.json())
      .then((data: IJob[] | { jobs: IJob[] }) => {
        const list = Array.isArray(data) ? data : (data && Array.isArray(data.jobs) ? data.jobs : []);
        setAllJobs(list);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [searchRole, searchLocation]);

  // Load applied IDs for logged-in students
  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'student') return;
    fetch('/api/applications/student')
      .then((r) => r.json())
      .then((d: IApplication[]) => {
        if (Array.isArray(d)) {
          setAppliedIds(new Set(d.map((a) => (typeof a.jobId === 'object' ? a.jobId._id : a.jobId))));
        }
      })
      .catch(() => {});
  }, [status, session]);

  // Client-Side Filters application
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      // 1. Job Type
      if (selectedTypes.length > 0) {
        if (!selectedTypes.includes(job.jobType?.toLowerCase())) return false;
      }

      // 2. Location (Remote, On-site, Hybrid)
      if (selectedLocations.length > 0) {
        const jobLoc = job.location?.toLowerCase() || '';
        const matches = selectedLocations.some((loc) => {
          if (loc === 'remote') return jobLoc.includes('remote');
          if (loc === 'on-site') return !jobLoc.includes('remote') && !jobLoc.includes('hybrid');
          if (loc === 'hybrid') return jobLoc.includes('hybrid');
          return false;
        });
        if (!matches) return false;
      }

      // 3. Stipend limit (Only applies to internships with stipendAmount)
      if (job.jobType === 'internship') {
        const amount = job.stipendAmount || 0;
        if (amount > stipendLimit) return false;
      }

      // 4. Duration limit
      if (selectedDurations.length > 0 && job.jobType === 'internship') {
        const weeks = job.durationWeeks || 0;
        const matches = selectedDurations.some((dur) => {
          if (dur === '1-month') return weeks <= 4;
          if (dur === '2-3-months') return weeks > 4 && weeks <= 12;
          if (dur === '6-months') return weeks > 12 && weeks <= 24;
          if (dur === '1-year') return weeks > 24;
          return false;
        });
        if (!matches) return false;
      }

      // 5. Perks
      if (selectedPerks.length > 0) {
        const matches = selectedPerks.every((perk) => {
          if (perk === 'ppo') return !!job.ppoPossibility;
          if (perk === 'cert') return !!job.internCertificate;
          return true;
        });
        if (!matches) return false;
      }

      return true;
    });
  }, [allJobs, selectedTypes, selectedLocations, stipendLimit, selectedDurations, selectedPerks]);

  // Client-Side Sorting
  const sortedJobs = useMemo(() => {
    const list = [...filteredJobs];
    if (sortBy === 'Newest') {
      return list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    }
    // Default or Relevance
    return list;
  }, [filteredJobs, sortBy]);

  // Client-Side Pagination Slices
  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return sortedJobs.slice(start, start + itemsPerPage);
  }, [sortedJobs, page]);

  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);

  const handleApply = (job: IJob) => {
    if (!session) {
      router.push(`/login?callbackUrl=/jobs`);
      return;
    }
    setApplyJob(job);
  };

  const handleApplySuccess = (jobId: string) => {
    setAppliedIds((prev) => new Set([...prev, jobId]));
    setApplyJob(null);
    setFlashMsg('Application submitted successfully!');
    setTimeout(() => setFlashMsg(''), 4000);
  };

  const toggleSave = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setList((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchVal('');
    setSearchRole('');
    setSearchLocation('');
    setSelectedTypes([]);
    setSelectedLocations([]);
    setStipendLimit(50000);
    setSelectedDurations([]);
    setSelectedPerks([]);
    setPage(1);
  };

  // Helper to compute deadline remaining
  const getDeadlineCountdown = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    if (diffMs <= 0) return 'Expired';
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays >= 1) {
      return `Ends in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
    return 'Ends soon';
  };

  // Helper to fetch similar jobs based on skills overlap
  const getSimilarJobs = (currentJob: IJob) => {
    if (!allJobs || allJobs.length <= 1) return [];
    const currentSkills = new Set(currentJob.skills?.map((s) => s.toLowerCase()) || []);
    return allJobs
      .filter((j) => j._id !== currentJob._id)
      .map((j) => {
        const matches = j.skills?.filter((s) => currentSkills.has(s.toLowerCase())).length || 0;
        return { job: j, matches };
      })
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 3)
      .map((x) => x.job);
  };

  // Industries list mockup
  const industries = ['Technology', 'Finance', 'Design', 'Marketing', 'Healthcare', 'HR', 'Content', 'Operations'];
  const visibleIndustries = showAllIndustries ? industries : industries.slice(0, 5);

  return (
    <div className="bg-surface-light text-text-primary min-h-screen antialiased flex flex-col font-body">

      {/* 1. COMPACT STICKY SEARCH SUBHEADER */}
      <section className="sticky top-16 z-30 bg-white border-b border-surface-mid shadow-sm py-3 px-6 select-none">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-3">

          <form className="flex flex-col md:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
            {/* Search input */}
            <div className="flex-grow flex items-center gap-2.5 px-3 py-2 bg-surface-light border border-surface-mid rounded-lg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
              <span className="material-symbols-outlined text-text-muted text-lg">search</span>
              <input
                type="text"
                placeholder="Search job title, keywords or company..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-text-primary w-full placeholder:text-text-muted font-medium"
              />
            </div>

            {/* Location Filter Input */}
            <div className="md:w-64 flex items-center gap-2.5 px-3 py-2 bg-surface-light border border-surface-mid rounded-lg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
              <span className="material-symbols-outlined text-text-muted text-lg">location_on</span>
              <input
                type="text"
                placeholder="City or Remote"
                value={searchLocation}
                onChange={(e) => {
                  setSearchLocation(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none outline-none text-xs text-text-primary w-full placeholder:text-text-muted font-medium"
              />
            </div>

            {/* Search triggers clear search natively */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs shrink-0"
            >
              Reset Filters
            </Button>
          </form>

          {/* Active Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-text-muted font-semibold mr-1">Active Filters:</span>
            {selectedTypes.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary border border-primary/15 rounded-full font-bold uppercase tracking-wider text-[9px]">
                {t}
                <button onClick={() => toggleFilter(selectedTypes, setSelectedTypes, t)} className="text-primary hover:text-primary-dark cursor-pointer text-[10px] leading-none border-none bg-transparent">X</button>
              </span>
            ))}
            {selectedLocations.map((l) => (
              <span key={l} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/15 rounded-full font-bold uppercase tracking-wider text-[9px]">
                {l}
                <button onClick={() => toggleFilter(selectedLocations, setSelectedLocations, l)} className="text-accent-indigo hover:text-indigo-800 cursor-pointer text-[10px] leading-none border-none bg-transparent">X</button>
              </span>
            ))}
            {stipendLimit < 50000 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent-teal/10 text-accent-teal border border-accent-teal/15 rounded-full font-bold uppercase tracking-wider text-[9px]">
                {'<'} Rs.{stipendLimit.toLocaleString()}
                <button onClick={() => setStipendLimit(50000)} className="text-accent-teal hover:text-teal-800 cursor-pointer text-[10px] leading-none border-none bg-transparent">X</button>
              </span>
            )}
            {selectedTypes.length === 0 && selectedLocations.length === 0 && stipendLimit === 50000 && (
              <span className="text-text-muted italic text-[11px] font-medium">None active</span>
            )}
          </div>

        </div>
      </section>

      {/* 2. TWO COLUMN CONTENT CONTAINER */}
      <div className="max-w-[1280px] mx-auto w-full px-6 py-8 flex flex-col lg:flex-row gap-6 relative flex-grow">

        {/* Left Filter Panel (280px wide) */}
        <aside className="w-full lg:w-[280px] shrink-0 self-start sticky top-[162px] z-20 space-y-6">
          <div className="bg-white border border-surface-mid rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-display font-extrabold text-text-primary uppercase tracking-wider">Filters</h3>
              <button onClick={clearAllFilters} className="text-[11px] font-bold text-primary hover:underline border-none bg-transparent cursor-pointer">
                Clear All
              </button>
            </div>

            {/* Job Type Checkbox Group */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Job Type</h4>
              <div className="space-y-1.5 text-xs font-semibold text-text-secondary">
                {['Internship', 'Full-time', 'Part-time', 'Contract'].map((type) => {
                  const val = type.toLowerCase();
                  return (
                    <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(val)}
                        onChange={() => toggleFilter(selectedTypes, setSelectedTypes, val)}
                        className="rounded border-surface-mid text-primary focus:ring-primary/20 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Location Checkbox Group */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Location</h4>
              <div className="space-y-1.5 text-xs font-semibold text-text-secondary">
                {['Remote', 'On-site', 'Hybrid'].map((loc) => {
                  const val = loc.toLowerCase();
                  return (
                    <label key={loc} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(val)}
                        onChange={() => toggleFilter(selectedLocations, setSelectedLocations, val)}
                        className="rounded border-surface-mid text-primary focus:ring-primary/20 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{loc}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Stipend Range Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                <span>Max Stipend</span>
                <span className="text-primary font-mono lowercase">Rs.{stipendLimit.toLocaleString()}/mo</span>
              </div>
              <input
                type="range"
                min={0}
                max={50000}
                step={2000}
                value={stipendLimit}
                onChange={(e) => {
                  setStipendLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Duration Checkboxes */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Duration</h4>
              <div className="space-y-1.5 text-xs font-semibold text-text-secondary">
                {[
                  { label: '1 Month', val: '1-month' },
                  { label: '2-3 Months', val: '2-3-months' },
                  { label: '6 Months', val: '6-months' },
                  { label: '1 Year+', val: '1-year' },
                ].map((dur) => (
                  <label key={dur.val} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedDurations.includes(dur.val)}
                      onChange={() => toggleFilter(selectedDurations, setSelectedDurations, dur.val)}
                      className="rounded border-surface-mid text-primary focus:ring-primary/20 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{dur.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Industry Expandable Checkboxes */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Industry</h4>
              <div className="space-y-1.5 text-xs font-semibold text-text-secondary">
                {visibleIndustries.map((ind) => (
                  <label key={ind} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedIndustries.includes(ind)}
                      onChange={() => toggleFilter(selectedIndustries, setSelectedIndustries, ind)}
                      className="rounded border-surface-mid text-primary focus:ring-primary/20 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{ind}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={() => setShowAllIndustries(!showAllIndustries)}
                className="text-[10px] font-bold text-primary hover:underline border-none bg-transparent cursor-pointer mt-1 flex items-center gap-0.5"
              >
                {showAllIndustries ? 'Show Less' : `+ ${industries.length - 5} More`}
              </button>
            </div>

            {/* Perks Checkboxes */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Perks</h4>
              <div className="space-y-1.5 text-xs font-semibold text-text-secondary">
                {[
                  { label: 'PPO Available', val: 'ppo' },
                  { label: 'Certificate Issued', val: 'cert' },
                ].map((perk) => (
                  <label key={perk.val} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedPerks.includes(perk.val)}
                      onChange={() => toggleFilter(selectedPerks, setSelectedPerks, perk.val)}
                      className="rounded border-surface-mid text-primary focus:ring-primary/20 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{perk.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Listings Column */}
        <main className="flex-grow space-y-4">

          {/* Flash notifications */}
          {flashMsg && (
            <div className="bg-accent-teal/10 text-accent-teal border border-accent-teal/20 text-xs font-semibold rounded-xl py-3 px-4 flex items-center gap-2 animate-pulse select-none">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{flashMsg}</span>
            </div>
          )}

          {/* Sort bar info */}
          <div className="flex justify-between items-center select-none bg-white border border-surface-mid p-3.5 rounded-xl shadow-sm text-xs">
            <span className="font-semibold text-text-secondary">
              <strong className="text-text-primary">{sortedJobs.length}</strong> opportunities found
            </span>
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-text-muted">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-bold text-primary cursor-pointer"
              >
                <option value="Relevance">Relevance</option>
                <option value="Newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Jobs Listings Container */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="bg-white border border-surface-mid p-6 rounded-xl animate-pulse space-y-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                    <div className="flex-grow space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : sortedJobs.length === 0 ? (
            <div className="text-center border border-dashed border-surface-mid rounded-xl py-16 px-4 bg-white shadow-sm max-w-md mx-auto select-none">
              <span className="material-symbols-outlined text-4xl text-text-muted mb-2">work_off</span>
              <h4 className="font-extrabold text-text-secondary text-sm">No matches found</h4>
              <p className="text-xs text-text-muted font-medium mt-2 leading-relaxed">
                Try widening your stipend limit, clearing checklist filters, or typing standard keywords.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {paginatedJobs.map((job) => {
                const isApplied = appliedIds.has(job._id);
                const isSaved = savedIds.has(job._id);
                const countdown = getDeadlineCountdown(job.deadline);
                const isSelected = detailJob?._id === job._id;

                return (
                  <div
                    key={job._id}
                    className={`group bg-white p-5 rounded-xl border transition-all duration-200 flex flex-col md:flex-row gap-5 items-start md:items-center relative ${
                      isSelected
                        ? 'border-primary shadow-blue pl-4 border-l-4'
                        : 'border-surface-mid hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-sm'
                    }`}
                  >
                    {/* Left: Company Logo */}
                    <div className="w-12 h-12 rounded-xl bg-white border border-surface-mid shadow-sm flex items-center justify-center overflow-hidden shrink-0 select-none">
                      <img
                        alt={job.companyName}
                        className="w-8 h-8 object-contain"
                        src={getCompanyLogo(job.companyName)}
                        onError={(e) => {
                          // Fail-safe image replace
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120';
                        }}
                      />
                    </div>

                    {/* Middle: Details */}
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1 select-none">
                        <h4
                          onClick={() => setDetailJob(job)}
                          className="font-extrabold text-sm md:text-base text-text-primary group-hover:text-primary transition-colors cursor-pointer truncate"
                        >
                          {job.title}
                        </h4>

                        {isApplied && (
                          <span className="px-2 py-0.5 rounded-full bg-accent-teal/10 text-accent-teal font-bold text-[9px] uppercase tracking-wider select-none">
                            Applied
                          </span>
                        )}

                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          countdown === 'Expired'
                            ? 'bg-accent-rose/10 text-accent-rose'
                            : 'bg-accent-amber/10 text-accent-amber'
                        }`}>
                          {countdown}
                        </span>
                      </div>

                      <p className="flex items-center flex-wrap gap-2 text-xs font-semibold text-text-secondary select-none">
                        <span className="text-text-primary font-bold">{job.companyName}</span>
                        {/* Verified badge */}
                        <span className="material-symbols-outlined text-[15px] text-accent-teal" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span>{job.location}</span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="capitalize text-primary font-bold">{job.jobType}</span>
                      </p>

                      {/* Skill tags */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 select-none">
                          {job.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 bg-surface-light border border-surface-mid text-text-secondary text-[9px] rounded font-bold uppercase tracking-wider"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="text-[10px] text-text-muted font-bold self-center">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Metrics & Actions */}
                    <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 border-slate-100 pt-3.5 md:pt-0">

                      {/* Stipend representation */}
                      <div className="text-left md:text-right select-none">
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Salary / Stipend</p>
                        <p className="text-sm font-extrabold text-accent-teal font-mono mt-0.5">
                          {job.jobType === 'internship'
                            ? (job.stipendAmount && job.stipendAmount > 0 ? `Rs.${job.stipendAmount.toLocaleString()}/mo` : 'Unpaid')
                            : (job.salary || 'Competitive')}
                        </p>
                      </div>

                      {/* Option labels */}
                      <div className="hidden lg:flex items-center gap-2 text-[9px] font-bold text-text-secondary select-none uppercase">
                        {job.ppoPossibility && <span className="text-accent-indigo">PPO</span>}
                        {job.internCertificate && <span className="text-primary">Cert</span>}
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center gap-2 select-none w-full sm:w-auto">
                        <Button
                          onClick={() => setDetailJob(job)}
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-xs"
                        >
                          View Details
                        </Button>

                        <button
                          onClick={(e) => toggleSave(job._id, e)}
                          className={`p-1.5 rounded-lg border hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer bg-transparent shrink-0 ${
                            isSaved
                              ? 'text-accent-rose border-accent-rose/20 bg-accent-rose/5'
                              : 'text-text-muted border-surface-mid'
                          }`}
                        >
                          <span
                            className="material-symbols-outlined text-[18px]"
                            style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            bookmark
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="pt-6 flex justify-center items-center gap-2 select-none">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-surface-mid bg-white text-text-secondary flex items-center justify-center hover:bg-slate-50 hover:text-text-primary disabled:opacity-50 transition-colors cursor-pointer outline-none"
              >
                <span className="material-symbols-outlined text-sm font-bold">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all cursor-pointer outline-none ${
                    page === num
                      ? 'bg-primary border-primary text-white shadow-sm'
                      : 'bg-white border-surface-mid text-text-secondary hover:bg-slate-50'
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-surface-mid bg-white text-text-secondary flex items-center justify-center hover:bg-slate-50 hover:text-text-primary disabled:opacity-50 transition-colors cursor-pointer outline-none"
              >
                <span className="material-symbols-outlined text-sm font-bold">chevron_right</span>
              </button>
            </div>
          )}

        </main>
      </div>

      {/* 3. DRAWER SLIDE-OUT PANEL (ON CLICK VIEW DETAILS) */}
      {detailJob && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/35 z-40 transition-opacity duration-300 animate-fadeIn"
            onClick={() => setDetailJob(null)}
          />

          {/* Drawer sheet container */}
          <div className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 translate-x-0 flex flex-col animate-slideLeft select-none">

            {/* Header: Brand & Details */}
            <div className="p-6 border-b border-surface-mid relative flex-shrink-0">
              <button
                onClick={() => setDetailJob(null)}
                className="absolute right-6 top-6 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-text-secondary flex items-center justify-center transition-colors border border-surface-mid cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>

              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-xl border border-surface-mid flex items-center justify-center overflow-hidden shrink-0 bg-white shadow-sm">
                  <img
                    alt={detailJob.companyName}
                    src={getCompanyLogo(detailJob.companyName)}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-text-primary leading-tight">{detailJob.title}</h3>
                  <p className="text-xs font-bold text-primary flex items-center gap-1 mt-1">
                    <span>{detailJob.companyName}</span>
                    <span className="material-symbols-outlined text-[15px] text-accent-teal" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable specs body */}
            <div className="p-6 flex-grow overflow-y-auto space-y-6 custom-scrollbar text-xs font-semibold text-text-secondary">

              {/* Badges overview */}
              <div className="grid grid-cols-2 gap-3.5 bg-surface-light border border-surface-mid p-4 rounded-xl">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted font-bold uppercase">Location</span>
                  <p className="text-xs font-extrabold text-text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[16px]">location_on</span>
                    {detailJob.location}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted font-bold uppercase">Job Type</span>
                  <p className="text-xs font-extrabold text-text-primary flex items-center gap-1 capitalize">
                    <span className="material-symbols-outlined text-primary text-[16px]">business_center</span>
                    {detailJob.jobType}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted font-bold uppercase">Stipend / Salary</span>
                  <p className="text-xs font-extrabold text-accent-teal flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-accent-teal text-[16px]">payments</span>
                    {detailJob.jobType === 'internship'
                      ? (detailJob.stipendAmount && detailJob.stipendAmount > 0 ? `Rs.${detailJob.stipendAmount.toLocaleString()}/mo` : 'Unpaid')
                      : (detailJob.salary || 'Competitive')}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted font-bold uppercase">Duration</span>
                  <p className="text-xs font-extrabold text-text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[16px]">schedule</span>
                    {detailJob.jobType === 'internship' ? `${detailJob.durationWeeks || 0} Weeks` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Verified details flags */}
              <div className="flex gap-2.5">
                {detailJob.ppoPossibility && (
                  <span className="px-3 py-1 bg-accent-indigo/10 text-accent-indigo text-[10px] rounded-full font-bold uppercase tracking-wider">
                    PPO Option Available
                  </span>
                )}
                {detailJob.internCertificate && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] rounded-full font-bold uppercase tracking-wider">
                    Certificate Issued
                  </span>
                )}
              </div>

              {/* Skills required */}
              {detailJob.skills && detailJob.skills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Required Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {detailJob.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-slate-100 text-text-secondary text-[10px] rounded font-bold uppercase tracking-wider border border-surface-mid"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Descriptions & eligibility */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-wider mb-1.5">About the role</h4>
                  <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-medium">{detailJob.description}</p>
                </div>
                {detailJob.eligibility && (
                  <div>
                    <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-wider mb-1.5">Who we are looking for</h4>
                    <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-medium">{detailJob.eligibility}</p>
                  </div>
                )}
              </div>

              {/* Similar Opportunities */}
              {getSimilarJobs(detailJob).length > 0 && (
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">workspaces</span>
                    Similar Opportunities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {getSimilarJobs(detailJob).map((sj) => (
                      <div
                        key={sj._id}
                        onClick={() => {
                          setDetailJob(sj);
                        }}
                        className="bg-slate-50 hover:bg-slate-100 border border-surface-mid rounded-xl p-3 cursor-pointer transition-all flex flex-col justify-between"
                      >
                        <div>
                          <p className="font-extrabold text-[11px] text-text-primary line-clamp-1 group-hover:text-primary">{sj.title}</p>
                          <p className="text-[9px] text-text-secondary mt-0.5 truncate">{sj.companyName}</p>
                        </div>
                        <p className="text-[8px] font-extrabold text-primary uppercase mt-2 tracking-wide font-mono">
                          {sj.jobType === 'internship' ? `Rs.${sj.stipendAmount?.toLocaleString()}` : sj.jobType}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Sticky footer action bar */}
            <div className="p-4 px-6 border-t border-surface-mid bg-slate-50 flex justify-end items-center gap-3.5 flex-shrink-0">
              {/* Saved bookmark */}
              <button
                onClick={(e) => toggleSave(detailJob._id, e)}
                className={`p-2 rounded-xl border hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer bg-white shrink-0 ${
                  savedIds.has(detailJob._id)
                    ? 'text-accent-rose border-accent-rose/25 bg-accent-rose/5'
                    : 'text-text-muted border-surface-mid'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: savedIds.has(detailJob._id) ? "'FILL' 1" : "'FILL' 0" }}
                >
                  bookmark
                </span>
              </button>

              {/* Quick apply */}
              {!session?.user?.role || session?.user?.role !== 'recruiter' ? (
                appliedIds.has(detailJob._id) ? (
                  <span className="px-5 py-2.5 bg-accent-teal/10 text-accent-teal border border-accent-teal/20 font-bold text-xs rounded-lg flex items-center gap-1.5 font-sans select-none">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Applied Successfully
                  </span>
                ) : (
                  <Button
                    onClick={() => {
                      setDetailJob(null);
                      handleApply(detailJob);
                    }}
                    variant="primary"
                    size="md"
                    className="w-full shadow-sm text-xs font-bold py-2.5"
                  >
                    Quick Apply
                  </Button>
                )
              ) : (
                <span className="text-[11px] font-bold text-text-muted italic select-none">Recruiters cannot apply</span>
              )}
            </div>

          </div>
        </>
      )}

      {/* Apply Modal component overlay */}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSuccess={handleApplySuccess}
        />
      )}

      {/* 4. BRAND FOOTER SECTION */}
      <footer className="bg-[#0F172A] border-t border-slate-800 text-text-muted select-none mt-auto">
        <div className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-start max-w-[1280px] mx-auto gap-8 text-xs font-semibold">
          <div className="flex flex-col gap-4">
            <span className="text-lg font-display font-black text-white tracking-tight">
              Book<span className="text-primary">My</span>Intern
            </span>
            <p className="text-text-muted font-medium text-xs max-w-xs leading-relaxed">
              Connecting high-impact students with forward-thinking employers across India.
            </p>
          </div>

          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <h5 className="font-extrabold uppercase text-white tracking-wider text-[10px]">Portal Options</h5>
              <Link href="/jobs" className="text-text-muted hover:text-white transition-colors decoration-none">Browse Jobs</Link>
              <Link href="/community-reviews" className="text-text-muted hover:text-white transition-colors decoration-none">Reviews Feed</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="font-extrabold uppercase text-white tracking-wider text-[10px]">Helpdesk</h5>
              <a href="#" className="text-text-muted hover:text-white transition-colors decoration-none">Support Portal</a>
              <a href="#" className="text-text-muted hover:text-white transition-colors decoration-none">Terms of Use</a>
            </div>
          </div>
        </div>

        <div className="w-full border-t border-slate-800 py-6 px-10 max-w-[1280px] mx-auto text-center md:text-left">
          <p className="text-[10px] text-text-muted/60 font-bold">
            &copy; {new Date().getFullYear()} BookMyIntern. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}