'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/home/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Student',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', role: 'Student', subject: '', message: '' });
    }, 600);
  };

  return (
    <main className="min-h-screen bg-surface-page font-body pt-20">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF] py-16 border-b border-surface-mid">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block">
              We'd love to hear from you
            </span>
            <h1 className="font-display font-extrabold text-3xl md:text-5xl text-ink-primary tracking-tight mb-4">
              Get in Touch with BookMyIntern
            </h1>
            <p className="text-ink-secondary text-base md:text-lg leading-relaxed">
              Have a question, need assistance with recruiter verification, or want to partner your college campus with us? We're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-14 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column - Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl2 border border-surface-mid p-8 md:p-10 shadow-lift">
            <h2 className="font-display font-bold text-2xl text-ink-primary mb-2">
              Send us a Message
            </h2>
            <p className="text-xs text-ink-secondary mb-8">
              Fill out the form below and our operations team will respond within 24 hours.
            </p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-card p-8 text-center my-6">
                <span className="text-4xl mb-2 block">🎉</span>
                <h3 className="font-display font-bold text-lg text-emerald-800 mb-1">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs text-emerald-700 mb-6">
                  Thank you for reaching out. A support specialist has been assigned to your inquiry and will email you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-brand-blue text-white text-xs font-semibold px-5 py-2.5 rounded-[8px] hover:bg-brand-bluedark transition-all cursor-pointer border-none"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-primary mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Verma"
                      className="w-full px-3.5 py-2.5 rounded-[8px] border border-surface-mid text-xs text-ink-primary focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-primary mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. rahul@example.com"
                      className="w-full px-3.5 py-2.5 rounded-[8px] border border-surface-mid text-xs text-ink-primary focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-primary mb-1">
                    I am reaching out as *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-[8px] border border-surface-mid text-xs text-ink-secondary bg-white focus:outline-none focus:border-brand-blue"
                  >
                    <option value="Student">Student / Job Seeker</option>
                    <option value="Recruiter">Recruiter / Employer</option>
                    <option value="Placement Cell">College Placement Cell / University</option>
                    <option value="Media">Press & Media</option>
                    <option value="General">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-primary mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief summary of your inquiry"
                    className="w-full px-3.5 py-2.5 rounded-[8px] border border-surface-mid text-xs text-ink-primary focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-primary mb-1">
                    Message Details *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we assist you? Please provide any relevant details..."
                    className="w-full px-3.5 py-2.5 rounded-[8px] border border-surface-mid text-xs text-ink-primary focus:outline-none focus:border-brand-blue resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-blue hover:bg-brand-bluedark text-white font-semibold text-sm py-3 rounded-[8px] shadow-blue transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  {loading ? 'Transmitting Message...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Right Column - Direct Info & Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Email Cards */}
            <div className="bg-white rounded-xl2 border border-surface-mid p-6 shadow-card space-y-5">
              <h3 className="font-display font-bold text-lg text-ink-primary">
                Direct Channels
              </h3>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-sm flex-shrink-0">
                  ✉️
                </div>
                <div>
                  <h4 className="font-bold text-xs text-ink-primary">Student Support</h4>
                  <a href="mailto:support@bookmyintern.com" className="text-xs text-brand-blue hover:underline">
                    support@bookmyintern.com
                  </a>
                  <p className="text-[11px] text-ink-muted mt-0.5">For application, chat, or login queries</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-brand-indigo flex items-center justify-center font-bold text-sm flex-shrink-0">
                  🏢
                </div>
                <div>
                  <h4 className="font-bold text-xs text-ink-primary">Recruiter & Verification</h4>
                  <a href="mailto:recruiter@bookmyintern.com" className="text-xs text-brand-indigo hover:underline">
                    recruiter@bookmyintern.com
                  </a>
                  <p className="text-[11px] text-ink-muted mt-0.5">Expedited company verification and bulk listings</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-brand-teal flex items-center justify-center font-bold text-sm flex-shrink-0">
                  🎓
                </div>
                <div>
                  <h4 className="font-bold text-xs text-ink-primary">University Partnerships</h4>
                  <a href="mailto:partners@bookmyintern.com" className="text-xs text-brand-teal hover:underline">
                    partners@bookmyintern.com
                  </a>
                  <p className="text-[11px] text-ink-muted mt-0.5">Connect your placement cell to BookMyIntern</p>
                </div>
              </div>
            </div>

            {/* Office & Timings Card */}
            <div className="bg-white rounded-xl2 border border-surface-mid p-6 shadow-card space-y-4">
              <h3 className="font-display font-bold text-lg text-ink-primary">
                Headquarters & Hours
              </h3>
              <div>
                <span className="text-xs font-bold text-ink-primary block mb-0.5">📍 Office Location</span>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  BookMyIntern Technologies Pvt. Ltd.<br />
                  100 Feet Road, Indiranagar, Bangalore, Karnataka 560038
                </p>
              </div>
              <div className="pt-2 border-t border-surface-mid">
                <span className="text-xs font-bold text-ink-primary block mb-0.5">⏱️ Operational Hours</span>
                <p className="text-xs text-ink-secondary">
                  Monday – Saturday: 9:00 AM – 7:00 PM IST<br />
                  Sunday: Closed (Emergency tickets monitored)
                </p>
              </div>
              <div className="pt-2 border-t border-surface-mid">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Average response time: &lt; 4 hours
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
