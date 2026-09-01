'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/home/Footer';

interface FAQItem {
  id: string;
  category: 'students' | 'recruiters' | 'account' | 'applications';
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'f1',
    category: 'students',
    question: 'Is BookMyIntern 100% free for students?',
    answer: 'Yes! Creating your profile, searching verified openings, uploading resumes, chatting with recruiters, and accepting internship offers on BookMyIntern is completely free for students. We never charge candidates any application fees.',
  },
  {
    id: 'f2',
    category: 'students',
    question: 'Are all internships on BookMyIntern paid?',
    answer: 'Yes. We strictly enforce a verified stipend policy across all listed internship roles. Unpaid, predatory, or volunteer roles masquerading as full-time internships are prohibited and automatically purged by our moderation system.',
  },
  {
    id: 'f3',
    category: 'applications',
    question: 'How do I apply for an internship with my resume?',
    answer: 'Navigate to "Browse Internships", click on any listing card or "Apply Now", fill in your contact information and experience, attach your PDF/DOC resume (up to 5MB), and submit. You can track application progress live from your Student Dashboard.',
  },
  {
    id: 'f4',
    category: 'applications',
    question: 'What do the application statuses (Pending, Reviewed, Interview, Selected) mean?',
    answer: '• Pending: Your application has been submitted and is awaiting recruiter review.\n• Reviewed: The hiring team has opened and inspected your resume and profile.\n• Interview: You have been shortlisted for an interview round.\n• On-Hold: Your profile is under consideration for upcoming batches.\n• Selected: Congratulations! The recruiter has selected you for the internship offer.\n• Rejected: The position has been filled or your profile did not match this specific opening.',
  },
  {
    id: 'f5',
    category: 'recruiters',
    question: 'How does recruiter firm verification work?',
    answer: 'Upon registering as a recruiter, you must complete firm verification with your corporate domain, official designation, firm website, and phone number. Our admin operations team verifies your business within 2 to 4 business hours before your job postings go live.',
  },
  {
    id: 'f6',
    category: 'recruiters',
    question: 'Can recruiters export candidate lists or perform bulk actions?',
    answer: 'Yes! From the Recruiter Dashboard, hiring managers can select multiple candidates to bulk invite for interviews, bulk shortlist, bulk reject, or export full candidate data (including emails, skills, and resume links) into a CSV spreadsheet.',
  },
  {
    id: 'f7',
    category: 'account',
    question: 'How do I enable Two-Factor Authentication (2FA) for extra security?',
    answer: 'Go to your Profile settings (/profile), navigate to the "Security & Two-Factor Authentication" panel, and toggle on Email 2FA. Every time you log in, a 6-digit secure code will be sent to your registered email.',
  },
  {
    id: 'f8',
    category: 'account',
    question: 'How do I revoke all active sessions ("Logout Everywhere")?',
    answer: 'If you logged in from a public computer or suspect unauthorized access, go to /profile and click "Logout Everywhere". This immediately increments your token version and invalidates all other active browser sessions.',
  },
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openFAQ, setOpenFAQ] = useState<string | null>('f1');
  const [search, setSearch] = useState('');

  const filteredFaqs = FAQS.filter((f) => {
    const matchCategory = activeCategory === 'all' || f.category === activeCategory;
    const matchSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const toggleAccordion = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <main className="min-h-screen bg-surface-page font-body pt-20">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF] py-16 border-b border-surface-mid">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block">
            Support & Knowledge Base
          </span>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl text-ink-primary tracking-tight mb-4">
            How can we help you today?
          </h1>
          <p className="text-ink-secondary text-base md:text-lg leading-relaxed mb-8">
            Find answers to common questions about applications, recruiter verification, chats, and account security.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-card border border-surface-mid shadow-lift p-2 flex items-center gap-3 max-w-xl mx-auto">
            <svg className="w-5 h-5 text-ink-muted ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help topics (e.g. stipend, 2FA, resume, verification)..."
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
      </section>

      {/* Main Content */}
      <section className="py-14 max-w-5xl mx-auto px-6">
        {/* Category Pills */}
        <div className="flex gap-2 justify-center overflow-x-auto pb-4 mb-10 select-none">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'students', label: 'For Students' },
            { id: 'recruiters', label: 'For Recruiters' },
            { id: 'applications', label: 'Applications & Status' },
            { id: 'account', label: 'Account & Security' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-sm font-medium px-4 py-2 rounded-full cursor-pointer transition-all duration-200 border whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-brand-blue text-white border-brand-blue shadow-blue'
                  : 'bg-white border-surface-mid text-ink-secondary hover:border-brand-blue hover:text-brand-blue'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-4 mb-16">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-card p-8 text-center border border-surface-mid">
              <p className="text-sm text-ink-secondary mb-3">No matching questions found.</p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('all'); }}
                className="text-xs text-brand-blue font-semibold hover:underline"
              >
                Reset search
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFAQ === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-card border border-surface-mid shadow-card overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-5 text-left flex justify-between items-center gap-4 bg-transparent border-none cursor-pointer hover:bg-surface-page/50 transition-colors"
                  >
                    <span className="font-display font-bold text-base text-ink-primary">
                      {faq.question}
                    </span>
                    <span className={`text-brand-blue font-bold text-lg transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      ▾
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-ink-secondary leading-relaxed border-t border-surface-mid/50 whitespace-pre-line bg-surface-page/30">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact Support Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-card p-6 border border-surface-mid shadow-card flex flex-col justify-between">
            <div>
              <span className="text-2xl mb-2 block">✉️</span>
              <h3 className="font-display font-bold text-base text-ink-primary mb-1">Email Support</h3>
              <p className="text-xs text-ink-secondary leading-relaxed mb-4">
                Our support team is available Mon–Sat from 9 AM to 7 PM IST.
              </p>
            </div>
            <a
              href="mailto:support@bookmyintern.com"
              className="text-xs font-bold text-brand-blue hover:underline"
            >
              support@bookmyintern.com &rarr;
            </a>
          </div>

          <div className="bg-white rounded-card p-6 border border-surface-mid shadow-card flex flex-col justify-between">
            <div>
              <span className="text-2xl mb-2 block">🏢</span>
              <h3 className="font-display font-bold text-base text-ink-primary mb-1">Recruiter Desk</h3>
              <p className="text-xs text-ink-secondary leading-relaxed mb-4">
                Need expedited firm verification or bulk campus hiring assistance?
              </p>
            </div>
            <a
              href="mailto:recruiter@bookmyintern.com"
              className="text-xs font-bold text-brand-indigo hover:underline"
            >
              recruiter@bookmyintern.com &rarr;
            </a>
          </div>

          <div className="bg-white rounded-card p-6 border border-surface-mid shadow-card flex flex-col justify-between">
            <div>
              <span className="text-2xl mb-2 block">💬</span>
              <h3 className="font-display font-bold text-base text-ink-primary mb-1">Contact Form</h3>
              <p className="text-xs text-ink-secondary leading-relaxed mb-4">
                Submit an inquiry directly through our interactive contact portal.
              </p>
            </div>
            <Link
              href="/contact"
              className="text-xs font-bold text-brand-teal hover:underline decoration-none"
            >
              Go to Contact Form &rarr;
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
