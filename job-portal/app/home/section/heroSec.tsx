// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import ReactDOM from "react-dom";
// import {
//   Search,
//   Award,
//   Users,
//   Star,
//   ShieldCheck,
//   CheckCircle,
//   TrendingUp,
//   Briefcase,
//   BookOpen,
//   Zap,
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// type AlumniLogo = { src: string; alt: string };
// const alumniLogos: AlumniLogo[] = [
//   { src: "/HiringPartners/amazon.png", alt: "Amazon" },
//   { src: "/HiringPartners/google.png", alt: "Google" },
//   { src: "/Review/microsoft-1.png", alt: "Microsoft" },
//   { src: "/HiringPartners/myntra.png", alt: "Myntra" },
// ];

// type ActiveUser = {
//   name: string;
//   action: string;
//   time: string;
//   img: string;
// };
// const activeUserActivities: ActiveUser[] = [
//   { name: "Rahul S.", action: "enrolled in Data Science", time: "Just now", img: "https://randomuser.me/api/portraits/men/32.jpg" },
//   { name: "Priya M.", action: "downloaded the brochure", time: "2 mins ago", img: "https://randomuser.me/api/portraits/women/44.jpg" },
//   { name: "Amit K.", action: "got placed at Google", time: "5 mins ago", img: "https://randomuser.me/api/portraits/men/22.jpg" },
//   { name: "Sneha R.", action: "completed a quiz", time: "1 min ago", img: "https://randomuser.me/api/portraits/women/28.jpg" },
//   { name: "Vikram J.", action: "booked a counseling session", time: "Just now", img: "https://randomuser.me/api/portraits/men/85.jpg" },
//   { name: "Ananya B.", action: "signed up for webinar", time: "Just now", img: "https://randomuser.me/api/portraits/women/65.jpg" },
//   { name: "Rohan D.", action: "enrolled in Digital Marketing", time: "3 mins ago", img: "https://randomuser.me/api/portraits/men/14.jpg" },
//   { name: "Kavita L.", action: "downloaded syllabus", time: "10 mins ago", img: "https://randomuser.me/api/portraits/women/33.jpg" },
//   { name: "Arjun M.", action: "started a project", time: "1 min ago", img: "https://randomuser.me/api/portraits/men/45.jpg" },
//   { name: "Meera P.", action: "finished module 2", time: "15 mins ago", img: "https://randomuser.me/api/portraits/women/12.jpg" },
//   { name: "Sarthak G.", action: "joined the community", time: "Just now", img: "https://randomuser.me/api/portraits/men/67.jpg" },
//   { name: "Ishita K.", action: "viewed placement report", time: "6 mins ago", img: "https://randomuser.me/api/portraits/women/89.jpg" },
//   { name: "Dev N.", action: "enrolled in MBA", time: "Just now", img: "https://randomuser.me/api/portraits/men/54.jpg" },
//   { name: "Tara S.", action: "asked a question", time: "2 mins ago", img: "https://randomuser.me/api/portraits/women/21.jpg" },
//   { name: "Kabir W.", action: "rated a course", time: "45 mins ago", img: "https://randomuser.me/api/portraits/men/76.jpg" },
//   { name: "Zara F.", action: "watched a demo", time: "8 mins ago", img: "https://randomuser.me/api/portraits/women/55.jpg" }
// ];

// export type CourseItem = {
//   title?: string | null;
//   name?: string | null;
//   description?: string | null | any;
//   slug?: string | null;
//   url?: string | null;
//   tag?: string | null;
//   [key: string]: any;
// };

// type HeroSectionProps = {
//   searchEndpoint?: string;
//   initialCourses?: CourseItem[];
// };

// const SuggestionPortal = React.forwardRef<HTMLDivElement, {
//   anchorRef: React.RefObject<HTMLElement | HTMLInputElement | null>;
//   open: boolean;
//   children: React.ReactNode;
// }>(({ anchorRef, open, children }, ref) => {
//   const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxHeight: 300 });

//   useEffect(() => {
//     if (!anchorRef?.current) return;
//     const calc = () => {
//       const r = anchorRef.current!.getBoundingClientRect();
//       setPos({
//         top: r.bottom + window.scrollY,
//         left: r.left + window.scrollX,
//         width: r.width,
//         maxHeight: Math.max(120, window.innerHeight - r.bottom - 40),
//       });
//     };
//     if (open) calc();
//     window.addEventListener("resize", calc);
//     window.addEventListener("scroll", calc, true);
//     return () => {
//       window.removeEventListener("resize", calc);
//       window.removeEventListener("scroll", calc, true);
//     };
//   }, [anchorRef, open]);

//   if (!open) return null;

//   const style: React.CSSProperties = {
//     position: "absolute",
//     top: pos.top,
//     left: pos.left,
//     width: pos.width,
//     zIndex: 99999,
//     maxHeight: pos.maxHeight,
//   };

