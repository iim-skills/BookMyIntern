'use client';

import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function CTABanner() {
  const revealRef = useScrollReveal();

  return (
    <section
      ref={revealRef}
      style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
      className="py-20 bg-gradient-to-br from-brand-navy via-brand-bluedark to-brand-indigo text-center relative overflow-hidden"
    >
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-6 relative z-10">
        
        {/* Headline */}
        <h2 className="font-display font-extrabold text-4xl text-white mb-4">
          Your next internship is one search away.
        </h2>

        {/* Subtitle */}
        <p className="text-white/70 text-lg mb-10">
          Join 3.2 lakh students already using BookMyIntern.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center select-none">
          <Link
            href="/jobs"
            className="bg-white text-brand-blue font-semibold px-8 py-4 rounded-[8px] hover:bg-surface-page transition-all text-base decoration-none inline-block"
          >
            Browse Internships
          </Link>
          <Link
            href="/signup?role=recruiter"
            className="border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-[8px] hover:bg-white/10 transition-all text-base decoration-none inline-block"
          >
            Post a Job Free
          </Link>
        </div>

        {/* Bullet Info text */}
        <span className="text-white/50 text-sm mt-8 block select-none">
          No credit card required &bull; Free for students &bull; Takes 2 minutes
        </span>

      </div>
    </section>
  );
}
