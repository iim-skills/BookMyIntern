// components/RecentJobs.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowRight, Sparkles } from "lucide-react";
import RecentJobCard from "./RecentJobCard";
import LoginModal from "../../../components/LoginModal";

export default function RecentJobs() {
  const { data: session } = useSession();

  const [jobs, setJobs] = useState<any[]>([]);
  const [applied, setApplied] = useState<string[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);

  // Fetch jobs
  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data || []));
  }, []);

  // Apply function
  const handleApply = async (jobId: string) => {
    if (!session) {
      setPendingJobId(jobId);
      setShowLogin(true);
      return;
    }

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });

    if (res.ok) {
      setApplied((prev) => [...prev, jobId]);
    }
  };

  useEffect(() => {
    if (session && pendingJobId) {
      handleApply(pendingJobId);
      setPendingJobId(null);
    }
  }, [session, pendingJobId]);

  return (
    <section className="py-24 bg-[#fcfdfe]">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <Sparkles size={16} className="text-blue-600" />
              </div>
              <span className="text-blue-600 font-bold text-[11px] uppercase tracking-widest">
                New Opportunities
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Browse Recent <span className="text-blue-600">Internships</span>
            </h2>
            <p className="mt-4 text-gray-500 text-sm md:text-base leading-relaxed">
              Explore the latest roles from top-tier companies. Your next career move starts with a single click.
            </p>
          </div>

          <a href="/jobs" className="group inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors">
            View All Openings
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Jobs Grid */}
        {jobs.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {jobs.slice(0, 6).map((job) => (
              <RecentJobCard
                key={job._id}
                job={job}
                onApply={handleApply}
                applied={applied.includes(job._id)}
              />
            ))}
          </div>
        ) : (
          /* Skeleton Loader / Empty State */
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />
            ))}
          </div>
        )}

        {/* Login Modal */}
        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
        />

      </div>
    </section>
  );
}