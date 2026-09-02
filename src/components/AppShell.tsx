'use client';

import { useState } from 'react';
import { Sidebar, MobileNav } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell({
  userName,
  userRole,
  unreadNotifications,
  children,
}: {
  userName: string;
  userRole: string;
  unreadNotifications: number;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        userRole={userRole}
      />
      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} unreadNotifications={unreadNotifications} />
        {children}
      </div>
      <MobileNav />
    </div>
  );
}
