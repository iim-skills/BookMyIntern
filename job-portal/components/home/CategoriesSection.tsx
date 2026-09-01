'use client';

import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface CategoryItem {
  name: string;
  queryParam: string;
  bgClass: string;
  emoji: string;
  roles: string;
}

export default function CategoriesSection() {
  const revealRef = useScrollReveal();

  const categories: CategoryItem[] = [
    { name: 'Engineering', queryParam: 'Engineering', bgClass: 'bg-blue-50', emoji: '💻', roles: '2,400+ roles' },
    { name: 'Design', queryParam: 'Design', bgClass: 'bg-purple-50', emoji: '🎨', roles: '890+ roles' },
    { name: 'Marketing', queryParam: 'Marketing', bgClass: 'bg-rose-50', emoji: '📣', roles: '1,200+ roles' },
    { name: 'Data & AI', queryParam: 'Data & AI', bgClass: 'bg-indigo-50', emoji: '🤖', roles: '760+ roles' },
    { name: 'Finance', queryParam: 'Finance', bgClass: 'bg-amber-50', emoji: '💰', roles: '540+ roles' },
    { name: 'HR & People', queryParam: 'HR', bgClass: 'bg-teal-50', emoji: '🤝', roles: '320+ roles' },
    { name: 'Content', queryParam: 'Content', bgClass: 'bg-green-50', emoji: '✍️', roles: '680+ roles' },
    { name: 'Operations', queryParam: 'Operations', bgClass: 'bg-orange-50', emoji: '⚙️', roles: '410+ roles' },
  ];

  return (
    <section
      ref={revealRef}
      style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
      className="py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12 select-none">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-blue mb-3 block">
            Browse by category
          </span>
          <h2 className="font-display font-bold text-3xl text-ink-primary">
            Every field. Every city. One platform.
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/jobs?category=${encodeURIComponent(cat.queryParam)}`}
              className="group relative bg-white border border-surface-mid rounded-[12px] p-6 flex flex-col items-start gap-3 hover:-translate-y-1 hover:shadow-lift hover:border-brand-blue transition-all duration-200 cursor-pointer decoration-none"
            >
              {/* Icon Area */}
              <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center text-2xl ${cat.bgClass}`}>
                {cat.emoji}
              </div>

              {/* Category Name */}
              <h3 className="font-display font-bold text-base text-ink-primary group-hover:text-brand-blue transition-colors">
                {cat.name}
              </h3>

              {/* Open Roles Count */}
              <span className="text-sm text-ink-muted">
                {cat.roles}
              </span>

              {/* Arrow */}
              <span className="absolute top-4 right-4 text-ink-muted group-hover:text-brand-blue group-hover:translate-x-1 transition-all">
                &rarr;
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
