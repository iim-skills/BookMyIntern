// components/CVUploadCTA.tsx
import { UploadCloud, FileText, CheckCircle } from "lucide-react";

export default function ProfessionalCVCTA() {
  return (
    <section className="relative  px-6 bg-[#f8fafc]">
      {/* Background Subtle Dot Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.05]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232f46d3' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")` }} 
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Main CTA Container: Crisp border, soft shadow, clean white background */}
        <div className="bg-gradient-to-br from-[#2f46d3] to-[#1e2e8e] rounded-3xl p-8 md:p-12 lg:p-16 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] grid lg:grid-cols-5 gap-12 items-center">
          
          {/* Left Side: Content & Headline (60% width on large screens) */}
          <div className="lg:col-span-3 text-left">
             
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-400/20 text-blue-100 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
                Career Accelerator
              </span>
              <span className="h-[1px] w-12 bg-white/30"></span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight tracking-tight">
              Don’t just find. <span className="text-blue-300">Be found.</span>
            </h2>

            <p className="text-blue-100/80 text-base md:text-base mb-4 leading-relaxed max-w-xl">
              Upload your CV today to join our elite talent pool and increase your visibility to top-tier employers actively hiring for your skills.
            </p>

            {/* Quick Benefits List */}
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 text-blue-100/80">
              {[
                "Increased Profile Visibility",
                "Exclusive Non-Advertised Roles",
                "Direct Recruiter Messages",
                "Streamlined Application Process",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckCircle size={15} className="text-[#6a7cf5]" />
                  <span className="font-normal text-base">{benefit}</span>
                </div> 
              ))}
            </div>
          </div>

          {/* Right Side: Upload Box (40% width on large screens) */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center text-center transition   group">
              
              {/* Animated Icon Container */}
              <div className="flex items-center gap-3">
              <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-[0_8px_15px_rgb(0,0,0,0.03)] mb-8 transition-transform group-hover:-translate-y-2">
                <UploadCloud size={40} className="text-[#2f46d3]" />
              </div>
              <div className="flex flex-col text-start items-start gap-1">
              <h4 className="text-xl font-bold text-gray-950">
                Unlock Opportunities
              </h4>
              <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                Connect with recruiters on the fast track. 
              </p>
              </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2.5 bg-[#2f46d3] text-white px-8 py-4 rounded-xl font-semibold text-base transition duration-300 hover:bg-[#2031a0] shadow-[0_10px_20px_-5px_rgba(47,70,211,0.3)] hover:shadow-[0_12px_25px_-5px_rgba(47,70,211,0.5)]">
                <FileText size={19} />
                Upload Your Resume
              </button>
              
              <p className="mt-5 text-gray-400 text-xs">
                Supports: PDF, DOCX (Max 10MB)
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}