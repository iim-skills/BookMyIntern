'use client';

import Link from 'next/link';
import Footer from '@/components/home/Footer';

export default function PressPage() {
  const releases = [
    {
      date: 'August 15, 2026',
      title: 'BookMyIntern Crosses 12,000 Verified Student Placements Across 500+ Indian Campuses',
      summary: 'Platform reports 340% YoY growth in tech & product design internship hiring as startups shift toward pre-vetted proof-of-work hiring models.',
      tag: 'Milestone',
    },
    {
      date: 'June 20, 2026',
      title: 'BookMyIntern Launches Zero-Spam Recruiter Verification Shield and Guaranteed Stipend Framework',
      summary: 'New mandatory employer KYC policy ensures every internship listed on the platform provides verified mentor oversight and fair monetary compensation.',
      tag: 'Product',
    },
    {
      date: 'April 02, 2026',
      title: 'BookMyIntern Partners with Leading Tier-2 & Tier-3 State Engineering Colleges for Direct Campus Recruiting',
      summary: 'Initiative bridges the geographic talent gap, connecting students from over 120 cities directly with remote and hybrid startup opportunities in Bangalore, Mumbai, and NCR.',
      tag: 'Partnership',
    },
  ];

  const mentions = [
    {
      outlet: 'YourStory',
      quote: '"BookMyIntern is rewriting the rules of campus recruiting by removing black-box applications and giving students direct access to startup founders."',
      date: 'July 2026',
    },
    {
      outlet: 'Tech in Asia',
      quote: '"By enforcing strict stipend transparency and verified employer profiles, BookMyIntern has become the go-to discovery portal for Indian tech freshers."',
      date: 'May 2026',
    },
    {
      outlet: 'Inc42',
      quote: '"A game changer for early-stage startup hiring teams who need high-signal interns without paying exorbitant recruiter commissions."',
      date: 'March 2026',
    },
  ];

  return (
    <main className="min-h-screen bg-surface-page font-body pt-20">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF] py-16 border-b border-surface-mid">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block">
              Newsroom & Media
            </span>
            <h1 className="font-display font-extrabold text-3xl md:text-5xl text-ink-primary tracking-tight mb-4">
              BookMyIntern Press & Brand Kit
            </h1>
            <p className="text-ink-secondary text-base md:text-lg leading-relaxed mb-6">
              Official news announcements, platform statistics, media assets, and executive commentary for journalists and publications.
            </p>
            <div className="flex items-center gap-3 select-none">
              <a
                href="mailto:press@bookmyintern.com"
                className="bg-brand-blue hover:bg-brand-bluedark text-white font-semibold text-xs px-5 py-2.5 rounded-[8px] shadow-blue transition-all decoration-none"
              >
                Media Inquiries: press@bookmyintern.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-14 max-w-7xl mx-auto px-6">
        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="bg-white rounded-card p-5 border border-surface-mid text-center shadow-card">
            <span className="font-display font-extrabold text-2xl md:text-3xl text-brand-blue block mb-1">12,800+</span>
            <span className="text-xs text-ink-secondary font-medium">Students Placed</span>
          </div>
          <div className="bg-white rounded-card p-5 border border-surface-mid text-center shadow-card">
            <span className="font-display font-extrabold text-2xl md:text-3xl text-brand-indigo block mb-1">1,450+</span>
            <span className="text-xs text-ink-secondary font-medium">Verified Companies</span>
          </div>
          <div className="bg-white rounded-card p-5 border border-surface-mid text-center shadow-card">
            <span className="font-display font-extrabold text-2xl md:text-3xl text-brand-teal block mb-1">₹18,500</span>
            <span className="text-xs text-ink-secondary font-medium">Avg Monthly Stipend</span>
          </div>
          <div className="bg-white rounded-card p-5 border border-surface-mid text-center shadow-card">
            <span className="font-display font-extrabold text-2xl md:text-3xl text-brand-amber block mb-1">500+</span>
            <span className="text-xs text-ink-secondary font-medium">Partner Universities</span>
          </div>
        </div>

        {/* Press Releases Section */}
        <div className="mb-16">
          <h2 className="font-display font-bold text-2xl text-ink-primary mb-6">
            Press Releases & Announcements
          </h2>
          <div className="space-y-4">
            {releases.map((rel, idx) => (
              <div
                key={idx}
                className="bg-white rounded-card border border-surface-mid p-6 shadow-card hover:shadow-lift hover:border-blue-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 mb-2 select-none">
                    <span className="bg-brand-bluelight text-brand-blue text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {rel.tag}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {rel.date}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base md:text-lg text-ink-primary mb-1">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {rel.summary}
                  </p>
                </div>
                <button
                  onClick={() => alert(`Viewing press release: "${rel.title}"`)}
                  className="text-xs font-semibold text-brand-blue hover:underline whitespace-nowrap"
                >
                  Read Release &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Media Quotes */}
        <div className="mb-16">
          <h2 className="font-display font-bold text-2xl text-ink-primary mb-6">
            What the Media is Saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mentions.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-card border border-surface-mid p-6 shadow-card flex flex-col justify-between"
              >
                <p className="text-xs text-ink-secondary italic leading-relaxed mb-6">
                  {item.quote}
                </p>
                <div className="pt-4 border-t border-surface-mid flex justify-between items-center select-none">
                  <span className="font-display font-bold text-sm text-ink-primary">
                    {item.outlet}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {item.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Assets & Media Kit */}
        <div className="bg-white rounded-xl2 border border-surface-mid p-8 shadow-lift">
          <h2 className="font-display font-bold text-2xl text-ink-primary mb-2">
            Brand Assets & Guidelines
          </h2>
          <p className="text-xs text-ink-secondary mb-8">
            Feel free to use our official logos and color tokens when featuring BookMyIntern in publications.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Logo Preview */}
            <div className="bg-surface-page rounded-card p-6 border border-surface-mid flex flex-col items-center justify-center text-center">
              <div className="mb-4">
                <span className="font-display font-extrabold text-ink-primary text-2xl tracking-tight">Book</span>
                <span className="font-display font-extrabold text-brand-blue text-2xl tracking-tight">My</span>
                <span className="font-display font-extrabold text-ink-primary text-2xl tracking-tight">Intern</span>
              </div>
              <span className="text-xs font-semibold text-ink-muted mb-3">Primary Light Logo</span>
              <button
                onClick={() => alert('Brand SVG logos copied / downloaded')}
                className="text-xs font-bold text-brand-blue bg-white border border-surface-mid px-3.5 py-1.5 rounded-[6px] hover:bg-brand-bluelight"
              >
                Download SVG
              </button>
            </div>

            {/* Dark Logo Preview */}
            <div className="bg-brand-navy rounded-card p-6 flex flex-col items-center justify-center text-center">
              <div className="mb-4">
                <span className="font-display font-extrabold text-white text-2xl tracking-tight">Book</span>
                <span className="font-display font-extrabold text-brand-blue text-2xl tracking-tight">My</span>
                <span className="font-display font-extrabold text-white text-2xl tracking-tight">Intern</span>
              </div>
              <span className="text-xs font-semibold text-white/50 mb-3">Primary Dark Logo</span>
              <button
                onClick={() => alert('Brand SVG logos copied / downloaded')}
                className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-[6px]"
              >
                Download SVG
              </button>
            </div>

            {/* Color Palette */}
            <div className="bg-surface-page rounded-card p-6 border border-surface-mid flex flex-col justify-center space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2563EB] shadow-sm" />
                <span className="text-xs font-mono text-ink-primary">#2563EB (Brand Blue)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0F172A] shadow-sm" />
                <span className="text-xs font-mono text-ink-primary">#0F172A (Brand Navy)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0D9488] shadow-sm" />
                <span className="text-xs font-mono text-ink-primary">#0D9488 (Teal Success)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
