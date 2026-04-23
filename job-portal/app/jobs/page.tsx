'use client';
import { useState, useEffect }        from 'react';
import { useSession }                  from 'next-auth/react';
import { useRouter }                   from 'next/navigation';
import JobCard                         from '@/components/JobCard';
import type { IJob, IApplication }     from '@/types';

const JOB_TYPES = ['full-time', 'part-time', 'internship', 'contract', 'remote'];

const TYPE_COLORS: Record<string, string> = {
  'full-time':  '#1a1a2e',
  'part-time':  '#16213e',
  'internship': '#0f3460',
  'contract':   '#533483',
  'remote':     '#2b4162',
};

export default function JobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs,       setJobs]       = useState<IJob[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [msg,        setMsg]        = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/jobs').then((r) => r.json()).then((d: IJob[]) => {
      setJobs(Array.isArray(d) ? d : []);
      setLoading(false);
    });
    if (session?.user?.role === 'student') {
      fetch('/api/applications/student').then((r) => r.json()).then((d: IApplication[]) => {
        if (Array.isArray(d))
          setAppliedIds(new Set(d.map((a) => (typeof a.jobId === 'object' ? a.jobId._id : a.jobId))));
      });
    }
  }, [status, session]);

  const handleApply = async (jobId: string) => {
    setMsg('');
    const res  = await fetch('/api/applications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setMsg(data.error ?? 'Error applying.'); return; }
    setAppliedIds((prev) => new Set([...Array.from(prev), jobId]));
    setMsg('Applied successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  const displayed = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title.toLowerCase().includes(q) ||
      j.companyName.toLowerCase().includes(q) || j.location.toLowerCase().includes(q);
    return matchSearch && (!typeFilter || j.jobType === typeFilter);
  });

  const typeCounts = JOB_TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = jobs.filter((j) => j.jobType === t).length;
    return acc;
  }, {});

  if (status === 'loading' || loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingDots}>
          <span style={{ ...styles.dot, animationDelay: '0s' }} />
          <span style={{ ...styles.dot, animationDelay: '0.18s' }} />
          <span style={{ ...styles.dot, animationDelay: '0.36s' }} />
        </div>
        <p style={styles.loadingText}>Fetching opportunities…</p>
        <style>{dotAnim}</style>
      </div>
    );
  }

  return (
    <>
      <style>{pageStyles}</style>

      <div style={styles.root}>
        {/* ── Sidebar ── */}
        <aside style={{ ...styles.sidebar, ...(sidebarOpen ? styles.sidebarOpen : {}) }}>
          <div style={styles.sidebarInner}>

            <div style={styles.sidebarHeader}>
              <span style={styles.sidebarLogo}>⬡</span>
              <span style={styles.sidebarTitle}>Filters</span>
            </div>

            {/* Search */}
            <div style={styles.filterSection}>
              <label style={styles.filterLabel}>Search</label>
              <div style={styles.searchWrap}>
                <svg style={styles.searchIcon} viewBox="0 0 16 16" fill="none">
                  <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <input
                  placeholder="Title, company, location…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            </div>

            {/* Job Type */}
            <div style={styles.filterSection}>
              <label style={styles.filterLabel}>Job type</label>
              <button
                onClick={() => setTypeFilter('')}
                style={{ ...styles.typeBtn, ...(typeFilter === '' ? styles.typeBtnActive : {}) }}
              >
                <span>All types</span>
                <span style={styles.typeCount}>{jobs.length}</span>
              </button>
              {JOB_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
                  style={{ ...styles.typeBtn, ...(typeFilter === t ? styles.typeBtnActive : {}) }}
                >
                  <span style={styles.typeDot(TYPE_COLORS[t])} />
                  <span style={styles.typeName}>{t}</span>
                  <span style={styles.typeCount}>{typeCounts[t] ?? 0}</span>
                </button>
              ))}
            </div>

            {/* Active filter chip */}
            {(search || typeFilter) && (
              <div style={styles.filterSection}>
                <label style={styles.filterLabel}>Active filters</label>
                <div style={styles.chipRow}>
                  {search && (
                    <button style={styles.chip} onClick={() => setSearch('')}>
                      "{search}" ×
                    </button>
                  )}
                  {typeFilter && (
                    <button style={styles.chip} onClick={() => setTypeFilter('')}>
                      {typeFilter} ×
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </aside>

        {/* ── Main ── */}
        <main style={styles.main}>
          <header style={styles.mainHeader}>
            <div>
              <h1 style={styles.h1}>
                {typeFilter
                  ? <>{typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)} roles</>
                  : <>All opportunities</>}
              </h1>
              <p style={styles.subtitle}>
                {displayed.length} {displayed.length === 1 ? 'position' : 'positions'} available
                {session?.user?.role === 'student' && appliedIds.size > 0 && (
                  <> · <span style={styles.appliedBadge}>{appliedIds.size} applied</span></>
                )}
              </p>
            </div>
            {/* Mobile filter toggle */}
            <button style={styles.mobileToggle} onClick={() => setSidebarOpen((p) => !p)}>
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Filters
            </button>
          </header>

          {msg && (
            <div style={msg.includes('success') ? styles.alertSuccess : styles.alertError}>
              {msg}
            </div>
          )}

          {displayed.length === 0 ? (
            <div style={styles.empty}>
              <svg viewBox="0 0 48 48" width="40" height="40" fill="none" style={{ marginBottom: 12, opacity: 0.3 }}>
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 24h16M24 16v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p style={{ margin: 0 }}>No positions match your filters.</p>
              <button style={styles.clearBtn} onClick={() => { setSearch(''); setTypeFilter(''); }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div style={styles.grid}>
              {displayed.map((job, i) => (
                <div
                  key={job._id}
                  style={{ ...styles.cardWrap, animationDelay: `${i * 40}ms` }}
                  className="job-card-enter"
                >
                  <JobCard
                    job={job}
                    applied={appliedIds.has(job._id)}
                    onApply={handleApply}
                    isRecruiter={session?.user?.role === 'recruiter'}
                  />
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
        )}
      </div>
    </>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const SIDEBAR_W = 240;
const ACCENT    = '#5b4cdb';
const ACCENT_BG = 'rgba(91,76,219,0.08)';

const styles: Record<string, any> = {
  root: {
    display:       'flex',
    minHeight:     '100vh',
    background:    '#f7f7f8',
    fontFamily:    "'DM Sans', 'Segoe UI', system-ui, sans-serif",
  },

  /* Sidebar */
  sidebar: {
    width:          SIDEBAR_W,
    minWidth:       SIDEBAR_W,
    background:     '#ffffff',
    borderRight:    '1px solid #ebebeb',
    position:       'sticky' as const,
    top:            0,
    height:         '100vh',
    overflowY:      'auto' as const,
    zIndex:         10,
    transition:     'transform 0.25s ease',
    '@media (max-width: 768px)': {
      position: 'fixed',
      transform: 'translateX(-100%)',
    },
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  sidebarInner: {
    padding: '28px 20px',
  },
  sidebarHeader: {
    display:        'flex',
    alignItems:     'center',
    gap:            8,
    marginBottom:   32,
  },
  sidebarLogo: {
    fontSize:       20,
    color:          ACCENT,
    lineHeight:     1,
  },
  sidebarTitle: {
    fontSize:       13,
    fontWeight:     600,
    letterSpacing:  '0.08em',
    textTransform:  'uppercase' as const,
    color:          '#888',
  },

  /* Filter sections */
  filterSection: {
    marginBottom:   24,
  },
  filterLabel: {
    display:        'block',
    fontSize:       11,
    fontWeight:     600,
    letterSpacing:  '0.1em',
    textTransform:  'uppercase' as const,
    color:          '#aaa',
    marginBottom:   8,
  },

  /* Search */
  searchWrap: {
    position:       'relative' as const,
    display:        'flex',
    alignItems:     'center',
  },
  searchIcon: {
    position:       'absolute' as const,
    left:           10,
    width:          14,
    height:         14,
    color:          '#aaa',
    pointerEvents:  'none' as const,
  },
  searchInput: {
    width:          '100%',
    padding:        '8px 10px 8px 32px',
    border:         '1px solid #e5e5e5',
    borderRadius:   8,
    fontSize:       13,
    color:          '#1a1a1a',
    background:     '#fafafa',
    outline:        'none',
    boxSizing:      'border-box' as const,
    transition:     'border-color 0.15s',
  },

  /* Type buttons */
  typeBtn: {
    display:        'flex',
    alignItems:     'center',
    width:          '100%',
    padding:        '7px 10px',
    border:         'none',
    borderRadius:   7,
    background:     'transparent',
    cursor:         'pointer',
    fontSize:       13,
    color:          '#555',
    marginBottom:   2,
    transition:     'background 0.12s, color 0.12s',
    textAlign:      'left' as const,
  },
  typeBtnActive: {
    background:     ACCENT_BG,
    color:          ACCENT,
    fontWeight:     600,
  },
  typeName: {
    flex:           1,
    textTransform:  'capitalize' as const,
  },
  typeDot: (color: string) => ({
    width:          7,
    height:         7,
    borderRadius:   '50%',
    background:     color,
    marginRight:    8,
    flexShrink:     0,
  }),
  typeCount: {
    fontSize:       11,
    color:          '#bbb',
    marginLeft:     'auto',
  },

  /* Chips */
  chipRow: {
    display:        'flex',
    flexWrap:       'wrap' as const,
    gap:            6,
  },
  chip: {
    padding:        '4px 10px',
    border:         `1px solid ${ACCENT}40`,
    borderRadius:   20,
    background:     ACCENT_BG,
    color:          ACCENT,
    fontSize:       12,
    cursor:         'pointer',
    fontWeight:     500,
  },

  /* Main area */
  main: {
    flex:           1,
    padding:        '32px 36px',
    minWidth:       0,
  },
  mainHeader: {
    display:        'flex',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    marginBottom:   28,
    flexWrap:       'wrap' as const,
    gap:            12,
  },
  h1: {
    fontSize:       26,
    fontWeight:     700,
    color:          '#111',
    margin:         0,
    fontFamily:     "'DM Serif Display', Georgia, serif",
    letterSpacing:  '-0.01em',
  },
  subtitle: {
    fontSize:       14,
    color:          '#888',
    margin:         '4px 0 0',
  },
  appliedBadge: {
    color:          '#16a34a',
    fontWeight:     600,
  },
  mobileToggle: {
    display:        'none',
    alignItems:     'center',
    gap:            6,
    padding:        '7px 14px',
    border:         '1px solid #e5e5e5',
    borderRadius:   8,
    background:     '#fff',
    fontSize:       13,
    cursor:         'pointer',
    color:          '#555',
    '@media (max-width: 768px)': { display: 'flex' },
  },

  /* Alerts */
  alertSuccess: {
    padding:        '10px 16px',
    borderRadius:   8,
    background:     '#f0fdf4',
    border:         '1px solid #bbf7d0',
    color:          '#15803d',
    fontSize:       13,
    marginBottom:   20,
  },
  alertError: {
    padding:        '10px 16px',
    borderRadius:   8,
    background:     '#fef2f2',
    border:         '1px solid #fecaca',
    color:          '#b91c1c',
    fontSize:       13,
    marginBottom:   20,
  },

  /* Grid */
  grid: {
    display:              'grid',
    gridTemplateColumns:  'repeat(auto-fill, minmax(320px, 1fr))',
    gap:                  16,
  },
  cardWrap: {
    animation:      'jobFadeIn 0.3s ease both',
  },

  /* Empty */
  empty: {
    display:        'flex',
    flexDirection:  'column' as const,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '80px 20px',
    color:          '#999',
    fontSize:       14,
    textAlign:      'center' as const,
  },
  clearBtn: {
    marginTop:      14,
    padding:        '8px 18px',
    border:         `1px solid ${ACCENT}`,
    borderRadius:   8,
    background:     'transparent',
    color:          ACCENT,
    fontSize:       13,
    cursor:         'pointer',
    fontWeight:     500,
  },

  /* Overlay */
  overlay: {
    display:        'none',
    position:       'fixed' as const,
    inset:          0,
    background:     'rgba(0,0,0,0.3)',
    zIndex:         9,
    '@media (max-width: 768px)': { display: 'block' },
  },

  /* Loading */
  loadingWrap: {
    display:        'flex',
    flexDirection:  'column' as const,
    alignItems:     'center',
    justifyContent: 'center',
    height:         '60vh',
    gap:            12,
  },
  loadingDots: {
    display:        'flex',
    gap:            6,
  },
  dot: {
    width:          8,
    height:         8,
    borderRadius:   '50%',
    background:     ACCENT,
    display:        'inline-block',
    animation:      'bounce 0.8s ease infinite',
  },
  loadingText: {
    fontSize:       13,
    color:          '#aaa',
    margin:         0,
  },
};

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

  * { box-sizing: border-box; }

  @keyframes jobFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  input:focus {
    border-color: #5b4cdb !important;
    box-shadow: 0 0 0 3px rgba(91,76,219,0.12);
  }

  aside::-webkit-scrollbar { width: 4px; }
  aside::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }

  @media (max-width: 768px) {
    aside {
      position: fixed !important;
      transform: translateX(-100%);
    }
    .sidebar-open aside {
      transform: translateX(0) !important;
    }
    .mobile-toggle {
      display: flex !important;
    }
    .overlay-active {
      display: block !important;
    }
  }
`;

const dotAnim = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); opacity: 0.4; }
    50%       { transform: translateY(-6px); opacity: 1; }
  }
`;