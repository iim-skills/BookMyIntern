// components/RecentJobCard.tsx
import { MapPin, Banknote, Clock, Building2, ChevronRight } from "lucide-react";

export default function RecentJobCard({ job, onApply, applied }: any) {
  // Formats date from DB (e.g., "2 days ago" or "Apr 23")
  const getRelativeTime = (dateString: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="group relative min-h-[280px] overflow-hidden bg-white border border-gray-100 rounded-xl p-4 transition-all duration-300 hover:border-blue-200 hover:shadow-[0_12px_24px_-10px_rgba(47,70,211,0.1)]">
      
      {/* Top Section: Role & Type */}
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex-1">
           
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <h3 className="text-[14px] font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
          </div>
          <p className="text-[12px] text-gray-500 flex items-center gap-1">
            <Building2 size={12} className="text-gray-400" />
            {job.companyName}
          </p>
        </div>
        
        <span className="shrink-0 bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-tight">
          {job.jobType}
        </span>
      </div>

      {/* Description: Clean & Subtle */}
      <p className="text-[12.5px] text-gray-400 leading-relaxed line-clamp-2 mb-4 italic">
        "{job.description || "Looking for a dedicated individual to join our growing team..."}"
      </p>

      {/* Tags Row */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-md border border-gray-100">
          <MapPin size={12} className="text-blue-500" />
          <span className="text-[11px] font-medium">{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-md border border-gray-100">
          <Banknote size={12} className="text-emerald-500" />
          <span className="text-[11px] font-medium">{job.salary || "Competitive"}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-md border border-gray-100">
          <Clock size={12} className="text-orange-400" />
          <span className="text-[11px] font-medium">{getRelativeTime(job.createdAt)}</span>
        </div>
      </div>

      {/* Action Footer */}
      <button
        onClick={() => onApply(job._id)}
        disabled={applied}
        className={`w-full absolute bottom-0 left-0 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-bold transition-all ${
          applied 
  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
  : "bg-[#4f46e5] text-white hover:bg-[#4338ca] shadow-md shadow-indigo-100 active:scale-[0.98]"
        }`}
      >
        {applied ? "Application Sent" : "View Details & Apply"}
        {!applied && <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />}
      </button>

    </div>
  );
}