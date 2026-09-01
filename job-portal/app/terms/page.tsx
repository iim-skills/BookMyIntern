'use client';

import Link from 'next/link';
import Footer from '@/components/home/Footer';

export default function TermsOfServicePage() {
  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'eligibility', title: '2. User Eligibility & Accounts' },
    { id: 'students', title: '3. Student Code of Conduct' },
    { id: 'recruiters', title: '4. Recruiter Verification & Stipends' },
    { id: 'messaging', title: '5. Direct Messenger Rules' },
    { id: 'reviews', title: '6. Two-Way Reviews & Ratings' },
    { id: 'prohibited', title: '7. Prohibited Platform Activities' },
    { id: 'ip', title: '8. Intellectual Property' },
    { id: 'liability', title: '9. Limitation of Liability' },
    { id: 'termination', title: '10. Termination & Governing Law' },
  ];

  return (
    <main className="min-h-screen bg-surface-page font-body pt-20">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF] py-14 border-b border-surface-mid">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block">
            Legal & Terms
          </span>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl text-ink-primary tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-xs text-ink-muted">
            Last Updated: August 25, 2026 &bull; Effective Date: August 25, 2026
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-14 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left - Sticky Table of Contents (4 cols) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-card border border-surface-mid p-6 shadow-card">
              <h3 className="font-display font-bold text-sm text-ink-primary uppercase tracking-wider mb-4">
                Table of Contents
              </h3>
              <nav className="space-y-2">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block text-xs font-medium text-ink-secondary hover:text-brand-blue transition-colors decoration-none py-1 border-l-2 border-transparent hover:border-brand-blue pl-2"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Right - Terms Text Body (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl2 border border-surface-mid p-8 md:p-12 shadow-card space-y-10 text-ink-secondary leading-relaxed text-sm">
            
            <section id="acceptance">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "Student", "Recruiter") and BookMyIntern Technologies Pvt. Ltd. ("BookMyIntern", "we", "us"). By accessing or using the BookMyIntern website, mobile web interfaces, APIs, and direct recruitment communication channels, you acknowledge that you have read, understood, and agree to be bound by these Terms.
              </p>
            </section>

            <section id="eligibility">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                2. User Eligibility & Accounts
              </h2>
              <p>
                To register as a Student, you must be at least 16 years of age or currently enrolled in an accredited higher secondary school, college, polytechnic, or university program. To register as a Recruiter, you must be an authorized representative of a legitimate business entity, startup, or educational organization.
              </p>
              <p className="mt-2">
                You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
              </p>
            </section>

            <section id="students">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                3. Student Code of Conduct
              </h2>
              <p>Students using BookMyIntern agree to:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs mt-2">
                <li>Provide honest, accurate representations of academic qualifications, GPA, skills, and portfolio projects.</li>
                <li>Attend scheduled interview rounds promptly or give at least 24 hours advance cancellation notice.</li>
                <li>Refrain from submitting duplicate spam applications to listings where you do not meet baseline eligibility.</li>
              </ul>
            </section>

            <section id="recruiters">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                4. Recruiter Verification & Guaranteed Stipends
              </h2>
              <p>
                Recruiters must undergo mandatory firm verification before publishing listings. All job postings must clearly state the job description, required qualifications, duration, location, and stipend amount.
              </p>
              <p className="mt-2 text-xs font-semibold text-brand-blue">
                Mandatory Policy: Unpaid internships, multi-level marketing (MLM) schemes, commission-only sales disguised as technical roles, and charging application or training fees from candidates are strictly prohibited and result in immediate, permanent account bans.
              </p>
            </section>

            <section id="messaging">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                5. Direct Messenger Rules
              </h2>
              <p>
                The in-app messenger is provided exclusively for professional recruitment discussions. Harassment, hate speech, sharing pirated software, unsolicited marketing, or demanding off-platform security deposits is strictly prohibited.
              </p>
            </section>

            <section id="reviews">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                6. Two-Way Reviews & Ratings
              </h2>
              <p>
                BookMyIntern facilitates constructive two-way reviews between candidates and employers. Reviews must reflect genuine firsthand experiences. BookMyIntern reserves the right to remove reviews that contain profanity, defamatory falsehoods, or personal identifiable contact data.
              </p>
            </section>

            <section id="prohibited">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                7. Prohibited Platform Activities
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Scraping, crawling, or extracting platform data using automated bots without written consent.</li>
                <li>Attempting to bypass NextAuth token verification or reverse-engineer API endpoints.</li>
                <li>Uploading malicious files, trojans, or corrupted PDFs via the resume upload interface.</li>
                <li>Impersonating another student, recruiter, or BookMyIntern platform administrator.</li>
              </ul>
            </section>

            <section id="ip">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                8. Intellectual Property
              </h2>
              <p>
                All software, user interface designs, logos, graphics, and database architectures comprising BookMyIntern are the proprietary intellectual property of BookMyIntern Technologies Pvt. Ltd.
              </p>
            </section>

            <section id="liability">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                9. Limitation of Liability
              </h2>
              <p>
                BookMyIntern functions as an introduction and hiring communication platform. While we perform stringent recruiter verification, we are not an employer or employment agency and shall not be held liable for employment contractual disputes, off-platform agreements, or workplace conditions.
              </p>
            </section>

            <section id="termination">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                10. Termination & Governing Law
              </h2>
              <p>
                BookMyIntern reserves the right to suspend or terminate accounts violating these Terms. These Terms are governed by and construed in accordance with the laws of the Republic of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.
              </p>
            </section>

          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
