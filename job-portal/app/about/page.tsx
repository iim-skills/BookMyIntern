'use client';

import Link from 'next/link';
import Footer from '@/components/home/Footer';

export default function AboutPage() {
  const values = [
    {
      icon: '🎯',
      title: 'Student-First Philosophy',
      description: 'We believe every fresher deserves equal access to high-quality, dignified internship opportunities with fair compensation and growth.',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      icon: '🛡️',
      title: '100% Verified Recruiters',
      description: 'Zero ghost companies. Every recruiter on BookMyIntern undergoes manual KYC, corporate email validation, and strict platform verification.',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      icon: '⚡',
      title: 'Zero Friction Hiring',
      description: 'Cut out outdated 10-page application forms. Apply in one click with your verified portfolio, chat directly with hiring managers, and get hired faster.',
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      icon: '⭐',
      title: 'Transparent Reputation',
      description: 'Two-way ratings ensure accountability. Interns review company mentorship culture, and recruiters evaluate candidate performance.',
      color: 'bg-amber-50 text-amber-700',
    },
  ];

  const milestones = [
    { number: '12,800+', label: 'Students Placed', sublabel: 'Across Top Startups & MNCs' },
    { number: '1,450+', label: 'Verified Employers', sublabel: 'Actively Hiring Interns' },
    { number: '500+', label: 'College Campuses', sublabel: 'Integrated Across India' },
    { number: '98.4%', label: 'Satisfaction Rate', sublabel: 'From Both Students & Hiring Managers' },
  ];

  const team = [
    {
      name: 'Aarav Sharma',
      role: 'Co-Founder & CEO',
      bio: 'Former Tech Lead at leading product startups. Passionate about fixing the broken campus hiring pipeline in India.',
      initials: 'AS',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      name: 'Pooja Iyer',
      role: 'Co-Founder & Head of Product',
      bio: 'Ex-Design Lead with 8+ years crafting scalable consumer platforms and intuitive student experiences.',
      initials: 'PI',
      color: 'bg-purple-100 text-purple-700',
    },
    {
      name: 'Vikram Mehta',
      role: 'VP of Engineering',
      bio: 'Distributed systems architect dedicated to zero-latency candidate matching and real-time messaging pipelines.',
      initials: 'VM',
      color: 'bg-teal-100 text-teal-700',
    },
    {
      name: 'Sneha Patel',
      role: 'Head of University Relations',
      bio: 'Partnering with 500+ Indian universities and placement cells to bridge academia with top tech employers.',
      initials: 'SP',
      color: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <main className="min-h-screen bg-surface-page font-body pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF] py-20 border-b border-surface-mid">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-bluelight border border-blue-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">Our Mission</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-ink-primary tracking-tight leading-[1.15] mb-6">
            Empowering India's next generation to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-teal">
              launch dream careers.
            </span>
          </h1>

          <p className="text-ink-secondary text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-10">
            BookMyIntern was founded with a singular ambition: eliminate unpaid, ghost, and spam listings to connect ambitious students directly with high-growth companies offering genuine mentorship and verified stipends.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/jobs"
              className="bg-brand-blue hover:bg-brand-bluedark text-white font-semibold px-7 py-3.5 rounded-[10px] shadow-blue transition-all duration-200 decoration-none"
            >
              Explore Open Internships
            </Link>
            <Link
              href="/signup?role=recruiter"
              className="bg-white hover:bg-surface-page border border-surface-mid hover:border-brand-blue text-ink-primary font-semibold px-7 py-3.5 rounded-[10px] shadow-card transition-all duration-200 decoration-none"
            >
              Hire Fresh Talent
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-16 bg-white border-b border-surface-mid">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {milestones.map((item, idx) => (
              <div
                key={idx}
                className="bg-surface-page/60 rounded-card p-6 border border-surface-mid flex flex-col items-center text-center hover:shadow-lift hover:border-brand-blue transition-all"
              >
                <span className="font-display font-extrabold text-3xl md:text-4xl text-brand-blue mb-1">
                  {item.number}
                </span>
                <span className="font-bold text-ink-primary text-base mb-1">
                  {item.label}
                </span>
                <span className="text-xs text-ink-muted leading-tight">
                  {item.sublabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-surface-page">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block">
              Why We Built BookMyIntern
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink-primary mb-6 leading-tight">
              Solving the great college-to-workplace disconnect.
            </h2>
            <div className="space-y-4 text-ink-secondary leading-relaxed text-base">
              <p>
                Every year, millions of brilliant college students across Tier-1, Tier-2, and Tier-3 cities in India graduate with strong technical and creative skills, but struggle with opaque job portals filled with dead listings, unpaid internships, and zero recruiter response.
              </p>
              <p>
                Meanwhile, fast-growing startups and enterprises waste countless hours sifting through unverified, generic resumes without reliable skill indicators or verified student authenticity.
              </p>
              <p>
                We built BookMyIntern to create an equitable, transparent bridge: verified company credentials, fast direct chat, standardized stipend guarantees, and transparent two-way feedback.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl2 border border-surface-mid p-8 shadow-lift space-y-6">
            <h3 className="font-display font-bold text-xl text-ink-primary mb-4">
              What sets BookMyIntern apart
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center font-bold flex-shrink-0">✓</div>
                <div>
                  <h4 className="font-bold text-sm text-ink-primary">Guaranteed Stipends</h4>
                  <p className="text-xs text-ink-secondary mt-0.5">Strict platform policy mandating fair compensation for intern efforts.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-brand-indigo flex items-center justify-center font-bold flex-shrink-0">✓</div>
                <div>
                  <h4 className="font-bold text-sm text-ink-primary">Pre-Placement Offer (PPO) Tracks</h4>
                  <p className="text-xs text-ink-secondary mt-0.5">Clearly tagged opportunities with verified conversion pathways to full-time roles.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-brand-teal flex items-center justify-center font-bold flex-shrink-0">✓</div>
                <div>
                  <h4 className="font-bold text-sm text-ink-primary">Direct Recruiter Messenger</h4>
                  <p className="text-xs text-ink-secondary mt-0.5">Chat in real-time with hiring managers without opaque black-box portals.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white border-t border-surface-mid">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block">
              Core Principles
            </span>
            <h2 className="font-display font-bold text-3xl text-ink-primary">
              The values that drive our engineering & community
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, idx) => (
              <div
                key={idx}
                className="bg-surface-page/50 rounded-card p-6 border border-surface-mid flex flex-col items-start gap-4 hover:shadow-lift hover:border-brand-blue transition-all"
              >
                <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center text-2xl ${v.color}`}>
                  {v.icon}
                </div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  {v.title}
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-surface-page border-t border-surface-mid">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block">
              Leadership
            </span>
            <h2 className="font-display font-bold text-3xl text-ink-primary">
              Meet the minds building BookMyIntern
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="bg-white rounded-card p-6 border border-surface-mid shadow-card flex flex-col items-center text-center hover:shadow-lift transition-all"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-display font-extrabold text-xl mb-4 ${member.color}`}>
                  {member.initials}
                </div>
                <h3 className="font-display font-bold text-base text-ink-primary mb-1">
                  {member.name}
                </h3>
                <span className="text-xs font-semibold text-brand-blue mb-3">
                  {member.role}
                </span>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-navy text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-4">
            Ready to find your next great opportunity?
          </h2>
          <p className="text-white/70 text-base mb-8">
            Join thousands of students and top recruiters already accelerating their careers on BookMyIntern.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="bg-brand-blue hover:bg-brand-bluedark text-white font-semibold px-8 py-3.5 rounded-[8px] shadow-blue transition-all decoration-none"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="border border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-3.5 rounded-[8px] transition-all decoration-none"
            >
              Contact Team
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
