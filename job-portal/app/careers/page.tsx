'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/home/Footer';

interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
}

const OPENINGS: JobOpening[] = [
  {
    id: 'senior-fullstack-engineer',
    title: 'Senior Full-Stack Engineer (Next.js & Node.js)',
    department: 'Engineering',
    location: 'Bangalore / Remote',
    type: 'Full-time',
    experience: '3–5 yrs',
    description: 'Lead core architecture for high-throughput candidate matching, Next.js server components, and distributed WebSockets messenger.',
  },
  {
    id: 'product-designer-uiux',
    title: 'Senior Product Designer (UI/UX)',
    department: 'Design',
    location: 'Bangalore / Remote',
    type: 'Full-time',
    experience: '2–4 yrs',
    description: 'Shape the next generation of our design system, recruiter applicant tracking kanbans, and high-conversion student portals.',
  },
  {
    id: 'growth-marketing-lead',
    title: 'Growth & Campus Marketing Lead',
    department: 'Marketing & Growth',
    location: 'Bangalore / Hybrid',
    type: 'Full-time',
    experience: '2–4 yrs',
    description: 'Scale university outreach, college ambassador networks, and organic acquisition across 500+ Indian campuses.',
  },
  {
    id: 'developer-relations-intern',
    title: 'Developer Relations & Community Intern',
    department: 'Developer Community',
    location: 'Remote',
    type: 'Internship',
    experience: 'Fresher / College Final Year',
    description: 'Organize student hackathons, host technical AMAs, write developer blogs, and support engineering student communities.',
  },
  {
    id: 'recruiter-success-specialist',
    title: 'Recruiter Success & Account Manager',
    department: 'Operations',
    location: 'Bangalore',
    type: 'Full-time',
    experience: '1–3 yrs',
    description: 'Onboard fast-growing startup founders and enterprise talent acquisition teams onto BookMyIntern verification pipelines.',
  },
];

