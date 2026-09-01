'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function Testimonials() {
  const revealRef = useScrollReveal();

  const testimonials = [
    {
      initials: 'AR',
      avatarBg: 'bg-blue-100',
      avatarText: 'text-blue-700',
      quote: 'BookMyIntern got me a Data Science internship at a funded startup within 10 days of signing up. The one-click apply is a game changer.',
      name: 'Ananya R.',
      sub: 'Interned at DataMind',
    },
    {
      initials: 'SK',
      avatarBg: 'bg-purple-100',
      avatarText: 'text-purple-700',
      quote: 'I posted an internship and had 40 qualified applicants within 48 hours. The candidate profiles are detailed — resumes, skills, everything.',
      name: 'Saurabh K.',
      sub: 'HR Lead, PixelWorks',
    },
    {
      initials: 'PM',
      avatarBg: 'bg-teal-100',
      avatarText: 'text-teal-700',
      quote: 'I was a fresher with no experience. BookMyIntern helped me find a WFH role that matched exactly what I was learning. Now I have a PPO.',
      name: 'Priya M.',
      sub: 'Interned at GrowthLabs',
    },
  ];

  return (
    <section
      ref={revealRef}
      style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
      className="py-20 bg-surface-page"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12 select-none">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-blue mb-3 block">
            What students say
          </span>
          <h2 className="font-display font-bold text-3xl text-ink-primary">
            Real experiences from real interns.
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[12px] border border-surface-mid shadow-card p-6 flex flex-col gap-4 hover:shadow-lift transition-all duration-200 cursor-default"
            >
              {/* Quote Mark */}
              <span className="text-brand-indigo text-5xl font-display leading-none mb-0 select-none">
                &ldquo;
              </span>

              {/* Review Text */}
              <p className="text-ink-secondary text-sm leading-relaxed italic flex-1">
                {t.quote}
              </p>

              {/* Stars */}
              <div className="flex gap-0.5 text-brand-amber text-base select-none">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>

              {/* Divider */}
              <div className="border-t border-surface-mid pt-4" />

              {/* Bottom Row */}
              <div className="flex items-center gap-3 select-none">
                {/* Avatar Circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${t.avatarBg} ${t.avatarText}`}>
                  {t.initials}
                </div>
                {/* Name & Sub */}
                <div>
                  <h4 className="font-semibold text-sm text-ink-primary">
                    {t.name}
                  </h4>
                  <span className="text-xs text-ink-muted block">
                    {t.sub}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
