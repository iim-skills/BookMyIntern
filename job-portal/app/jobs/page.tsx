'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Filter, 
  X, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  LayoutGrid,
  Zap
} from 'lucide-react';
import JobCard from '@/components/JobCard';
import type { IJob, IApplication } from '@/types';

const JOB_TYPES = ['full-time', 'part-time', 'internship', 'contract', 'remote'];
const PROFILES = ['Frontend', 'Backend', 'Full Stack', 'UI/UX Design', 'Marketing', 'Data Science', 'Mobile App'];

export default function JobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State Management
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Filter States
  const [search, setSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [profileFilter, setProfileFilter] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    
    const fetchData = async () => {
      try {
        const jobRes = await fetch('/api/jobs');
        const jobData = await jobRes.json();
        setJobs(Array.isArray(jobData) ? jobData : []);

        if (session?.user?.role === 'student') {
          const appRes = await fetch('/api/applications/student');
          const appData = await appRes.json();
          if (Array.isArray(appData)) {
            setAppliedIds(new Set(appData.map((a) => 
              typeof a.jobId === 'object' ? a.jobId._id : a.jobId
            )));
          }
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [status, session]);

  const handleApply = async (jobId: string) => {
    setMsg({ text: '', type: '' });
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    });
    const data = await res.json() as { error?: string };

    if (!res.ok) {
      setMsg({ text: data.error ?? 'Error applying.', type: 'error' });
      return;
    }

    setAppliedIds((prev) => new Set([...Array.from(prev), jobId]));
    setMsg({ text: 'Applied successfully!', type: 'success' });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  // Filter Logic
  const displayed = jobs.filter((j) => {
    const q = search.toLowerCase();
    const locQ = locationSearch.toLowerCase();
    
    const matchSearch = !q || j.title.toLowerCase().includes(q) || j.companyName.toLowerCase().includes(q);
    const matchLocation = !locQ || j.location.toLowerCase().includes(locQ);
    const matchType = !typeFilter || j.jobType === typeFilter;
    const matchProfile = !profileFilter || j.title.toLowerCase().includes(profileFilter.toLowerCase());

    return matchSearch && matchLocation && matchType && matchProfile;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" strokeWidth={1.5} />
        <p className="text-gray-400 text-sm font-medium tracking-wide">Finding best roles for you...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto bg-[#F8FAFC] flex font-sans">
      
      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10 text-blue-600">
            <LayoutGrid size={22} strokeWidth={2.5} />
            <span className="font-bold text-lg tracking-tight text-gray-900">Filter Jobs</span>
          </div>

          <div className="space-y-8 flex-1">
            {/* Keyword Search */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 block mb-3 italic">Keyword</label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={15} />
                <input
                  type="text"
                  placeholder="Job title or company..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-9 pr-4 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Location Search */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 block mb-3 italic">Location</label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={15} />
                <input
                  type="text"
                  placeholder="City or 'Remote'..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-9 pr-4 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Profile Dropdown */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 block mb-3 italic">Profile</label>
              <div className="relative">
                <select 
                  value={profileFilter}
                  onChange={(e) => setProfileFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-[13px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none cursor-pointer pr-10"
                >
                  <option value="">Any Profile</option>
                  {PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            </div>

            {/* Job Type List */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 block mb-3 italic">Employment Type</label>
              <div className="space-y-1">
                <button
                  onClick={() => setTypeFilter('')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all ${
                    typeFilter === '' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span>All Types</span>
                  <span className="text-[10px] opacity-60 font-medium">{jobs.length}</span>
                </button>
                {JOB_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type === typeFilter ? '' : type)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] capitalize transition-all ${
                      typeFilter === type ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span>{type}</span>
                    <span className="text-[10px] opacity-40">
                      {jobs.filter(j => j.jobType === type).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 p-6 md:p-10 lg:px-12 lg:py-10 overflow-y-auto">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-blue-600 fill-blue-600" />
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Opportunities Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              {profileFilter ? profileFilter : 'Latest'} <span className="text-blue-600 underline decoration-blue-100 underline-offset-4">Jobs</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-white border border-gray-100 rounded-full px-4 py-1.5 shadow-sm">
              <span className="text-[12px] font-bold text-gray-700">{displayed.length}</span>
              <span className="text-[12px] text-gray-400 ml-1">Results Found</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-lg shadow-gray-200"
            >
              <Filter size={16} /> Filters
            </button>
          </div>
        </header>

        {/* Message Banner */}
        {msg.text && (
          <div className={`flex items-center gap-3 p-4 rounded-xl mb-8 animate-in fade-in slide-in-from-top-4 ${
            msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-bold">{msg.text}</span>
          </div>
        )}

        {/* Active Chip Row */}
        {(search || typeFilter || locationSearch || profileFilter) && (
          <div className="flex flex-wrap gap-2 mb-8 items-center">
            <span className="text-[11px] font-bold text-gray-400 mr-2">Active:</span>
            {search && <Chip label={search} onClear={() => setSearch('')} />}
            {locationSearch && <Chip label={locationSearch} onClear={() => setLocationSearch('')} />}
            {typeFilter && <Chip label={typeFilter} onClear={() => setTypeFilter('')} />}
            {profileFilter && <Chip label={profileFilter} onClear={() => setProfileFilter('')} />}
            <button 
              onClick={() => {setSearch(''); setLocationSearch(''); setTypeFilter(''); setProfileFilter('');}}
              className="text-[11px] font-bold text-blue-600 hover:underline ml-2"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="p-5 bg-gray-50 rounded-full mb-4">
              <Search className="text-gray-300 w-8 h-8" />
            </div>
            <p className="text-gray-400 text-sm font-medium">No positions match your preferences.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {displayed.map((job, i) => (
              <div 
                key={job._id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
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

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// ── Reusable Chip Component ──
function Chip({ label, onClear }: { label: string, onClear: () => void }) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm">
      <span className="text-[11px] font-bold text-gray-700 capitalize">{label}</span>
      <button onClick={onClear} className="text-gray-400 hover:text-red-500 transition-colors">
        <X size={12} />
      </button>
    </div>
  );
}