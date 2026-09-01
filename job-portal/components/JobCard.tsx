'use client';
import Link from 'next/link';
import type { IJob } from '@/types';

interface JobCardProps {
  job:         IJob;
  applied:     boolean;
  onApply:     (job: IJob) => void;  // full object — NOT just the id string
  isRecruiter: boolean;
  isGuest?:    boolean;
}

export default function JobCard({ job, applied, onApply, isRecruiter, isGuest }: JobCardProps) {
  const expired = new Date(job.deadline) < new Date();

  return (
    <div className="group bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 mb-3 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer">
      
      {/* Left section: Job details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link 
            href={`/jobs/${job._id}`}
            className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-150"
          >
            {job.title}
          </Link>
        </div>

        {/* Company & Location info */}
        <div className="text-[13px] font-semibold text-slate-800 flex items-center gap-1.5 mt-1.5">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            {job.companyName}
          </span>
          <span className="text-slate-400 font-normal">&bull;</span>
          <span className="flex items-center gap-1 text-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {job.location}
          </span>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            {job.jobType}
          </span>
          
          {job.salary && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              {job.salary}
            </span>
          )}

          {expired && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
              Closed
            </span>
          )}
        </div>

        {/* Skills layout */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3.5">
            <span className="text-[11px] font-bold text-slate-800 mr-1 mt-0.5">Skills:</span>
            {job.skills.map((skill, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-900 border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Deadline Calendar */}
        <div className="text-[11px] font-semibold text-slate-800 flex items-center gap-1 mt-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Deadline: {new Date(job.deadline).toLocaleDateString()}
        </div>
      </div>

      {/* Right section: Action Buttons */}
      <div className="flex flex-col items-stretch md:items-end justify-center gap-2 flex-shrink-0 min-w-[120px]">
        {!isRecruiter && (
          isGuest ? (
            <Link
              href="/login?callbackUrl=/jobs"
              className="w-full text-center px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-900 font-bold text-xs rounded-lg transition-all duration-150 active:scale-98"
              style={{ textDecoration: 'none' }}
            >
              Sign in to Apply
            </Link>
          ) : applied ? (
            <span className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-xs rounded-lg w-full text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Applied
            </span>
          ) : (
            <button
              className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all duration-150 active:scale-95 disabled:opacity-50"
              onClick={() => onApply(job)}   // ← pass the FULL job object
              disabled={expired}
            >
              {expired ? 'Closed' : 'Quick Apply'}
            </button>
          )
        )}
      </div>
    </div>
  );
}
