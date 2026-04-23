// components/CVUploadCTA.tsx
import { PlusCircle, Users, Zap } from "lucide-react";

export default function EmployerCTA() {
  return (
    <section className="relative px-6 bg-[#f8fafc]">
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232f46d3' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-[#2f46d3] to-[#1e2e8e] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center">
          
          {/* Left Side: Content */}
          <div className="p-8 md:p-16 lg:w-2/3 text-left">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-blue-400/20 text-blue-100 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
                Employer Portal
              </span>
              <span className="h-[1px] w-12 bg-white/30"></span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              Build your dream team <br />
              <span className="text-blue-300">with top-tier interns.</span>
            </h2>

            <p className="text-blue-100/80 text-base md:text-base mb-8 max-w-xl">
              Stop sifting through endless emails. Use our streamlined dashboard to 
              discover, interview, and onboard fresh talent in half the time.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg">
                <PlusCircle size={20} />
                Post an Internship
              </button>
              
              {/* <button className="flex items-center gap-2 bg-transparent border border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold transition-all">
                View Pricing
              </button> */}
            </div>
          </div>

          {/* Right Side: Stats/Visual Card */}
          <div className="lg:w-1/3 w-full p-8 lg:p-12 bg-white/5 backdrop-blur-sm border-l border-white/10 flex flex-col justify-center gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-300">
                  <Users size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">50k+</div>
                  <div className="text-sm text-blue-200/60">Active Students</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg text-green-300">
                  <Zap size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">24h</div>
                  <div className="text-sm text-blue-200/60">Avg. Response Time</div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <p className="text-xs italic text-blue-200/50">
                "The fastest way we've found to scale our engineering department." 
                <br />— HR at TechCorp
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}