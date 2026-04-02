'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';

interface AppShellProps {
  children: React.ReactNode;
  locale: string;
}

export function AppShell({ children, locale }: AppShellProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      label: 'Dashboard',
      href: `/${locale}`,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      ),
      label: 'My Checks',
      href: `/${locale}/checks`,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 6h18M3 12h18M3 18h18" />
          <circle cx="7" cy="6" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="7" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="7" cy="18" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      ),
      label: 'Removal Center',
      href: `/${locale}/removal`,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6h16M4 10h16M4 14h8M4 18h6" />
        </svg>
      ),
      label: 'Manual Sources',
      href: `/${locale}/osint`,
    },
  ];

  const bottomItems = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      ),
      label: 'Support',
      href: `/${locale}/support`,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
        </svg>
      ),
      label: 'Settings',
      href: `/${locale}/profile`,
    },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === `/${locale}` || pathname === `/${locale}/`;
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push(`/${locale}`);
  };

  return (
    <div className="flex h-screen bg-[#0d0f14] text-[#e8eaf0] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[200px] flex-shrink-0 bg-[#0f1117] flex flex-col">
        {/* Logo */}
        <div className="px-5 py-6 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill="#3b82f6" />
            </svg>
            <span className="text-base font-bold tracking-tight text-white">Trustshield</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#5a5f70] ml-7">Secure Protection</span>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-[#1a2035] text-white'
                  : 'text-[#8b90a0] hover:bg-[#161820] hover:text-[#c8cad4]'
              }`}
            >
              <span className={isActive(item.href) ? 'text-[#3b82f6]' : ''}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom Items */}
        <div className="px-3 pb-4 space-y-0.5">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-[#1a2035] text-white'
                  : 'text-[#8b90a0] hover:bg-[#161820] hover:text-[#c8cad4]'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {/* Scan Now Button */}
          <div className="pt-3">
            <button
              onClick={() => router.push(`/${locale}/osint`)}
              className="w-full py-2.5 px-4 rounded-lg bg-[#1c1f29] hover:bg-[#242836] text-[#8b90a0] hover:text-white text-sm font-medium transition-all border border-[#2d3244] uppercase tracking-wider"
            >
              Scan Now
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="flex-shrink-0 h-14 bg-[#0d0f14] border-b border-[#1e2235] flex items-center justify-between px-6">
          {/* Left: Page title rendered by children via context or just empty */}
          <div className="flex-1" />

          {/* Center: Search */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5f70]"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search security logs..."
                className="w-full pl-9 pr-4 py-1.5 bg-[#161820] border border-[#1e2235] rounded-lg text-sm text-[#8b90a0] placeholder-[#5a5f70] focus:outline-none focus:border-[#3b82f6]/50 transition-colors"
              />
            </div>
          </div>

          {/* Right: Icons */}
          <div className="flex-1 flex items-center justify-end gap-3">
            <LanguageSwitcher />

            {/* Bell */}
            <button className="p-2 rounded-lg hover:bg-[#161820] transition-colors text-[#8b90a0] hover:text-white relative">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#3b82f6] rounded-full" />
            </button>

            {/* Shield */}
            <button className="p-2 rounded-lg hover:bg-[#161820] transition-colors text-[#8b90a0] hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </button>

            {/* User Avatar */}
            <Link href={`/${locale}/profile`}>
              <div className="w-8 h-8 rounded-full bg-[#1a2035] border border-[#2d3244] flex items-center justify-center text-sm font-medium text-[#3b82f6] hover:border-[#3b82f6] transition-colors cursor-pointer">
                U
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