//   return ReactDOM.createPortal(
//     <div ref={ref as any} style={style} className="rounded-xl shadow-xl bg-white border border-slate-200 overflow-hidden">
//       {children}
//     </div>,
//     document.body
//   );
// });
// SuggestionPortal.displayName = "SuggestionPortal";

// /* ─────────────────────────────────────────────
//    Redesigned Right Panel
// ───────────────────────────────────────────── */
// const TrustPanel: React.FC = () => {
//   const reviews = [
//     { platform: "Google Reviews", rating: "4.7", count: "550+", logo: "/HomePageAssets/Logo/chrome.png", color: "#4285F4" },
//     { platform: "Trustpilot",     rating: "4.2", count: "400+",  logo: "/HomePageAssets/Logo/trustpilot.png", color: "#00B67A" },
//     { platform: "Glassdoor",      rating: "4.6", count: "40+",  logo: "/HomePageAssets/Logo/glassdoor.png",  color: "#0CAA41" },
//     { platform: "LinkedIn",       rating: "1k+ Alumnis", count: "50,000+", logo: "/HomePageAssets/Logo/linkedin.png",   color: "#0A66C2" },
//   ];

//   const accreditations = [
//     { name: "Amazon",   src: "/HomePageAssets/Logo/Amazon.png" },
//     { name: "Google",   src: "/HomePageAssets/Logo/GOOGLE.png" },
//     { name: "Meta",   src: "/HiringPartners/Meta-Logo.png" },
//     { name: "Razorpay",   src: "/HiringPartners/razorpay.png" },
//     { name: "Adobe",   src: "/HomePageAssets/Logo/Adobe.svg" },
//     { name: "AAPC",    src: "/HomePageAssets/Logo/AAPC.svg" },
//     { name: "Hubspot", src: "/HomePageAssets/Logo/Hubspot.svg" },
//     { name: "Lisburn", src: "/HomePageAssets/Logo/LIsburn.svg" },
//     { name: "MSME",    src: "/HomePageAssets/Logo/MSME.svg" },
//     { name: "AHIMA",   src: "/HomePageAssets/Logo/AHIMA.svg" },
//     { name: "Toles",   src: "/HomePageAssets/Logo/toles.svg" },
//   ];

//   const [reviewIndex, setReviewIndex] = useState(0);
//   const [animating, setAnimating] = useState(false);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setAnimating(true);
//       setTimeout(() => {
//         setReviewIndex((prev) => (prev + 1) % reviews.length);
//         setAnimating(false);
//       }, 350);
//     }, 2800);
//     return () => clearInterval(interval);
//   }, [reviews.length]);

//   const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
//     (e.currentTarget as HTMLImageElement).style.display = "none";
//   };

//   const current = reviews[reviewIndex];

//   return (
//     <div className="w-full max-w-[440px]">
//       <style>{`
//         @keyframes logo-scroll {
//           0%   { transform: translate3d(0,0,0); }
//           100% { transform: translate3d(-50%,0,0); }
//         }
//         .logo-track {
//           display: inline-flex;
//           white-space: nowrap;
//           animation: logo-scroll 20s linear infinite;
//           will-change: transform;
//         }
//         .logo-track:hover { animation-play-state: paused; }

//         @keyframes fade-up {
//           from { opacity: 0; transform: translateY(10px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         .review-enter { animation: fade-up 0.35s ease forwards; }
//         .review-exit  { opacity: 0; transform: translateY(-8px); transition: all 0.3s ease; }

//         @keyframes pulse-ring {
//           0%   { box-shadow: 0 0 0 0 rgba(37,99,235,0.25); }
//           70%  { box-shadow: 0 0 0 10px rgba(37,99,235,0); }
//           100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
//         }
//         .pulse-ring { animation: pulse-ring 2.5s ease-out infinite; }
//       `}</style>

//       <div className="relative flex flex-col gap-3">

//         {/* ── Top row: 2 stat chips ── */}
//         <div className="grid grid-cols-2 gap-3">
//           {/* Students Placed */}
//           <div className="bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-100/60 p-4 flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
//               <Briefcase className="w-5 h-5 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-[22px] font-extrabold text-slate-900 leading-none">55k+</p>
//               <p className="text-[11px] text-slate-500 font-medium mt-0.5">Students Trained</p>
//             </div>
//           </div>

//           {/* Placement Rate */}
//           <div className="bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-100/60 p-4 flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
//               <TrendingUp className="w-5 h-5 text-emerald-500" />
//             </div>
//             <div>
//               <p className="text-[22px] font-extrabold text-slate-900 leading-none">95%</p>
//               <p className="text-[11px] text-slate-500 font-medium mt-0.5">Placement Rate</p>
//             </div>
//           </div>
//         </div>