export default function CareersPage() {
  const [selectedDept, setSelectedDept] = useState('All');
  const [appliedRole, setAppliedRole] = useState<string | null>(null);

  const departments = ['All', 'Engineering', 'Design', 'Marketing & Growth', 'Developer Community', 'Operations'];

  const filteredJobs = OPENINGS.filter((j) => {
    return selectedDept === 'All' || j.department.toLowerCase() === selectedDept.toLowerCase();
  });

  const perks = [
    { icon: '🏠', title: 'Remote-First Culture', desc: 'Work from anywhere in India or our collaborative tech hub in Indiranagar, Bangalore.' },
    { icon: '💻', title: 'Latest Gear & Setup', desc: 'Top-spec MacBook Pro + ₹25,000 work-from-home ergonomics allowance.' },
    { icon: '📚', title: '₹50k/yr Learning Budget', desc: 'Conferences, technical courses, books, and certifications fully sponsored.' },
    { icon: '🏥', title: 'Comprehensive Health Cover', desc: '₹5,00,000 health insurance for you and your direct dependents + mental health support.' },
    { icon: '📈', title: 'Generous ESOPs & Bonuses', desc: 'Direct equity ownership and merit-based performance bonuses from day one.' },
    { icon: '🌴', title: 'Unlimited Flexi PTO', desc: 'Rest when you need to. We focus on impact and code quality, not clocked hours.' },
  ];

  return (
    <main className="min-h-screen bg-surface-page font-body pt-20">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF] py-20 border-b border-surface-mid">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block">
            We are hiring!
          </span>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-ink-primary tracking-tight leading-[1.15] mb-6">
            Build the future of hiring with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-teal">
              BookMyIntern
            </span>
          </h1>
          <p className="text-ink-secondary text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            We are a high-velocity, ambitious team on a mission to empower 1 crore Indian freshers with verified, dignified internships.
          </p>
          <a
            href="#openings"
            className="bg-brand-blue hover:bg-brand-bluedark text-white font-semibold px-8 py-3.5 rounded-[10px] shadow-blue transition-all duration-200 decoration-none inline-block"
          >
            Explore Open Roles ({OPENINGS.length})
          </a>
        </div>
      </section>

      {/* Perks Grid */}
      <section className="py-20 bg-white border-b border-surface-mid">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block">
              Perks & Benefits
            </span>
            <h2 className="font-display font-bold text-3xl text-ink-primary">
              Why our team loves working here
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((p, idx) => (
              <div
                key={idx}
                className="bg-surface-page/60 rounded-card p-6 border border-surface-mid flex flex-col items-start gap-3 hover:shadow-lift hover:border-brand-blue transition-all"
              >
                <span className="text-3xl mb-1">{p.icon}</span>
                <h3 className="font-display font-bold text-base text-ink-primary">{p.title}</h3>
                <p className="text-xs text-ink-secondary leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings Section */}
      <section id="openings" className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-2 block">
              Join the crew
            </span>
            <h2 className="font-display font-bold text-3xl text-ink-primary">
              Current Job Openings
            </h2>
          </div>

          {/* Department Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 select-none">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full cursor-pointer transition-all duration-200 border whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-brand-blue text-white border-brand-blue shadow-blue'
                    : 'bg-white border-surface-mid text-ink-secondary hover:border-brand-blue hover:text-brand-blue'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Roles List */}
        <div className="space-y-4 mb-14">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-card border border-surface-mid p-6 shadow-card hover:shadow-lift hover:border-blue-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2 select-none">
                  <span className="bg-brand-bluelight text-brand-blue text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {job.department}
                  </span>
                  <span className="text-xs text-ink-muted">
                    📍 {job.location} &bull; 💼 {job.type} &bull; ⏱️ {job.experience}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-ink-primary mb-1">
                  {job.title}
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  {job.description}
                </p>
              </div>

              <button
                onClick={() => setAppliedRole(job.title)}
                className="bg-brand-blue hover:bg-brand-bluedark text-white font-semibold text-xs px-5 py-2.5 rounded-[8px] whitespace-nowrap shadow-blue transition-all cursor-pointer border-none flex-shrink-0"
              >
                Apply for Role &rarr;
              </button>
            </div>
          ))}
        </div>

        {/* General Application Callout */}
        <div className="bg-white rounded-xl2 border border-surface-mid p-8 text-center max-w-2xl mx-auto shadow-card">
          <span className="text-2xl mb-2 block">📬</span>
          <h3 className="font-display font-bold text-lg text-ink-primary mb-1">
            Don't see an exact match?
          </h3>
          <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
            We are always scouting exceptional engineers, designers, and community leaders. Send your portfolio directly to our leadership team.
          </p>
          <a
            href="mailto:careers@bookmyintern.com"
            className="text-xs font-bold text-brand-blue bg-brand-bluelight hover:bg-brand-blue hover:text-white px-4 py-2 rounded-[8px] transition-all decoration-none inline-block"
          >
            Email careers@bookmyintern.com
          </a>
        </div>
      </section>

      {/* Simple Apply Modal Mock */}
      {appliedRole && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl2 max-w-md w-full p-6 shadow-lift border border-surface-mid">
            <h3 className="font-display font-bold text-lg text-ink-primary mb-1">
              Apply for {appliedRole}
            </h3>
            <p className="text-xs text-ink-secondary mb-4">
              Send your resume and brief introduction to join our team.
            </p>
            <div className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-3 py-2 border border-surface-mid rounded-[8px] text-xs"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-3 py-2 border border-surface-mid rounded-[8px] text-xs"
              />
              <input
                type="text"
                placeholder="LinkedIn or GitHub Profile URL"
                className="w-full px-3 py-2 border border-surface-mid rounded-[8px] text-xs"
              />
              <textarea
                rows={3}
                placeholder="Why do you want to join BookMyIntern?"
                className="w-full px-3 py-2 border border-surface-mid rounded-[8px] text-xs resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setAppliedRole(null)}
                className="px-4 py-2 border border-surface-mid text-ink-secondary text-xs rounded-[8px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Thank you! Your application has been received by the BookMyIntern talent team.');
                  setAppliedRole(null);
                }}
                className="px-4 py-2 bg-brand-blue text-white text-xs font-semibold rounded-[8px]"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
