'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-navy pt-16 pb-8 border-t border-white/10 text-white select-none">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">

          {/* Column 1 - Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center decoration-none">
              <span className="font-display font-extrabold text-white text-xl tracking-tight">Book</span>
              <span className="font-display font-extrabold text-brand-blue text-xl tracking-tight">My</span>
              <span className="font-display font-extrabold text-white text-xl tracking-tight">Intern</span>
            </Link>
            <p className="text-white/50 text-sm max-w-xs leading-relaxed">
              India's smartest platform for internship discovery and hiring.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 mt-2">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-blue flex items-center justify-center text-white transition-all cursor-pointer"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-blue flex items-center justify-center text-white transition-all cursor-pointer"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-blue flex items-center justify-center text-white transition-all cursor-pointer"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 - Explore */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white font-semibold text-sm mb-2">Explore</h4>
            <Link href="/jobs" className="text-white/60 text-sm hover:text-white transition-colors decoration-none mb-1">
              Browse Internships
            </Link>
            <Link href="/companies" className="text-white/60 text-sm hover:text-white transition-colors decoration-none mb-1">
              Companies Directory
            </Link>
            <Link href="/community-reviews" className="text-white/60 text-sm hover:text-white transition-colors decoration-none mb-1">
              Community Reviews
            </Link>
            <Link href="/signup?role=recruiter" className="text-white/60 text-sm hover:text-white transition-colors decoration-none mb-1">
              Post a Job Free
            </Link>
          </div>

          {/* Column 3 - Company */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white font-semibold text-sm mb-2">Company</h4>
            <Link href="/about" className="text-white/60 text-sm hover:text-white transition-colors decoration-none mb-1">
              About Us
            </Link>
            <Link href="/blog" className="text-white/60 text-sm hover:text-white transition-colors decoration-none mb-1">
              Career Blog & Guides
            </Link>
            <Link href="/careers" className="text-white/60 text-sm hover:text-white transition-colors decoration-none mb-1">
              Careers at BookMyIntern
            </Link>
            <Link href="/press" className="text-white/60 text-sm hover:text-white transition-colors decoration-none mb-1">
              Press & Media Kit
            </Link>
          </div>

          {/* Column 4 - Support */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white font-semibold text-sm mb-2">Support</h4>
            <Link href="/help" className="text-white/60 text-sm hover:text-white transition-colors decoration-none mb-1">
              Help Center & FAQs
            </Link>
            <Link href="/contact" className="text-white/60 text-sm hover:text-white transition-colors decoration-none mb-1">
              Contact Us
            </Link>
            <Link href="/privacy" className="text-white/60 text-sm hover:text-white transition-colors decoration-none mb-1">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/60 text-sm hover:text-white transition-colors decoration-none mb-1">
              Terms of Service
            </Link>
          </div>

        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4 select-none">
          <span className="text-white/40 text-sm">
            &copy; 2026 BookMyIntern. All rights reserved.
          </span>
          {/* <span className="text-white/40 text-sm">
            Made with ❤️ in India
          </span> */}
        </div>

      </div>
    </footer>
  );
}
