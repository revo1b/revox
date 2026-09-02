import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  const userName = (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'there';
  const userRole = (user.user_metadata?.role as string) || 'owner';

  return (
    <AppShell userName={userName} userRole={userRole} unreadNotifications={unreadCount ?? 0}>
      {children}
    </AppShell>
  );
}
