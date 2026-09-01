'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/home/Footer';

interface CompanyData {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  location: string;
  rating: number;
  reviewsCount: number;
  openRoles: number;
  verified: boolean;
  avatarBg: string;
  avatarText: string;
  initials: string;
  tags: string[];
}

const COMPANIES: CompanyData[] = [
  {
    id: 'techcorp',
    name: 'TechCorp Solutions',
    tagline: 'Building next-generation cloud infrastructure and AI developer tools.',
    industry: 'Technology',
    location: 'Bangalore & Remote',
    rating: 4.8,
    reviewsCount: 42,
    openRoles: 6,
    verified: true,
    avatarBg: 'bg-blue-100',
    avatarText: 'text-blue-700',
    initials: 'TC',
    tags: ['React', 'Node.js', 'AWS', 'PPO Track'],
  },
  {
    id: 'pixelworks',
    name: 'PixelWorks Studio',
    tagline: 'Leading product design agency shaping interfaces for global unicorns.',
    industry: 'Design',
    location: 'Mumbai & Remote',
    rating: 4.9,
    reviewsCount: 28,
    openRoles: 3,
    verified: true,
    avatarBg: 'bg-purple-100',
    avatarText: 'text-purple-700',
    initials: 'PW',
    tags: ['Figma', 'Design Systems', 'UX Research'],
  },
  {
    id: 'growthlabs',
    name: 'GrowthLabs Media',
    tagline: 'Data-driven performance marketing and brand acceleration for D2C brands.',
    industry: 'Marketing',
    location: 'Gurgaon / Delhi NCR',
    rating: 4.6,
    reviewsCount: 35,
    openRoles: 4,
    verified: true,
    avatarBg: 'bg-rose-100',
    avatarText: 'text-rose-700',
    initials: 'GL',
    tags: ['SEO', 'Google Ads', 'Content Strategy'],
  },
  {
    id: 'datamind',
    name: 'DataMind Analytics',
    tagline: 'Enterprise predictive analytics and machine learning consulting.',
    industry: 'Technology',
    location: 'Hyderabad & Remote',
    rating: 4.7,
    reviewsCount: 19,
    openRoles: 5,
    verified: true,
    avatarBg: 'bg-indigo-100',
    avatarText: 'text-indigo-700',
    initials: 'DM',
    tags: ['Python', 'ML', 'PyTorch', 'Data Pipelines'],
  },
  {
    id: 'capvest',
    name: 'CapVest Capital',
    tagline: 'Fintech investment research and portfolio management advisory.',
    industry: 'Finance',
    location: 'Mumbai',
    rating: 4.5,
    reviewsCount: 23,
    openRoles: 2,
    verified: true,
    avatarBg: 'bg-amber-100',
    avatarText: 'text-amber-700',
    initials: 'CV',
    tags: ['Financial Modeling', 'Equity Research', 'Excel'],
  },
  {
    id: 'innovatehealth',
    name: 'InnovateHealth Technologies',
    tagline: 'Digital telemedicine and electronic health records for Tier-2 cities.',
    industry: 'Healthcare',
    location: 'Pune & Remote',
    rating: 4.8,
    reviewsCount: 16,
    openRoles: 3,
    verified: true,
    avatarBg: 'bg-teal-100',
    avatarText: 'text-teal-700',
    initials: 'IH',
    tags: ['Healthcare IT', 'Flutter', 'FastAPI'],
  },
  {
    id: 'nexusedtech',
    name: 'Nexus EdTech',
    tagline: 'Gamified STEM learning platform for K-12 students across India.',
    industry: 'EdTech',
    location: 'Bangalore',
    rating: 4.6,
    reviewsCount: 31,
    openRoles: 4,
    verified: true,
    avatarBg: 'bg-orange-100',
    avatarText: 'text-orange-700',
    initials: 'NE',
    tags: ['Gamification', 'Next.js', 'Curriculum Design'],
  },
  {
    id: 'wordflow',
    name: 'WordFlow Global',
    tagline: 'Global creative copywriting, localization, and multimedia storytelling.',
    industry: 'Marketing',
    location: 'Remote',
    rating: 4.7,
    reviewsCount: 27,
    openRoles: 2,
    verified: true,
    avatarBg: 'bg-green-100',
    avatarText: 'text-green-700',
    initials: 'WF',
    tags: ['Copywriting', 'SEO', 'Editorial'],
  },
];

