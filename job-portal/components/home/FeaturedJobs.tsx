'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const JOBS = [
  { id: 1, title: 'Frontend Developer Intern', company: 'TechCorp', verified: true, location: 'Remote', type: 'Internship', duration: '3 months', stipend: 'Rs. 15,000/mo', skills: ['React', 'TypeScript', 'Tailwind'], category: 'Tech', ppo: true, cert: true, daysLeft: 3, avatarBg: 'bg-blue-100', avatarText: 'text-blue-700', initials: 'TC' },
  { id: 2, title: 'UI/UX Design Intern', company: 'PixelWorks', verified: false, location: 'Bangalore', type: 'Internship', duration: '6 months', stipend: 'Rs. 12,000/mo', skills: ['Figma', 'Prototyping', 'User Research'], category: 'Design', ppo: false, cert: true, daysLeft: 14, avatarBg: 'bg-purple-100', avatarText: 'text-purple-700', initials: 'PW' },
  { id: 3, title: 'Digital Marketing Intern', company: 'GrowthLabs', verified: true, location: 'Remote', type: 'Internship', duration: '2 months', stipend: 'Rs. 8,000/mo', skills: ['SEO', 'Content', 'Google Ads'], category: 'Marketing', ppo: false, cert: true, daysLeft: 7, avatarBg: 'bg-rose-100', avatarText: 'text-rose-700', initials: 'GL' },
  { id: 4, title: 'Data Science Intern', company: 'DataMind', verified: true, location: 'Mumbai', type: 'Internship', duration: '4 months', stipend: 'Rs. 20,000/mo', skills: ['Python', 'ML', 'Pandas'], category: 'Tech', ppo: true, cert: true, daysLeft: 5, avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700', initials: 'DM' },
  { id: 5, title: 'Finance Analyst Intern', company: 'CapVest', verified: false, location: 'Delhi', type: 'Internship', duration: '3 months', stipend: 'Rs. 10,000/mo', skills: ['Excel', 'Financial Modelling', 'Tally'], category: 'Finance', ppo: false, cert: false, daysLeft: 20, avatarBg: 'bg-amber-100', avatarText: 'text-amber-700', initials: 'CV' },
  { id: 6, title: 'Content Writer Intern', company: 'WordFlow', verified: true, location: 'Remote', type: 'Internship', duration: '2 months', stipend: 'Rs. 6,000/mo', skills: ['Copywriting', 'SEO', 'WordPress'], category: 'Marketing', ppo: false, cert: true, daysLeft: 10, avatarBg: 'bg-green-100', avatarText: 'text-green-700', initials: 'WF' },
];

export default function FeaturedJobs() {
  const revealRef = useScrollReveal();
  const [activeTab, setActiveTab] = useState('All');

  const filteredJobs = activeTab === 'All' 
    ? JOBS 
    : JOBS.filter(job => job.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <section
      ref={revealRef}
      style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
      className="py-20 bg-surface-page"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 select-none">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-blue mb-3 block">
              Featured opportunities
            </span>
            <h2 className="font-display font-bold text-3xl text-ink-primary">
              Hand-picked for you
            </h2>
          </div>
          <Link
            href="/jobs"
            className="text-sm font-medium text-brand-blue hover:underline decoration-none flex items-center gap-1"
          >
            View all &rarr;
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-6 mb-10 flex-wrap">
          {['All', 'Tech', 'Marketing', 'Design', 'Finance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium px-4 py-2 rounded-[8px] cursor-pointer transition-all duration-200 border ${
                activeTab === tab
                  ? 'bg-brand-blue text-white border-brand-blue shadow-blue'
                  : 'bg-white border-surface-mid text-ink-secondary hover:border-brand-blue hover:text-brand-blue'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-[12px] border border-surface-mid shadow-card hover:-translate-y-1 hover:shadow-blue transition-all duration-200 p-5 flex flex-col gap-4 cursor-default"
            >
              {/* Row 1 - Company Logo & Deadline */}
              <div className="flex justify-between items-start select-none">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${job.avatarBg} ${job.avatarText}`}>
                  {job.initials}
                </div>
                {job.daysLeft <= 7 ? (
                  <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {job.daysLeft} days left
                  </span>
                ) : (
                  <span className="text-ink-muted text-xs font-medium">
                    Closes Jan 30
                  </span>
                )}
              </div>

              {/* Row 2 - Title & Company Name */}
              <div>
                <h3 className="font-display font-bold text-base text-ink-primary leading-snug">
                  {job.title}
                </h3>
                <div className="text-sm text-ink-secondary mt-0.5 flex items-center gap-1 select-none">
                  <span>{job.company}</span>
                  {job.verified && (
                    <span className="text-brand-teal text-xs font-bold" title="Verified Company">
                      ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Row 3 - Meta Tags */}
              <div className="flex flex-wrap gap-2 select-none">
                <span className="text-xs font-medium bg-surface-page text-ink-secondary px-2.5 py-1 rounded-full flex items-center gap-1">
                  📍 {job.location}
                </span>
                <span className="text-xs font-medium bg-surface-page text-ink-secondary px-2.5 py-1 rounded-full flex items-center gap-1">
                  💼 {job.type}
                </span>
                <span className="text-xs font-medium bg-surface-page text-ink-secondary px-2.5 py-1 rounded-full flex items-center gap-1">
                  ⏱️ {job.duration}
                </span>
              </div>

              {/* Row 4 - Skills */}
              <div className="flex flex-wrap gap-1.5 select-none">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Row 5 - Footer (mt-auto) */}
              <div className="mt-auto pt-3 border-t border-surface-mid flex justify-between items-center select-none">
                <div className="flex items-center">
                  <span className="font-display font-bold text-base text-brand-teal">
                    {job.stipend}
                  </span>
                  {job.ppo && (
                    <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full ml-2 font-semibold">
                      PPO ✓
                    </span>
                  )}
                  {job.cert && !job.ppo && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full ml-2 font-semibold">
                      Cert ✓
                    </span>
                  )}
                </div>
                <Link
                  href={`/jobs?role=${encodeURIComponent(job.title)}`}
                  className="text-sm font-semibold text-brand-blue border border-brand-blue px-4 py-2 rounded-[8px] hover:bg-brand-blue hover:text-white transition-all duration-200 decoration-none"
                >
                  Apply Now
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
