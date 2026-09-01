'use client';

import Link from 'next/link';
import Footer from '@/components/home/Footer';

export default function PrivacyPolicyPage() {
  const sections = [
    { id: 'intro', title: '1. Introduction' },
    { id: 'collection', title: '2. Information We Collect' },
    { id: 'usage', title: '3. How We Use Your Data' },
    { id: 'resumes', title: '4. Resume & Document Security' },
    { id: 'sharing', title: '5. Sharing with Recruiters' },
    { id: 'security', title: '6. Account Security & 2FA' },
    { id: 'retention', title: '7. Data Retention & Deletion' },
    { id: 'rights', title: '8. Your Rights' },
    { id: 'contact-dpo', title: '9. Contact Data Protection Officer' },
  ];

  return (
    <main className="min-h-screen bg-surface-page font-body pt-20">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF] py-14 border-b border-surface-mid">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block">
            Legal & Compliance
          </span>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl text-ink-primary tracking-tight mb-3">
            Privacy Policy
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

          {/* Right - Policy Text Body (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl2 border border-surface-mid p-8 md:p-12 shadow-card space-y-10 text-ink-secondary leading-relaxed text-sm">
            
            <section id="intro">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                1. Introduction
              </h2>
              <p>
                BookMyIntern Technologies Pvt. Ltd. ("BookMyIntern", "we", "us", or "our") is deeply committed to safeguarding the privacy and personal data of our users. This Privacy Policy outlines our practices regarding the collection, processing, storage, and sharing of personal data when you use our platform, APIs, direct messenger, and associated services.
              </p>
              <p className="mt-3">
                By creating an account, browsing listings, or submitting an application, you agree to the collection and use of information in accordance with this policy and applicable data protection regulations, including the Digital Personal Data Protection Act (DPDPA).
              </p>
            </section>

            <section id="collection">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                2. Information We Collect
              </h2>
              <p className="mb-2">We collect information provided directly by you during registration and application submission:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Student Profile Data:</strong> Full Name, Email Address, College Name, Degree, Year of Study, Graduation Year, Phone Number, and Skill tags.</li>
                <li><strong>Application Materials:</strong> Uploaded Resumes (PDF/DOC), Cover Letters, portfolio links, and years of experience.</li>
                <li><strong>Recruiter & Employer Data:</strong> Company Name, Official Designation, Firm Website, Corporate Phone, and tax/KYC documents for verification.</li>
                <li><strong>Communication Data:</strong> Messages exchanged in our direct recruiter-student chat system, user notifications, and performance reviews.</li>
              </ul>
            </section>

            <section id="usage">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                3. How We Use Your Data
              </h2>
              <p>Your data is processed strictly for legitimate recruitment and platform operations:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs mt-2">
                <li>To enable students to discover, bookmark, and apply for verified internship openings.</li>
                <li>To allow verified recruiters to review candidate qualifications, download resumes, and manage hiring pipelines.</li>
                <li>To power the direct in-app messaging channel between candidates and hiring managers.</li>
                <li>To deliver account security notifications, 2FA OTP codes, and recruitment status updates.</li>
                <li>To prevent fraud, eliminate duplicate or fake postings, and maintain platform integrity.</li>
              </ul>
            </section>

            <section id="resumes">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                4. Resume & Document Security
              </h2>
              <p>
                Resumes uploaded by students are sanitized against malicious payloads, given unique randomized identifiers, and stored in secure file directories. Only verified recruiters whose job postings you have actively applied for receive access to inspect and download your resume file.
              </p>
            </section>

            <section id="sharing">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                5. Sharing with Recruiters & Third Parties
              </h2>
              <p>
                <strong>We never sell your personal data or phone number to marketing agencies or third-party lead brokers.</strong> Your profile and application details are shared exclusively with the verified recruiter associated with the specific job opening you applied to.
              </p>
            </section>

            <section id="security">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                6. Account Security & Two-Factor Authentication
              </h2>
              <p>
                We use industry-standard encryption protocols (bcrypt hashing for passwords, HTTPS SSL transport encryption). Users can enable Email Two-Factor Authentication (2FA) and invalidate all active sessions with our "Logout Everywhere" token versioning system.
              </p>
            </section>

            <section id="retention">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                7. Data Retention & Deletion
              </h2>
              <p>
                We retain your account data as long as your profile remains active. You may request permanent deletion of your profile, applications, and uploaded resume files at any time by contacting our privacy team.
              </p>
            </section>

            <section id="rights">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                8. Your Rights
              </h2>
              <p>Under applicable Indian and global privacy frameworks, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs mt-2">
                <li>Access a copy of your personal data stored on our servers.</li>
                <li>Rectify inaccurate academic or contact information.</li>
                <li>Withdraw consent for optional communications or 2FA channels.</li>
                <li>Request permanent erasure of your account.</li>
              </ul>
            </section>

            <section id="contact-dpo">
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                9. Contact Data Protection Officer
              </h2>
              <p>
                For privacy inquiries, data deletion requests, or compliance questions, please contact our Data Protection Officer:
              </p>
              <div className="bg-surface-page rounded-card p-4 border border-surface-mid text-xs space-y-1 mt-3">
                <p><strong>Grievance & Data Protection Officer:</strong> Privacy Desk</p>
                <p><strong>Email:</strong> <a href="mailto:privacy@bookmyintern.com" className="text-brand-blue">privacy@bookmyintern.com</a></p>
                <p><strong>Address:</strong> BookMyIntern Technologies, Indiranagar, Bangalore, Karnataka 560038</p>
              </div>
            </section>

          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
