// components/CTAButtons.tsx
import Link from "next/link";

export default function CTAButtons() {
  return (
    <section className="">
      <div className="max-w-4xl mb-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        
        {/* Post Job Button */}
        <Link href="/post-job">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition shadow-sm">
            Post A Job
          </button>
        </Link>

        {/* See Jobs Button */}
        <Link href="/jobs">
          <button className="bg-[#0b1b2b] hover:bg-[#162c45] text-white px-8 py-3 rounded-md font-medium transition shadow-sm">
            See Our Jobs
          </button>
        </Link>

      </div>
    </section>
  );
}