//         {/* ── Live Review Card ── */}
//         <div className="bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-100/60 p-4">
//           {/* header */}
//           <div className="flex items-center justify-between mb-3">
//             <div className="flex items-center gap-1.5">
//               <ShieldCheck className="w-4 h-4 text-blue-600" />
//               <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">Verified Reviews</span>
//             </div>
//             {/* dot indicators */}
//             <div className="flex gap-1">
//               {reviews.map((_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setReviewIndex(i)}
//                   className={`h-1.5 rounded-full transition-all duration-300 ${i === reviewIndex ? "w-4 bg-blue-600" : "w-1.5 bg-slate-200"}`}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* animated review row */}
//           <div className={`flex items-center justify-between ${animating ? "review-exit" : "review-enter"}`}>
//   <div className="flex items-center gap-3">
//     <div className="w-11 h-11 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
//       <img src={current.logo} alt={current.platform} className="w-8 h-8 object-contain" onError={handleImgError} />
//     </div>
//     <div>
//       <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-1">{current.platform}</p>
//       {current.platform === "LinkedIn" ? (
//         <p className="text-[15px] font-extrabold text-slate-900 leading-snug">1k+ Alumni's Listed</p>
//       ) : (
//         <div className="flex items-center gap-1.5">
//           <span className="text-xl font-extrabold text-slate-900">{current.rating}</span>
//           <span className="text-[11px] text-slate-400 font-medium">/5</span>
//         </div>
//       )}
//     </div>
//   </div>

//   <div className="flex flex-col items-end gap-1.5">
//     {current.platform !== "LinkedIn" && (
//       <>
//         <div className="flex gap-0.5">
//           {[...Array(5)].map((_, i) => (
//             <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
//           ))}
//         </div>
//         <p className="text-[12px] font-semibold text-slate-600">{current.count} <span className="text-slate-400 font-normal">reviews</span></p>
//       </>
//     )}
//     <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md">
//       <CheckCircle className="w-3 h-3" />
//       <span className="text-[9px] font-bold uppercase tracking-wide">Verified</span>
//     </div>
//   </div>
// </div>
//         </div>

//         {/* ── Bottom row: 2 more stat chips ── */}
//         <div className="grid grid-cols-2 gap-3">
//           {/* Courses */}
//           <div className="bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-100/60 p-4 flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
//               <BookOpen className="w-5 h-5 text-violet-500" />
//             </div>
//             <div>
//               <p className="text-[22px] font-extrabold text-slate-900 leading-none">17+</p>
//               <p className="text-[11px] text-slate-500 font-medium mt-0.5">Courses Offered</p>
//             </div>
//           </div>

//           {/* Live learners */}
//           <div className="bg-blue-600 rounded-2xl shadow-md shadow-blue-200 p-4 flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 pulse-ring">
//               <Zap className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <p className="text-[22px] font-extrabold text-white leading-none">1,989+</p>
//               <p className="text-[11px] text-blue-100 font-medium mt-0.5">Learning Now</p>
//             </div>
//           </div>
//         </div>

//         {/* ── Accreditation logo strip ── */}
//         <div className="bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-100/60 px-4 py-3.5 overflow-hidden">
//           <p className="text-[10px] font-bold text-black uppercase tracking-widest text-center mb-3">In Alignment With</p>
//           <div className="overflow-hidden relative">
//             {/* fade edges */}
//             <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
//             <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
//             <div className="logo-track">
//               {[...accreditations, ...accreditations].map((acc, idx) => (
//                 <div
//                   key={idx}
//                   className="inline-flex items-center justify-center mx-3 w-[80px] h-[40px] flex-shrink-0"
//                   title={acc.name}
//                 >
//                   <img
//                     src={acc.src}
//                     alt={acc.name}
//                     className="max-h-[36px] max-w-[76px] object-contain"
//                     onError={handleImgError}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export const HeroSection: React.FC<HeroSectionProps> = ({
//   searchEndpoint = "/api/courses",
//   initialCourses = [],
// }) => {
//   const router = useRouter();
//   const [activeIdx, setActiveIdx] = useState<number>(0);
//   const [showPopup, setShowPopup] = useState(false);

//   const [query, setQuery] = useState<string>("");
//   const [searchResults, setSearchResults] = useState<CourseItem[]>(initialCourses ?? []);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [openSuggestions, setOpenSuggestions] = useState<boolean>(false);
//   const [highlightIndex, setHighlightIndex] = useState<number>(-1);

//   const abortRef = useRef<AbortController | null>(null);
//   const debounceRef = useRef<number | null>(null);
//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const portalRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const initialTimer = window.setTimeout(() => setShowPopup(true), 2000);

