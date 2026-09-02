'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Users, Building2, Target, TrendingUp, Mail, Sparkles,
  CheckSquare, Calendar, BarChart3,
} from 'lucide-react';
import { initials, cx } from '@/lib/utils';

const NAV = [
  { section: null, items: [{ icon: Home, label: 'Command Center', href: '/' }] },
  {
    section: 'CRM',
    items: [
      { icon: Users, label: 'Contacts', href: '/contacts' },
      { icon: Building2, label: 'Companies', href: '/companies' },
      { icon: Target, label: 'Leads', href: '/leads' },
      { icon: TrendingUp, label: 'Opportunities', href: '/opportunities' },
      { icon: CheckSquare, label: 'Customers', href: '/customers' },
    ],
  },
  { section: 'Communication', items: [{ icon: Mail, label: 'Email', href: '/email' }] },
  { section: 'AI', items: [{ icon: Sparkles, label: 'AI Brain', href: '/ai' }] },
  {
    section: 'Productivity',
    items: [
      { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
      { icon: Calendar, label: 'Calendar', href: '/calendar' },
    ],
  },
  { section: 'Intelligence', items: [{ icon: BarChart3, label: 'Insights', href: '/insights' }] },
];

export function Sidebar({
  open,
  onClose,
  userName,
  userRole,
}: {
  open: boolean;
  onClose: () => void;
  userName: string;
  userRole: string;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <div
        className={cx(
          'fixed inset-0 bg-ink/30 z-[39] md:hidden transition-opacity',
          open ? 'block' : 'hidden'
        )}
        onClick={onClose}
      />
      <aside className={cx('sidebar', !open && 'sidebar-closed')}>
        <div className="flex items-center gap-2.5 px-5.5 pt-5.5 pb-4.5">
          <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-navy to-teal flex items-center justify-center text-white font-bold text-sm">
            R
          </div>
          <div>
            <span className="text-base font-bold block">Revox</span>
            <span className="text-[11px] text-ink-faint -mt-0.5 block">Business OS</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          {NAV.map((group, i) => (
            <div key={i} className="mt-4 first:mt-0">
              {group.section && <div className="nav-section-label">{group.section}</div>}
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cx('nav-item', isActive(item.href) && 'active')}
                >
                  <item.icon size={17} strokeWidth={1.7} className="opacity-85 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-3.5 border-t border-border">
          <Link href="/settings" className="flex items-center gap-2.5 p-2 rounded-sm hover:bg-bg-soft">
            <div className="avatar">{initials(userName)}</div>
            <div>
              <div className="text-[13px] font-semibold">{userName}</div>
              <div className="text-[11.5px] text-ink-faint capitalize">{userRole}</div>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: TrendingUp, label: 'Pipeline', href: '/opportunities' },
    { icon: Mail, label: 'Email', href: '/email' },
    { icon: Sparkles, label: 'AI Brain', href: '/ai' },
    { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
  ];
  return (
    <nav className="mobile-nav">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={cx(isActive(item.href) && 'active')}>
          <item.icon size={19} strokeWidth={1.7} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
