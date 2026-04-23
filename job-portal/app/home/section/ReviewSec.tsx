// components/Testimonials.tsx
import { Star, Quote, CheckCircle2 } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Alex Rivera",
    role: "Frontend Intern",
    company: "TechFlow",
    content: "BookMyIntern simplified my search. I uploaded my CV and had three interview requests within a week without applying manually to dozens of sites.",
    rating: 5
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "HR Manager",
    company: "Nexus AI",
    content: "The quality of candidates here is unmatched. It’s our go-to platform for finding fresh talent that is actually ready to contribute from day one.",
    rating: 5
  },
  {
    id: 3,
    name: "James Wilson",
    role: "Backend Intern",
    company: "CloudScale",
    content: "The dashboard is so clean. I love how I can see exactly when a recruiter views my profile. It makes the job hunt feel transparent.",
    rating: 5
  }
];

export default function TestimonialSection() {
  return (
    <section className="py-24 bg-[#fcfdfe] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-4">
            <CheckCircle2 size={14} className="text-blue-600" />
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Trusted by 10k+ Users</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
            Success Stories from <span className="text-blue-600">Our Community</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            See how BookMyIntern is connecting the next generation of talent with world-class companies.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="relative bg-white border border-gray-100 p-8 rounded-2xl transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1">
              
              {/* Quote Icon Accent */}
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Quote size={14} fill="currentColor" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-600 text-[13.5px] leading-relaxed mb-8 italic">
                "{t.content}"
              </p>

              {/* Profile */}
              <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-gray-900 leading-tight">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-tighter">
                    {t.role} @ <span className="text-blue-600">{t.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        

      </div>
    </section>
  );
}