//     const intervalId = window.setInterval(() => {
//       setShowPopup(false);
//       setTimeout(() => {
//         setActiveIdx((i) => (i + 1) % activeUserActivities.length);
//         setShowPopup(true);
//       }, 4000);
//     }, 8000);

//     return () => {
//       clearTimeout(initialTimer);
//       clearInterval(intervalId);
//     };
//   }, []);

//   useEffect(() => {
//     const onDocClick = (e: MouseEvent) => {
//       const target = e.target as Node | null;
//       const clickedInsideInput = inputRef.current && inputRef.current.contains(target);
//       const clickedInsidePortal = portalRef.current && portalRef.current.contains(target);
//       if (!clickedInsideInput && !clickedInsidePortal) {
//         setOpenSuggestions(false);
//         setHighlightIndex(-1);
//       }
//     };
//     document.addEventListener("click", onDocClick);
//     return () => document.removeEventListener("click", onDocClick);
//   }, []);

//   const getDescription = (item?: CourseItem): string | undefined => {
//     if (!item) return undefined;
//     const d = item.description ?? item.desc ?? item.excerpt ?? "";
//     if (!d) return undefined;
//     if (typeof d === "string") return d;
//     if (typeof d === "object") {
//       if ("rendered" in d && typeof d.rendered === "string") return d.rendered;
//       if (Array.isArray(d) && d.length > 0) return String(d[0]);
//       try {
//         const s = JSON.stringify(d);
//         return s.length > 120 ? s.slice(0, 120) + "..." : s;
//       } catch {
//         return undefined;
//       }
//     }
//     return String(d);
//   };

//   const runSearch = async (q: string) => {
//     if (!q || q.trim().length === 0) {
//       setSearchResults([]);
//       setIsLoading(false);
//       return;
//     }

//     if (abortRef.current) {
//       abortRef.current.abort();
//     }
//     const ac = new AbortController();
//     abortRef.current = ac;

//     setIsLoading(true);
//     setOpenSuggestions(true);

//     try {
//       const url = `${searchEndpoint}?q=${encodeURIComponent(q)}`;
//       const res = await fetch(url, { signal: ac.signal });
//       if (!res.ok) {
//         setSearchResults([]);
//         setIsLoading(false);
//         return;
//       }
//       const json = (await res.json()) as any;
//       let items: CourseItem[] = [];
//       if (Array.isArray(json)) items = json;
//       else if (Array.isArray(json.data)) items = json.data;
//       else if (Array.isArray(json.results)) items = json.results;
//       else items = Array.isArray(json.items) ? json.items : [];

//       setSearchResults(items);
//     } catch (err: any) {
//       if (err?.name !== "AbortError") {
//         console.error("search error", err);
//         setSearchResults([]);
//       }
//     } finally {
//       setIsLoading(false);
//       abortRef.current = null;
//     }
//   };

//   useEffect(() => {
//     if (debounceRef.current) {
//       window.clearTimeout(debounceRef.current);
//     }
//     if (!query) {
//       setSearchResults([]);
//       setOpenSuggestions(false);
//       return;
//     }
//     debounceRef.current = window.setTimeout(() => runSearch(query), 300);
//     return () => {
//       if (debounceRef.current) window.clearTimeout(debounceRef.current);
//     };
//   }, [query]);

//   const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (!openSuggestions) {
//       if (e.key === "ArrowDown") setOpenSuggestions(true);
//       return;
//     }
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setHighlightIndex((i) => Math.min(i + 1, Math.max(0, searchResults.length - 1)));
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setHighlightIndex((i) => Math.max(i - 1, 0));
//     } else if (e.key === "Enter") {
//       e.preventDefault();
//       const sel = searchResults[highlightIndex] ?? null;
//       if (sel) navigateToCourse(sel);
//       else runSearch(query);
//       setOpenSuggestions(false);
//     } else if (e.key === "Escape") {
//       setOpenSuggestions(false);
//       setHighlightIndex(-1);
//     }
//   };

//   const navigateToCourse = (item: CourseItem | null) => {
//     if (!item) return;
//     if (item.url) {
//       const url = String(item.url);
//       if (/^https?:\/\//i.test(url)) { window.location.href = url; return; }
//       if (url.startsWith("/")) { router?.push(url); return; }
//       window.location.href = url;
//       return;
//     }
//     if (item.slug) { router?.push(`/${String(item.slug)}`); return; }
//     router?.push(`/?search=${encodeURIComponent(item.title ?? query)}`);
//   };

//   const onTagClick = (tag: string) => {
//     setQuery(tag);
//     if (debounceRef.current) window.clearTimeout(debounceRef.current);
//     runSearch(tag);
//     inputRef.current?.focus();
//   };

//   const onFindCourse = async () => {
//     if (debounceRef.current) window.clearTimeout(debounceRef.current);
//     await runSearch(query);
//     inputRef.current?.focus();
//   };

