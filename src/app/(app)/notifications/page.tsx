import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const supabase = await createClient();
  await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
  const { data: rows } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(30);

  return (
    <div className="page">
      <div className="page-title">Notifications</div>
      <div className="page-subtitle mb-5">Business-relevant updates, nothing else.</div>

      <div className="panel py-1">
        {!rows?.length && <div className="empty-state"><div className="title">No notifications</div>You&apos;re all caught up.</div>}
        {rows?.map((n) => (
          <Link key={n.id} href={n.link || '#'} className="email-list-item block">
            <div className="row1"><span>{n.message}</span><span className="time">{timeAgo(n.created_at)}</span></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
