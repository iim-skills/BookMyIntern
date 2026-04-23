// components/HowItWorks.tsx
import { User, FileText, Briefcase } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <User size={32} />,
      title: "Register Your Account",
      desc: "Create your profile in minutes and get access to thousands of internship opportunities tailored to your skills.",
    },
    {
      icon: <FileText size={32} />,
      title: "Upload Your Resume",
      desc: "Upload your resume and showcase your skills, experience, and projects to stand out to recruiters.",
    },
    {
      icon: <Briefcase size={32} />,
      title: "Apply for Dream Internship",
      desc: "Browse internships and apply instantly to kickstart your career with real-world experience.",
    },
  ];

  return (
    <section className="bg-[#2f46d3] text-white py-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-5">
            
            {/* Icon Circle */}
            <div className="border border-dashed border-white/50 rounded-full p-5 flex items-center justify-center">
              {step.icon}
            </div>

            {/* Content */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {step.title}
              </h3>

              {/* Small underline */}
              <div className="w-10 h-[2px] bg-white mb-4"></div>

              <p className="text-sm text-white/80 leading-relaxed">
                {step.desc}
              </p>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}