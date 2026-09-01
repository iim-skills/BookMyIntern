'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (location) params.set('location', location);
    if (experience) params.set('experience', experience);
    router.push(`/jobs?${params.toString()}`);
  };

  const handleChipClick = (type: string, value: string) => {
    const params = new URLSearchParams();
    params.set(type, value);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden min-h-screen bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF] flex flex-col justify-center pt-28 pb-20 select-none">

      {/* Decorative Glow Blob 1 — Top Right */}
      <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[130px] pointer-events-none" />

      {/* Decorative Glow Blob 2 — Bottom Left */}
      <div className="absolute -bottom-[10%] -left-[10%] w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[110px] pointer-events-none" />

      {/* Light Dot Grid Texture Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1.5px,transparent_1.5px)] bg-[size:32px_32px] opacity-70 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center relative z-10 w-full">

        {/* Left Column */}
        <div className="flex flex-col items-start w-full">

          {/* Eyebrow Counter with Pulsing Dot */}
          <div className="flex items-center gap-2 mb-6">
            {/* <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-blue" />
            </span> */}
            <span className="text-brand-blue text-xs font-bold uppercase tracking-[0.2em]">
              10,284 verified internships live today
            </span>
          </div>

          {/* Balanced Heading */}
          <h1 className="font-display font-extrabold text-ink-primary text-4xl md:text-5xl lg:text-[48px] leading-[1.15] tracking-tight mb-6">
            Find internships that <br />
            launch your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-teal">dream career.</span>
          </h1>

          {/* Subheadline description */}
          <p className="text-ink-secondary text-base md:text-lg leading-relaxed max-w-xl mb-10">
            Discover high-paying internships across engineering, design, marketing, and finance. Skip the cover letters and apply with your verified profile in one click.
          </p>

          {/* Search bar card */}
          <form
            onSubmit={handleSearch}
            className="w-full bg-white rounded-[16px] border border-surface-mid shadow-lift p-2 flex flex-col md:flex-row gap-2 max-w-3xl"
          >
            {/* Input 1: Role */}
            <div className="flex-1 flex items-center gap-2 px-3">
              <svg
                className="w-5 h-5 text-ink-muted flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Role, skill, or company"
                className="w-full bg-transparent border-none focus:outline-none text-sm text-ink-primary py-3 placeholder:text-ink-muted"
              />
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-surface-mid self-stretch my-2" />

            {/* Input 2: Location */}
            <div className="flex-1 flex items-center gap-2 px-3">
              <svg
                className="w-5 h-5 text-ink-muted flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or Remote"
                className="w-full bg-transparent border-none focus:outline-none text-sm text-ink-primary py-3 placeholder:text-ink-muted"
              />
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-surface-mid self-stretch my-2" />

            {/* Dropdown 3: Experience select */}
            <div className="flex items-center px-3 md:w-40">
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full text-sm text-ink-secondary bg-transparent focus:outline-none py-3 cursor-pointer border-none"
              >
                <option value="">Any experience</option>
                <option value="fresher">Fresher</option>
                <option value="0-1">0–1 yr</option>
                <option value="1-2">1–2 yrs</option>
              </select>
            </div>

            {/* Search button */}
            <button
              type="submit"
              className="bg-brand-blue hover:bg-brand-bluedark text-white text-sm font-semibold px-6 py-3.5 rounded-[10px] transition-all whitespace-nowrap shadow-blue cursor-pointer border-none"
            >
              Search Internships
            </button>
          </form>

          {/* Quick Filter Chips */}
          <div className="mt-6 flex flex-wrap gap-2 items-center">
            <span className="text-ink-muted text-xs font-semibold uppercase tracking-wider mr-1">
              Popular:
            </span>
            <button
              type="button"
              onClick={() => handleChipClick('location', 'Remote')}
              className="text-ink-secondary text-xs font-semibold bg-white hover:bg-brand-bluelight border border-surface-mid hover:border-brand-blue px-3.5 py-1.5 rounded-full cursor-pointer transition-all focus:outline-none"
            >
              Remote 🏠
            </button>
            <button
              type="button"
              onClick={() => handleChipClick('category', 'Tech')}
              className="text-ink-secondary text-xs font-semibold bg-white hover:bg-brand-bluelight border border-surface-mid hover:border-brand-blue px-3.5 py-1.5 rounded-full cursor-pointer transition-all focus:outline-none"
            >
              Tech 💻
            </button>
            <button
              type="button"
              onClick={() => handleChipClick('category', 'Marketing')}
              className="text-ink-secondary text-xs font-semibold bg-white hover:bg-brand-bluelight border border-surface-mid hover:border-brand-blue px-3.5 py-1.5 rounded-full cursor-pointer transition-all focus:outline-none"
            >
              Marketing 📣
            </button>
            <button
              type="button"
              onClick={() => handleChipClick('category', 'Design')}
              className="text-ink-secondary text-xs font-semibold bg-white hover:bg-brand-bluelight border border-surface-mid hover:border-brand-blue px-3.5 py-1.5 rounded-full cursor-pointer transition-all focus:outline-none"
            >
              Design 🎨
            </button>
            <button
              type="button"
              onClick={() => handleChipClick('category', 'Finance')}
              className="text-ink-secondary text-xs font-semibold bg-white hover:bg-brand-bluelight border border-surface-mid hover:border-brand-blue px-3.5 py-1.5 rounded-full cursor-pointer transition-all focus:outline-none"
            >
              Finance 💰
            </button>
            <button
              type="button"
              onClick={() => handleChipClick('location', 'Remote')}
              className="text-ink-secondary text-xs font-semibold bg-white hover:bg-brand-bluelight border border-surface-mid hover:border-brand-blue px-3.5 py-1.5 rounded-full cursor-pointer transition-all focus:outline-none"
            >
              WFH 🌐
            </button>
          </div>
        </div>

        {/* Right Column - Premium Overlapping Workspace Collage */}
        <div className="hidden lg:flex justify-center items-center h-full relative">
          <div className="relative w-full h-[450px] flex items-center justify-center">

            {/* Background Accent glow */}
            <div className="absolute w-72 h-72 rounded-full bg-blue-400/10 blur-2xl -z-10" />

            {/* Main Image Card (AI Generated - Students & Interns Collaborating) */}
            <div className="w-[88%] h-[92%] rounded-xl2 overflow-hidden shadow-lift border-4 border-white relative group">
              <img
                src="/hero-interns.jpg"
                alt="Students and interns collaborating in a modern tech office"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Overlapping Placement Success Widget */}
            <div className="absolute -right-4 bottom-12 bg-white rounded-card shadow-lift p-4 border border-surface-mid animate-float select-none w-48 flex flex-col gap-1.5">
              <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider block">Placements</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-display font-extrabold text-brand-blue">12.8k+</span>
                <span className="text-brand-teal text-xs font-bold">↑</span>
              </div>
              <div className="flex -space-x-2 overflow-hidden mt-1">
                {/* Micro avatar placeholders */}
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-700">AR</div>
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-purple-100 flex items-center justify-center text-[8px] font-bold text-purple-700">SK</div>
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-teal-100 flex items-center justify-center text-[8px] font-bold text-teal-700">PM</div>
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-amber-100 flex items-center justify-center text-[8px] font-bold text-amber-700">TC</div>
              </div>
            </div>

            {/* Overlapping Verified PPO Offer Toast */}
            <div
              style={{ animationDelay: '2s' }}
              className="absolute -left-4 top-16 bg-white rounded-card shadow-lift p-3 border border-surface-mid flex items-center gap-3 animate-float select-none"
            >
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-brand-teal text-sm font-bold">
                ✓
              </div>
              <div>
                <p className="text-[11px] text-ink-primary font-bold">
                  TechCorp extended a PPO!
                </p>
                <p className="text-[9px] text-ink-muted">
                  Stipend: Rs. 25,000/mo
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
