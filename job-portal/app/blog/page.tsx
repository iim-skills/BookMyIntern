'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/home/Footer';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: {
    name: string;
    role: string;
    avatarInitials: string;
    avatarColor: string;
  };
  featured?: boolean;
}

const POSTS: BlogPost[] = [
  {
    id: 'crack-technical-internship-interview-2026',
    title: 'How to Crack Frontend & Full-Stack Tech Internship Interviews in 2026',
    excerpt: 'A comprehensive roadmap on system design basics, Live coding rounds, React state management questions, and building proof-of-work repositories that recruiters love.',
    category: 'Interview Prep',
    readTime: '6 min read',
    date: 'Aug 28, 2026',
    featured: true,
    author: {
      name: 'Vikram Mehta',
      role: 'VP Engineering',
      avatarInitials: 'VM',
      avatarColor: 'bg-blue-100 text-blue-700',
    },
  },
  {
    id: 'resume-mistakes-freshers-make',
    title: '7 Resume Mistakes College Freshers Make (And How to Fix Them in 10 Minutes)',
    excerpt: 'Why 2-page resumes get automatically filtered out by ATS parsers and how to quantify your college project achievements with measurable metrics.',
    category: 'Resume & Portfolio',
    readTime: '4 min read',
    date: 'Aug 22, 2026',
    author: {
      name: 'Pooja Iyer',
      role: 'Head of Product',
      avatarInitials: 'PI',
      avatarColor: 'bg-purple-100 text-purple-700',
    },
  },
  {
    id: 'internship-to-full-time-ppo-guide',
    title: 'Converting Your 3-Month Summer Internship into a Full-Time PPO Offer',
    excerpt: 'Actionable strategies from top engineers on code reviews, stakeholder communication, ownership mindset, and asking for performance reviews.',
    category: 'Career Advice',
    readTime: '5 min read',
    date: 'Aug 18, 2026',
    author: {
      name: 'Aarav Sharma',
      role: 'CEO & Founder',
      avatarInitials: 'AS',
      avatarColor: 'bg-teal-100 text-teal-700',
    },
  },
  {
    id: 'stipend-trends-india-internships',
    title: 'Internship Stipend Benchmark Report: What Tech & Design Interns Earn in India',
    excerpt: 'Detailed compensation benchmarks across Tier-1 vs Remote startups, stipend expectations for software vs marketing roles, and negotiation tips.',
    category: 'Salary & Stipend',
    readTime: '7 min read',
    date: 'Aug 12, 2026',
    author: {
      name: 'Sneha Patel',
      role: 'University Relations',
      avatarInitials: 'SP',
      avatarColor: 'bg-amber-100 text-amber-700',
    },
  },
  {
    id: 'building-killer-uiux-case-study',
    title: 'How to Build a High-Converting UI/UX Case Study Without Real Client Work',
    excerpt: 'Step-by-step framework to redesign existing products, conduct guerrilla user research, and present prototypes that catch hiring managers’ attention.',
    category: 'Design & Product',
    readTime: '5 min read',
    date: 'Aug 05, 2026',
    author: {
      name: 'Pooja Iyer',
      role: 'Head of Product',
      avatarInitials: 'PI',
      avatarColor: 'bg-rose-100 text-rose-700',
    },
  },
  {
    id: 'ai-tools-for-software-engineering-interns',
    title: 'Top AI Coding Assistants Every Engineering Intern Should Master in 2026',
    excerpt: 'Using AI tools responsibly to write unit tests, explain legacy codebases, and speed up debugging without skipping fundamental algorithmic understanding.',
    category: 'Tech Trends',
    readTime: '4 min read',
    date: 'Jul 29, 2026',
    author: {
      name: 'Vikram Mehta',
      role: 'VP Engineering',
      avatarInitials: 'VM',
      avatarColor: 'bg-indigo-100 text-indigo-700',
    },
  },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const categories = ['All', 'Interview Prep', 'Resume & Portfolio', 'Career Advice', 'Salary & Stipend', 'Design & Product', 'Tech Trends'];

  const filteredPosts = POSTS.filter((post) => {
    const matchCategory = activeCategory === 'All' || post.category.toLowerCase() === activeCategory.toLowerCase();
    const matchSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      post.author.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const featuredPost = POSTS.find((p) => p.featured) || POSTS[0];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setEmailSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <main className="min-h-screen bg-surface-page font-body pt-20">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF] py-14 border-b border-surface-mid">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block">
              BookMyIntern Career Hub & Blog
            </span>
            <h1 className="font-display font-extrabold text-3xl md:text-5xl text-ink-primary tracking-tight mb-4">
              Insights, Guides & Interview Prep
            </h1>
            <p className="text-ink-secondary text-base md:text-lg leading-relaxed mb-8">
              Practical roadmaps, resume frameworks, and hiring secrets directly from tech leads and startup founders.
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
                placeholder="Search articles by topic, keyword, or author..."
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
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-10 select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm font-medium px-4 py-2 rounded-full cursor-pointer transition-all duration-200 border whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-brand-blue text-white border-brand-blue shadow-blue'
                  : 'bg-white border-surface-mid text-ink-secondary hover:border-brand-blue hover:text-brand-blue'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post Card (shown when category is All and no search) */}
        {activeCategory === 'All' && !search && (
          <div className="mb-12 bg-white rounded-xl2 border border-surface-mid shadow-lift overflow-hidden hover:border-blue-300 transition-all group">
            <div className="p-8 md:p-10 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-4 select-none">
                <span className="bg-brand-bluelight text-brand-blue text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                  Featured Guide
                </span>
                <span className="text-xs text-ink-muted">
                  {featuredPost.date} &bull; {featuredPost.readTime}
                </span>
              </div>

              <h2 className="font-display font-extrabold text-2xl md:text-3xl text-ink-primary group-hover:text-brand-blue transition-colors mb-3 leading-snug">
                {featuredPost.title}
              </h2>

              <p className="text-ink-secondary text-sm md:text-base leading-relaxed mb-6 max-w-3xl">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-surface-mid select-none">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${featuredPost.author.avatarColor}`}>
                    {featuredPost.author.avatarInitials}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-ink-primary block leading-none">
                      {featuredPost.author.name}
                    </span>
                    <span className="text-xs text-ink-muted mt-0.5 block">
                      {featuredPost.author.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Opening guide: "${featuredPost.title}"`)}
                  className="text-xs font-semibold text-brand-blue bg-brand-bluelight hover:bg-brand-blue hover:text-white px-4 py-2 rounded-[8px] transition-all"
                >
                  Read Article &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-card border border-surface-mid shadow-card hover:shadow-lift hover:border-blue-200 transition-all duration-200 p-6 flex flex-col justify-between group"
            >
              <div>
                {/* Meta Header */}
                <div className="flex justify-between items-center mb-3 select-none">
                  <span className="text-xs font-semibold text-brand-indigo bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {post.readTime}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-base md:text-lg text-ink-primary group-hover:text-brand-blue transition-colors mb-2 leading-snug line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-xs text-ink-secondary leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              {/* Author & Date Footer */}
              <div className="pt-4 border-t border-surface-mid flex items-center justify-between mt-auto select-none">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${post.author.avatarColor}`}>
                    {post.author.avatarInitials}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ink-primary block leading-none">
                      {post.author.name}
                    </span>
                    <span className="text-[10px] text-ink-muted">
                      {post.date}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Opening article: "${post.title}"`)}
                  className="text-xs font-semibold text-brand-blue hover:underline"
                >
                  Read &rarr;
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Callout Box */}
        <div className="bg-gradient-to-br from-brand-navy to-brand-bluedark text-white rounded-xl2 p-8 md:p-12 text-center max-w-3xl mx-auto shadow-lift">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-2 block">
            Weekly Career Dispatch
          </span>
          <h3 className="font-display font-bold text-2xl md:text-3xl text-white mb-3">
            Get the latest internship openings in your inbox
          </h3>
          <p className="text-white/70 text-sm max-w-xl mx-auto mb-6">
            Join 45,000+ college students getting curated internship openings, interview guides, and salary reports every Tuesday.
          </p>

          {emailSubscribed ? (
            <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 px-6 py-3 rounded-[8px] text-sm max-w-md mx-auto">
              ✓ You are subscribed! Check your inbox for the latest dispatch.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your college email..."
                className="px-4 py-3 rounded-[8px] text-sm text-ink-primary bg-white focus:outline-none flex-1"
              />
              <button
                type="submit"
                className="bg-brand-blue hover:bg-brand-bluedark text-white font-semibold text-sm px-6 py-3 rounded-[8px] transition-all shadow-blue whitespace-nowrap cursor-pointer border-none"
              >
                Subscribe Free
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