//   return (
//     <section className="relative lg:pt-12 pb-16 lg:pb-16 bg-[#F8FAFC] overflow-visible font-sans">
//       <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-200/70 rounded-full blur-[100px] pointer-events-none z-0" />
//       <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-100/70 rounded-full blur-[120px] pointer-events-none z-0" />
//       <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-pink-100/90 rounded-full blur-[90px] pointer-events-none z-0" />
//       <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

//       <div className="max-w-7xl mx-auto px-6 relative z-10">
//         <div className="grid lg:grid-cols-12 gap-12 items-center">

//           {/* ── LEFT COLUMN (unchanged) ── */}
//           <div className="lg:col-span-7 space-y-8 relative">
//             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
//               <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
//               <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">11 Years of Legacy</span>
//             </div>

//             <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
//               Professional Courses For a <span className="text-blue-600">Highly Rewarding</span> Career
//             </h1>

//             <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
//               Our courses are designed in alignment with industry standards and are accredited or approved by recognized institutions
//             </p>

//             <div className="space-y-4">
//               <div className="flex flex-col sm:flex-row items-stretch gap-3 max-w-2xl">
//                 <div className="relative flex-grow group" role="combobox" aria-expanded={openSuggestions} aria-haspopup="listbox" aria-owns="course-suggestion-list">
//                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
//                   <input
//                     ref={inputRef}
//                     id="course-search-input"
//                     type="text"
//                     value={query}
//                     onChange={(e) => { setQuery(e.target.value); setHighlightIndex(-1); }}
//                     onKeyDown={onInputKeyDown}
//                     onFocus={() => { if (searchResults.length) setOpenSuggestions(true); }}
//                     placeholder="Search for courses (e.g. Financial Modeling...)"
//                     className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-lg"
//                     aria-autocomplete="list"
//                     aria-controls="course-suggestion-list"
//                     aria-activedescendant={highlightIndex >= 0 ? `result-${highlightIndex}` : undefined}
//                   />

//                   <SuggestionPortal anchorRef={inputRef} open={openSuggestions} ref={portalRef}>
//                     <div id="course-suggestion-list" role="listbox" className="max-h-64 overflow-auto">
//                       {isLoading && (
//                         <div className="flex items-center gap-3 px-4 py-3">
//                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400" />
//                           <div className="text-sm text-slate-500">Searching...</div>
//                         </div>
//                       )}

//                       {!isLoading && searchResults.length > 0 && searchResults.slice(0, 10).map((item, idx) => (
//                         <button
//                           key={idx}
//                           id={`result-${idx}`}
//                           role="option"
//                           aria-selected={highlightIndex === idx}
//                           onMouseEnter={() => setHighlightIndex(idx)}
//                           onMouseLeave={() => setHighlightIndex(-1)}
//                           onClick={() => { navigateToCourse(item); setOpenSuggestions(false); }}
//                           className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${highlightIndex === idx ? 'bg-blue-50' : ''}`}
//                         >
//                           <div className="flex justify-between items-start gap-3">
//                             <div className="flex flex-col">
//                               <span className="font-semibold text-slate-900">{item.title ?? item.name ?? "Untitled Course"}</span>
//                               {getDescription(item) && <span className="text-sm text-slate-500 truncate max-w-[44rem]">{getDescription(item)}</span>}
//                             </div>
//                             {item.tag && <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{item.tag}</span>}
//                           </div>
//                         </button>
//                       ))}

//                       {!isLoading && searchResults.length === 0 && (
//                         <div className="px-4 py-4 text-sm text-slate-500">No courses found. Try different keywords or browse categories.</div>
//                       )}
//                     </div>
//                   </SuggestionPortal>
//                 </div>

//                 <button
//                   onClick={onFindCourse}
//                   className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all whitespace-nowrap"
//                 >
//                   Find Course
//                 </button>
//               </div>

//               <div className="flex items-center gap-3 flex-wrap">
//                 <span className="text-sm font-semibold text-slate-400">Popular:</span>
//                 {['Data Science', 'Data Analytics', 'Digital Marketing', 'Investment Banking'].map(tag => (
//                   <button
//                     key={tag}
//                     onClick={() => onTagClick(tag)}
//                     className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all"
//                   >
//                     {tag}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="relative flex flex-col sm:flex-row items-center gap-6 border-t border-gray-100 pt-2 z-10">
//               <div className="flex items-center gap-3 text-gray-500 font-medium">
//                 <div className="flex -space-x-3">
//                   {alumniLogos.map((logo, i) => (
//                     <div key={i} className="w-15 h-15 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center overflow-hidden p-1.5">
//                       <img
//                         src={logo.src}
//                         alt={logo.alt}
//                         className="w-full h-full object-contain"
//                         onError={(e) => {
//                           const target = e.currentTarget as HTMLImageElement;
//                           target.style.display = "none";
//                           if (target.parentElement) {
//                             target.parentElement.innerHTML = `<span class="text-[10px] text-blue-600 font-bold">${logo.alt.charAt(0)}</span>`;
//                           }
//                         }}
//                       />
//                     </div>
//                   ))}
//                 </div>
//                 <div className="flex flex-col ml-3">
//                   <span className="text-lg font-bold text-slate-900 leading-none">Get Hired in Top-Rated Companies</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ── RIGHT COLUMN — redesigned ── */}
//           <div className="lg:col-span-5 flex items-center justify-center relative">
//             <TrustPanel />
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;

