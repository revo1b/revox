'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, Sparkles, Bell, Settings } from 'lucide-react';

export function Topbar({
  onMenuClick,
  unreadNotifications,
}: {
  onMenuClick: () => void;
  unreadNotifications: number;
}) {
  const router = useRouter();

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const value = (e.target as HTMLInputElement).value;
      router.push(`/search?q=${encodeURIComponent(value)}`);
    }
  }

  return (
    <header className="topbar">
      <button className="md:hidden p-1.5 text-ink" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} strokeWidth={1.7} />
      </button>
      <div className="search-box hidden md:flex">
        <Search size={15} strokeWidth={1.7} />
        <input type="text" placeholder="Search contacts, companies, emails, tasks…" onKeyDown={handleSearch} />
      </div>
      <div className="flex items-center gap-2.5 flex-shrink-0 ml-auto">
        <Link href="/ai" className="ask-revox-btn">
          <Sparkles size={14} strokeWidth={1.7} />
          <span className="hidden sm:inline">Ask Revox</span>
        </Link>
        <Link href="/notifications" className="icon-btn">
          <Bell size={16} strokeWidth={1.7} />
          {unreadNotifications > 0 && <span className="badge-dot" />}
        </Link>
        <Link href="/settings" className="icon-btn">
          <Settings size={16} strokeWidth={1.7} />
        </Link>
      </div>
    </header>
  );
}
