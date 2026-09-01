'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const role = session?.user?.role || 'student';
  const name = session?.user?.name || 'User';
  const email = session?.user?.email || '';

  // Get user initials for avatar
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Define navigation lists based on role
  const getNavLinks = () => {
    if (role === 'admin') {
      return [
        { label: 'Admin Dashboard', href: '/admin/dashboard', icon: 'shield' },
        { label: 'Chat Messages', href: '/chat', icon: 'chat' },
        { label: 'Profile Editor', href: '/profile', icon: 'person' },
      ];
    }

    if (role === 'recruiter') {
      return [
        { label: 'Recruiter Dashboard', href: '/recruiter/dashboard', icon: 'dashboard' },
        { label: 'Browse Jobs', href: '/jobs', icon: 'work' },
        { label: 'Chat Messages', href: '/chat', icon: 'chat' },
        { label: 'Company Reviews', href: '/reviews', icon: 'monitoring' },
        { label: 'Profile Settings', href: '/profile', icon: 'person' },
      ];
    }

    // Default: student
    return [
      { label: 'Dashboard', href: '/student/dashboard', icon: 'dashboard' },
      { label: 'Find Internships', href: '/jobs', icon: 'work' },
      { label: 'Community Reviews', href: '/community-reviews', icon: 'group' },
      { label: 'Chat Messages', href: '/chat', icon: 'chat' },
      { label: 'My Reviews', href: '/reviews', icon: 'monitoring' },
      { label: 'Profile Settings', href: '/profile', icon: 'person' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <aside className="fixed left-0 top-0 h-full w-16 lg:w-[240px] bg-sidebar-bg border-r border-slate-800 flex flex-col justify-between py-5 z-40 transition-all duration-200">
      {/* Top Logo Section */}
      <div className="flex flex-col gap-6 px-4">
        <Link href="/" className="flex items-center gap-3 decoration-none justify-center lg:justify-start">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-base">B</div>
          <span className="hidden lg:block font-display font-extrabold text-lg text-white leading-none tracking-tight">
            Book<span className="text-primary">My</span>Intern
          </span>
        </Link>
        
        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5 pt-4 select-none">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150 decoration-none group relative ${
                  isActive
                    ? 'bg-primary/15 text-white font-bold border-l-[3px] border-primary'
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl flex-shrink-0 flex items-center justify-center"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {link.icon}
                </span>
                <span className="hidden lg:block text-xs">{link.label}</span>
                
                {/* Tooltip on hover for collapsed icon state */}
                <span className="lg:hidden absolute left-full ml-4 px-2.5 py-1.5 bg-text-primary text-white text-[11px] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Action Drawer */}
      <div className="px-4 flex flex-col gap-4 border-t border-slate-800 pt-4">
        {/* Profile Card */}
        <div className="flex items-center gap-3 justify-center lg:justify-start">
          <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-extrabold text-sm select-none border border-primary/20 flex-shrink-0">
            {initials}
          </div>
          <div className="hidden lg:flex flex-col min-w-0">
            <p className="font-semibold text-xs text-white leading-tight truncate">{name}</p>
            <p className="text-[10px] text-text-muted capitalize leading-tight mt-1 truncate">
              {role} Portal
            </p>
          </div>
        </div>

        {/* Action Logout */}
        <button
          onClick={() => void signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-all border-none bg-transparent cursor-pointer group relative w-full justify-center lg:justify-start"
        >
          <span className="material-symbols-outlined text-xl flex-shrink-0 flex items-center justify-center">
            logout
          </span>
          <span className="hidden lg:block text-xs font-semibold">Sign Out</span>
          
          <span className="lg:hidden absolute left-full ml-4 px-2.5 py-1.5 bg-accent-rose text-white text-[11px] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