"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
  Search,
  Award,
  Users,
  Star,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  Briefcase,
  BookOpen,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import CTAButtons from "./CTAButtons";

type AlumniLogo = { src: string; alt: string };

const alumniLogos: AlumniLogo[] = [
  { src: "/HiringPartners/amazon.png", alt: "Amazon" },
  { src: "/HiringPartners/google.png", alt: "Google" },
  { src: "/Review/microsoft-1.png", alt: "Microsoft" },
  { src: "/HiringPartners/myntra.png", alt: "Myntra" },
];

type ActiveUser = {
  name: string;
  action: string;
  time: string;
  img: string;
};
 
export type CourseItem = {
  title?: string | null;
  name?: string | null;
  description?: string | null | any;
  slug?: string | null;
  url?: string | null;
  tag?: string | null;
  [key: string]: any;
};

type HeroSectionProps = {
  searchEndpoint?: string;
  initialCourses?: CourseItem[];
};

const SuggestionPortal = React.forwardRef<HTMLDivElement, {
  anchorRef: React.RefObject<HTMLElement | HTMLInputElement | null>;
  open: boolean;
  children: React.ReactNode;
}>(({ anchorRef, open, children }, ref) => {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxHeight: 300 });

  useEffect(() => {
    if (!anchorRef?.current) return;
    const calc = () => {
      const r = anchorRef.current!.getBoundingClientRect();
      setPos({
        top: r.bottom + window.scrollY,
        left: r.left + window.scrollX,
        width: r.width,
        maxHeight: Math.max(120, window.innerHeight - r.bottom - 40),
      });
    };
    if (open) calc();
    window.addEventListener("resize", calc);
    window.addEventListener("scroll", calc, true);
    return () => {
      window.removeEventListener("resize", calc);
      window.removeEventListener("scroll", calc, true);
    };
  }, [anchorRef, open]);

  if (!open) return null;

  const style: React.CSSProperties = {
    position: "absolute",
    top: pos.top,
    left: pos.left,
    width: pos.width,
    zIndex: 99999,
    maxHeight: pos.maxHeight,
  };

  return ReactDOM.createPortal(
    <div ref={ref as any} style={style} className="rounded-xl shadow-xl bg-white border border-slate-200 overflow-hidden">
      {children}
    </div>,
    document.body
  );
});
SuggestionPortal.displayName = "SuggestionPortal";

