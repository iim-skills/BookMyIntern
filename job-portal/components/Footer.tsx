// components/Footer.tsx
import Link from "next/link";
import { Pin, ScanFaceIcon, TextWrap, LinkIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#f5f7fb] pt-16 border-t">
      
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        
        {/* Column 1 */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-l">
              Job
            </span>
            <span className="bg-black text-white px-3 py-1 rounded-r">
              Grids
            </span>
          </h2>

          <p className="text-gray-600 text-sm mb-4">
            Start building your creative website with our awesome template Massive.
          </p>

          <p className="text-sm text-gray-600">
            <strong>Address:</strong> 555 Wall Street, USA, NY
          </p>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> example@apus.com
          </p>
          <p className="text-sm text-gray-600 mb-4">
            <strong>Call:</strong> 555-555-1234
          </p>

          {/* Social Icons */}
          <div className="flex gap-3">
            <div className="bg-gray-200 p-2 rounded hover:bg-blue-600 hover:text-white cursor-pointer">
              <ScanFaceIcon size={16} />
            </div>
            <div className="bg-gray-200 p-2 rounded hover:bg-blue-600 hover:text-white cursor-pointer">
              <TextWrap size={16} />
            </div>
            <div className="bg-gray-200 p-2 rounded hover:bg-blue-600 hover:text-white cursor-pointer">
              <LinkIcon size={16} />
            </div>
            <div className="bg-gray-200 p-2 rounded hover:bg-blue-600 hover:text-white cursor-pointer">
              <Pin size={16} />
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div>
          <h3 className="font-semibold mb-4">For Candidates</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link href="#">User Dashboard</Link></li>
            <li><Link href="#">CV Packages</Link></li>
            <li><Link href="#">Jobs Featured</Link></li>
            <li><Link href="#">Jobs Urgent</Link></li>
            <li><Link href="#">Candidate List</Link></li>
            <li><Link href="#">Candidates Grid</Link></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h3 className="font-semibold mb-4">For Employers</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link href="#">Post New</Link></li>
            <li><Link href="#">Employer List</Link></li>
            <li><Link href="#">Employers Grid</Link></li>
            <li><Link href="#">Job Packages</Link></li>
            <li><Link href="#">Jobs Listing</Link></li>
            <li><Link href="#">Jobs Featured</Link></li>
          </ul>
        </div>

        {/* Column 4 */}
        <div>
          <h3 className="font-semibold mb-4">Join Our Newsletter</h3>
          <p className="text-sm text-gray-600 mb-4">
            Subscribe to get the latest jobs posted, candidates...
          </p>

          <input
            type="email"
            placeholder="Your email address"
            className="w-full border rounded px-4 py-2 mb-3 text-sm"
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Subscribe Now!
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t mt-12 py-6 px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        
        <p>Designed and Developed by GrayGrids</p>

        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="#">Terms of use</Link>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Faq</Link>
          <Link href="#">Contact</Link>
        </div>

      </div>
    </footer>
  );
}