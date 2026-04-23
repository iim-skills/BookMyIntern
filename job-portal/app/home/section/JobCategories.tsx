// components/JobCategories.tsx
import {
  Settings,
  Layers,
  Home,
  Search,
  DollarSign,
  Cloud,
  Store,
  Shield,
} from "lucide-react";

export default function JobCategories() {
  const categories = [
    { icon: <Settings size={28} />, title: "Technical Support" },
    { icon: <Layers size={28} />, title: "Business Development" },
    { icon: <Home size={28} />, title: "Real Estate Business" },
    { icon: <Search size={28} />, title: "Share Market Analysis" },
    { icon: <DollarSign size={28} />, title: "Finance & Banking Service" },
    { icon: <Cloud size={28} />, title: "IT & Networking Services" },
    { icon: <Store size={28} />, title: "Restaurant Services" },
    { icon: <Shield size={28} />, title: "Defence & Fire Service" },
  ];

  return (
    <section className="bg-[#eef1f7] py-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        
        {/* Badge */}
        <div className="inline-block bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded mb-4">
          JOB CATEGORY
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Choose Your Desire Category
        </h2>

        {/* Underline */}
        <div className="w-12 h-[3px] bg-blue-600 mx-auto my-4"></div>

        {/* Description */}
        <p className="text-gray-500 max-w-xl mx-auto mb-12">
          There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form.
        </p>

        {/* Card Grid */}
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, index) => (
              <div
                key={index}
                className="border border-dashed border-gray-300 p-8 rounded-lg hover:shadow-md transition cursor-pointer"
              >
                {/* Icon Box */}
                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-blue-100 text-blue-600 rounded">
                  {cat.icon}
                </div>

                {/* Title */}
                <h3 className="text-sm font-medium text-gray-800 leading-snug">
                  {cat.title}
                </h3>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}