/* ─────────────────────────────────────────────
   Redesigned Right Panel
───────────────────────────────────────────── */
const TrustPanel: React.FC = () => {
  const reviews = [
    { platform: "Google Reviews", rating: "4.7", count: "550+", logo: "/HomePageAssets/Logo/chrome.png", color: "#4285F4" },
    { platform: "Trustpilot",     rating: "4.2", count: "400+",  logo: "/HomePageAssets/Logo/trustpilot.png", color: "#00B67A" },
    { platform: "Glassdoor",      rating: "4.6", count: "40+",  logo: "/HomePageAssets/Logo/glassdoor.png",  color: "#0CAA41" },
    { platform: "JustDial",      rating: "4.7", count: "550+",  logo: "/HomePageAssets/Logo/justdial.png",  color: "#0CAA41" },
    { platform: "CourseDekho",      rating: "4.8", count: "600+",  logo: "/HomePageAssets/Logo/coursedekho.png",  color: "#0CAA41" },
    { platform: "LinkedIn",       rating: "11k+ Alumnis", count: "50,000+", logo: "/HomePageAssets/Logo/linkedin.png",   color: "#0A66C2" },
  ];

  const accreditations = [
    { name: "Amazon",   src: "/HomePageAssets/Logo/Amazon.png" },
    { name: "Google",   src: "/HomePageAssets/Logo/GOOGLE.png" },
    { name: "Meta",     src: "/HiringPartners/Meta-Logo.png" },
    { name: "Adobe",    src: "/HomePageAssets/Logo/Adobe.svg" },
    { name: "Figma",    src: "/UIUX/Figma.png" },
    { name: "IBM",    src: "/wp-content/uploads/2021/02/ibm.jpg" },
    { name: "AAPC",     src: "/HomePageAssets/Logo/AAPC.svg" },
    { name: "Hubspot",  src: "/HomePageAssets/Logo/Hubspot.svg" },
    { name: "DSAFS",  src: "/HomePageAssets/Logo/dsafs.png" },
    { name: "ACCA",  src: "/silverLPlogo(red).png" },
    { name: "Lisburn",  src: "/HomePageAssets/Logo/LIsburn.svg" },
    { name: "MSME",     src: "/HomePageAssets/Logo/MSME.svg" },
    { name: "AHIMA",    src: "/HomePageAssets/Logo/AHIMA.svg" },
    { name: "Toles",    src: "/HomePageAssets/Logo/toles.svg" },
  ];

  const [reviewIndex, setReviewIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setReviewIndex((prev) => (prev + 1) % reviews.length);
        setAnimating(false);
      }, 350);
    }, 2800);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.currentTarget as HTMLImageElement).style.display = "none";
  };

  const current = reviews[reviewIndex];

  return (
    // FIX 1: w-full on mobile so the panel never exceeds the viewport width.
    // lg:max-w-[440px] keeps the original cap on desktop.
    <div className="w-full lg:max-w-[440px]">
      <style>{`
        @keyframes logo-scroll {
          0%   { transform: translate3d(0,0,0); }
          100% { transform: translate3d(-50%,0,0); }
        }
        .logo-track {
          display: inline-flex;
          white-space: nowrap;
          animation: logo-scroll 20s linear infinite;
          will-change: transform;
        }
        

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .review-enter { animation: fade-up 0.35s ease forwards; }
        .review-exit  { opacity: 0; transform: translateY(-8px); transition: all 0.3s ease; }

        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(37,99,235,0.25); }
          70%  { box-shadow: 0 0 0 10px rgba(37,99,235,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }
        .pulse-ring { animation: pulse-ring 2.5s ease-out infinite; }
      `}</style>

      <div className="relative flex flex-col gap-3">
 
        {/* ── Live Review Card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-100/60 p-4">
          {/* header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">Verified Reviews</span>
            </div>
            {/* dot indicators */}
            <div className="flex gap-1">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === reviewIndex ? "w-4 bg-blue-600" : "w-1.5 bg-slate-200"}`}
                />
              ))}
            </div>
          </div>

          {/* animated review row */}
          <div className={`flex items-center justify-between ${animating ? "review-exit" : "review-enter"}`}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src={current.logo} alt={current.platform} className="w-8 h-8 object-contain" onError={handleImgError} />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-1">{current.platform}</p>
                {current.platform === "LinkedIn" ? (
                  <p className="text-[15px] font-extrabold text-slate-900 leading-snug">11k+ Alumni's Listed</p>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-extrabold text-slate-900">{current.rating}</span>
                    <span className="text-[11px] text-slate-400 font-medium">/5</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              {current.platform !== "LinkedIn" && (
                <>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-[12px] font-semibold text-slate-600">{current.count} <span className="text-slate-400 font-normal">reviews</span></p>
                </>
              )}
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md">
                <CheckCircle className="w-3 h-3" />
                <span className="text-[9px] font-bold uppercase tracking-wide">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom row: 2 more stat chips ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Courses */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-100/60 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-slate-900 leading-none">17+</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Courses Offered</p>
            </div>
          </div>

          {/* Live learners */}
          <div className="bg-blue-600 rounded-2xl shadow-md shadow-blue-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 pulse-ring">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-white leading-none">1,989+</p>
              <p className="text-[11px] text-blue-100 font-medium mt-0.5">Learning Now</p>
            </div>
          </div>
        </div>

        {/* ── Accreditation logo strip ── */}
        {/*
          FIX 2: The inner scroll wrapper now has `overflow-hidden` + `w-full`
          so the animated logo-track is clipped to the card's own width on every
          screen size. The outer card no longer needs overflow-hidden (which was
          being ignored because the section used overflow-visible).
        */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-100/60 px-4 py-3.5">
          <p className="text-[10px] font-bold text-black uppercase tracking-widest text-center mb-3">In Alignment With</p>
          <div className="relative overflow-hidden w-full">
            {/* fade edges */}
            <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <div className="logo-track">
              {[...accreditations, ...accreditations].map((acc, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center justify-center mx-3 w-[80px] h-[40px] flex-shrink-0"
                  title={acc.name}
                >
                  <img
                    src={acc.src}
                    alt={acc.name}
                    className="max-h-[36px] max-w-[76px] object-contain"
                    onError={handleImgError}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchEndpoint = "/api/courses",
  initialCourses = [],
}) => {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [showPopup, setShowPopup] = useState(false);

  const [query, setQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<CourseItem[]>(initialCourses ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openSuggestions, setOpenSuggestions] = useState<boolean>(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  
    

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      const clickedInsideInput = inputRef.current && inputRef.current.contains(target);
      const clickedInsidePortal = portalRef.current && portalRef.current.contains(target);
      if (!clickedInsideInput && !clickedInsidePortal) {
        setOpenSuggestions(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const getDescription = (item?: CourseItem): string | undefined => {
    if (!item) return undefined;
    const d = item.description ?? item.desc ?? item.excerpt ?? "";
    if (!d) return undefined;
    if (typeof d === "string") return d;
    if (typeof d === "object") {
      if ("rendered" in d && typeof d.rendered === "string") return d.rendered;
      if (Array.isArray(d) && d.length > 0) return String(d[0]);
      try {
        const s = JSON.stringify(d);
        return s.length > 120 ? s.slice(0, 120) + "..." : s;
      } catch {
        return undefined;
      }
    }
    return String(d);
  };

  const runSearch = async (q: string) => {
    if (!q || q.trim().length === 0) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const ac = new AbortController();
    abortRef.current = ac;

    setIsLoading(true);
    setOpenSuggestions(true);

    try {
      const url = `${searchEndpoint}?q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { signal: ac.signal });
      if (!res.ok) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }
      const json = (await res.json()) as any;
      let items: CourseItem[] = [];
      if (Array.isArray(json)) items = json;
      else if (Array.isArray(json.data)) items = json.data;
      else if (Array.isArray(json.results)) items = json.results;
      else items = Array.isArray(json.items) ? json.items : [];

      setSearchResults(items);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("search error", err);
        setSearchResults([]);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    if (!query) {
      setSearchResults([]);
      setOpenSuggestions(false);
      return;
    }
    debounceRef.current = window.setTimeout(() => runSearch(query), 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!openSuggestions) {
      if (e.key === "ArrowDown") setOpenSuggestions(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, Math.max(0, searchResults.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = searchResults[highlightIndex] ?? null;
      if (sel) navigateToCourse(sel);
      else runSearch(query);
      setOpenSuggestions(false);
    } else if (e.key === "Escape") {
      setOpenSuggestions(false);
      setHighlightIndex(-1);
    }
  };

  const navigateToCourse = (item: CourseItem | null) => {
    if (!item) return;
    if (item.url) {
      const url = String(item.url);
      if (/^https?:\/\//i.test(url)) { window.location.href = url; return; }
      if (url.startsWith("/")) { router?.push(url); return; }
      window.location.href = url;
      return;
    }
    if (item.slug) { router?.push(`/${String(item.slug)}`); return; }
    router?.push(`/?search=${encodeURIComponent(item.title ?? query)}`);
  };

  const onTagClick = (tag: string) => {
    setQuery(tag);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    runSearch(tag);
    inputRef.current?.focus();
  };

  const onFindCourse = async () => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    await runSearch(query);
    inputRef.current?.focus();
  };

  return (
    /*
      FIX 3: `overflow-visible` → `overflow-x-hidden`
      Prevents the logo-track animation from bleeding beyond the viewport on mobile.
      Safe to do because the SuggestionPortal is rendered via ReactDOM.createPortal
      directly into document.body — it is completely unaffected by this section's overflow.
    */
    <section className="relative lg:pt-12 pb-16 lg:pb-16 bg-[#F8FAFC] overflow-x-clip font-sans">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-200/70 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-100/70 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-pink-100/90 rounded-full blur-[90px] pointer-events-none z-0" />
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* ── LEFT COLUMN (unchanged) ── */}
          <div className="lg:col-span-7 space-y-8 relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">11 Years of Legacy</span>
            </div>

            <h1 className="text-2xl lg:text-[40px] font-bold text-slate-900 leading-[1.1] tracking-tight">
              Find the Right Internship or  <span className="text-emerald-500"><br />the Perfect Candidate</span> 
            </h1>

            <p className="text-base lg:text-base text-slate-600 leading-relaxed max-w-xl">
              Whether you're a student looking to kickstart your career or an employer searching for top talent, our platform connects the right people with the right opportunities — faster and smarter. </p>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch gap-3 max-w-2xl">
                 <CTAButtons />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-slate-400">Popular:</span>
                {['Data Science', 'Data Analytics', 'Digital Marketing', 'Investment Banking'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => onTagClick(tag)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Mobile-only compact stat strip (hidden on lg+) ── */}
                
 
          </div>

          {/* ── RIGHT COLUMN — hidden on mobile, shown on lg+ ── */}
          <div className="hidden lg:flex lg:col-span-5 items-center justify-center relative">
            <img src="/iimskills-intrenship.jpg" alt="Hero Image" className="w-full h-auto object-contain rounded-lg" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;