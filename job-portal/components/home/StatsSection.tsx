'use client';

import { useState, useEffect, useRef } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface CountUpProps {
  target: number;
  suffix: string;
  decimals?: number;
  duration?: number;
  startAnimate: boolean;
}

function CountUp({ target, suffix, decimals = 0, duration = 1500, startAnimate }: CountUpProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!startAnimate) return;
    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = progress * target;
      setValue(current);
      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };
    frameId = window.requestAnimationFrame(step);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [target, duration, startAnimate]);

  const formatted = value.toFixed(decimals);
  const displayVal = decimals === 0 
    ? parseInt(formatted).toLocaleString('en-IN') 
    : parseFloat(formatted).toFixed(decimals);

  return (
    <span>
      {displayVal}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const revealRef = useScrollReveal();
  const countRef = useRef<HTMLDivElement>(null);
  const [startAnimate, setStartAnimate] = useState(false);

  useEffect(() => {
    const el = countRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      target: 10000,
      suffix: '+',
      decimals: 0,
      label: 'Active Internships',
      iconBg: 'bg-blue-50',
      iconColor: 'text-brand-blue',
      svg: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      target: 3.2,
      suffix: 'L+',
      decimals: 1,
      label: 'Students Registered',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-brand-indigo',
      svg: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
    },
    {
      target: 89,
      suffix: '%',
      decimals: 0,
      label: 'Placement Rate',
      iconBg: 'bg-teal-50',
      iconColor: 'text-brand-teal',
      svg: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      target: 4200,
      suffix: '+',
      decimals: 0,
      label: 'Hiring Companies',
      iconBg: 'bg-amber-50',
      iconColor: 'text-brand-amber',
      svg: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  return (
    <section
      ref={revealRef}
      style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
      className="py-16 bg-surface-page"
    >
      <div ref={countRef} className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-[12px] shadow-card border border-surface-mid p-6 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lift transition-all duration-200 cursor-default select-none"
          >
            {/* Icon Circle */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${stat.iconBg} ${stat.iconColor}`}>
              {stat.svg}
            </div>

            {/* Number */}
            <div className="font-display font-extrabold text-3xl text-ink-primary mb-1">
              <CountUp
                target={stat.target}
                suffix={stat.suffix}
                decimals={stat.decimals}
                startAnimate={startAnimate}
              />
            </div>

            {/* Label */}
            <span className="text-sm text-ink-secondary font-medium">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
