'use client';

import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function HowItWorks() {
  const revealRef = useScrollReveal();
  const [activeTab, setActiveTab] = useState<'students' | 'recruiters'>('students');

  const studentSteps = [
    {
      num: '01',
      title: 'Create your profile',
      desc: "Add your skills, education, and what you're looking for.",
    },
    {
      num: '02',
      title: 'Browse & filter',
      desc: 'Search by role, city, stipend, duration, or category.',
    },
    {
      num: '03',
      title: 'Apply in one click',
      desc: 'No cover letter required. Your profile speaks for itself.',
    },
    {
      num: '04',
      title: 'Get hired',
      desc: 'Chat with recruiters, get shortlisted, and land your internship.',
    },
  ];

  const recruiterSteps = [
    {
      num: '01',
      title: 'Post a listing',
      desc: 'Publish an internship in under 3 minutes. Free to start.',
    },
    {
      num: '02',
      title: 'Review applicants',
      desc: 'Get matched candidates with full profiles, skills, and resumes.',
    },
    {
      num: '03',
      title: 'Shortlist & chat',
      desc: 'Message students directly. No middleman.',
    },
    {
      num: '04',
      title: 'Hire with confidence',
      desc: 'Verified student profiles. Built-in review system.',
    },
  ];

  const steps = activeTab === 'students' ? studentSteps : recruiterSteps;

  return (
    <section
      ref={revealRef}
      style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
      className="py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 select-none">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-blue mb-3 block">
            How it works
          </span>
          <h2 className="font-display font-bold text-3xl text-ink-primary">
            How it works
          </h2>
          <p className="text-ink-secondary text-base">
            Two sides, one platform. Here's how students and recruiters both win.
          </p>
        </div>

        {/* Centered Toggles */}
        <div className="flex justify-center mb-12 select-none">
          <div className="bg-surface-page rounded-full p-1 flex gap-1 inline-flex border border-surface-mid">
            <button
              onClick={() => setActiveTab('students')}
              className={`text-sm px-6 py-2.5 rounded-full cursor-pointer transition-all duration-200 border-none ${
                activeTab === 'students'
                  ? 'bg-brand-blue text-white font-semibold shadow-sm'
                  : 'text-ink-secondary hover:text-ink-primary bg-transparent'
              }`}
            >
              For Students
            </button>
            <button
              onClick={() => setActiveTab('recruiters')}
              className={`text-sm px-6 py-2.5 rounded-full cursor-pointer transition-all duration-200 border-none ${
                activeTab === 'recruiters'
                  ? 'bg-brand-indigo text-white font-semibold shadow-sm'
                  : 'text-ink-secondary hover:text-ink-primary bg-transparent'
              }`}
            >
              For Recruiters
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connecting Dashed Line (Desktop Only) */}
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-brand-indigo/30 z-0 pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-0 relative z-10">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center px-4"
              >
                {/* Number Circle */}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-display font-extrabold text-xl mb-4 border-2 bg-white shadow-card select-none ${
                    activeTab === 'students'
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-brand-indigo text-brand-indigo'
                  }`}
                >
                  {step.num}
                </div>

                {/* Step Title */}
                <h3 className="font-display font-bold text-base text-ink-primary mb-2">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-sm text-ink-secondary leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