export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [activeIndustry, setActiveIndustry] = useState('All');

  const industries = ['All', 'Technology', 'Design', 'Marketing', 'Finance', 'Healthcare', 'EdTech'];

  const filteredCompanies = COMPANIES.filter((c) => {
    const matchIndustry = activeIndustry === 'All' || c.industry.toLowerCase() === activeIndustry.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tagline.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchIndustry && matchSearch;
  });

  return (
    <main className="min-h-screen bg-surface-page font-body pt-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF] py-14 border-b border-surface-mid">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block">
              Verified Hiring Partners
            </span>
            <h1 className="font-display font-extrabold text-3xl md:text-5xl text-ink-primary tracking-tight mb-4">
              Explore Top Companies Hiring Interns
            </h1>
            <p className="text-ink-secondary text-base md:text-lg leading-relaxed mb-8">
              Discover verified organizations offering high-growth internships, genuine stipends, and proven pre-placement offer (PPO) conversion rates.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-card border border-surface-mid shadow-lift p-2 flex items-center gap-3 max-w-2xl mx-auto">
              <svg className="w-5 h-5 text-ink-muted ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companies by name, skill, or location..."
                className="w-full bg-transparent border-none text-sm text-ink-primary focus:outline-none placeholder:text-ink-muted py-2"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-ink-muted hover:text-ink-primary text-xs px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 max-w-7xl mx-auto px-6">
        {/* Industry Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 select-none">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setActiveIndustry(ind)}
              className={`text-sm font-medium px-4 py-2 rounded-full cursor-pointer transition-all duration-200 border whitespace-nowrap ${
                activeIndustry === ind
                  ? 'bg-brand-blue text-white border-brand-blue shadow-blue'
                  : 'bg-white border-surface-mid text-ink-secondary hover:border-brand-blue hover:text-brand-blue'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6 select-none">
          <span className="text-sm font-semibold text-ink-secondary">
            Showing <span className="text-ink-primary font-bold">{filteredCompanies.length}</span> companies
          </span>
          <Link
            href="/jobs"
            className="text-sm font-medium text-brand-blue hover:underline decoration-none"
          >
            View all open internships &rarr;
          </Link>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-card p-12 text-center border border-surface-mid my-8">
            <span className="text-4xl mb-3 block">🔍</span>
            <h3 className="font-display font-bold text-lg text-ink-primary mb-1">No companies found</h3>
            <p className="text-sm text-ink-secondary mb-4">Try adjusting your keyword or industry filter.</p>
            <button
              onClick={() => { setSearch(''); setActiveIndustry('All'); }}
              className="bg-brand-blue text-white text-xs font-semibold px-4 py-2 rounded-[8px]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-card border border-surface-mid shadow-card hover:shadow-lift hover:border-blue-200 transition-all duration-200 p-6 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Avatar & Rating */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center font-display font-bold text-base ${company.avatarBg} ${company.avatarText}`}>
                      {company.initials}
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                      <span className="text-amber-500 text-xs">★</span>
                      <span className="text-xs font-bold text-amber-800">{company.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-ink-muted">({company.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Company Name & Verified */}
                  <div className="mb-2">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-bold text-lg text-ink-primary group-hover:text-brand-blue transition-colors">
                        {company.name}
                      </h3>
                      {company.verified && (
                        <span className="text-brand-teal text-sm font-bold" title="Verified Recruiter Firm">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-brand-indigo">
                      {company.industry} &bull; 📍 {company.location}
                    </span>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs text-ink-secondary leading-relaxed mb-4 line-clamp-2">
                    {company.tagline}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5 select-none">
                    {company.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-surface-page text-ink-secondary px-2.5 py-0.5 rounded-full border border-surface-mid"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action Row */}
                <div className="pt-4 border-t border-surface-mid flex items-center justify-between mt-2 select-none">
                  <span className="text-xs font-bold text-brand-teal">
                    {company.openRoles} Active Openings
                  </span>
                  <Link
                    href={`/jobs?role=${encodeURIComponent(company.name)}`}
                    className="text-xs font-semibold text-brand-blue bg-brand-bluelight hover:bg-brand-blue hover:text-white px-3.5 py-1.5 rounded-[8px] transition-all decoration-none"
                  >
                    View Roles &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recruiter Callout Box */}
        <div className="mt-16 bg-gradient-to-r from-brand-navy to-brand-bluedark text-white rounded-xl2 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lift">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-2 block">
              For Employers & Hiring Teams
            </span>
            <h3 className="font-display font-bold text-2xl md:text-3xl mb-2 text-white">
              Want your company featured here?
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Join over 1,400+ top organizations hiring pre-vetted interns, graduates, and fresh engineers on BookMyIntern with zero placement agency commissions.
            </p>
          </div>
          <Link
            href="/signup?role=recruiter"
            className="bg-brand-blue hover:bg-brand-bluedark text-white font-semibold text-sm px-6 py-3.5 rounded-[8px] whitespace-nowrap shadow-blue transition-all decoration-none flex-shrink-0"
          >
            Register as Recruiter
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
