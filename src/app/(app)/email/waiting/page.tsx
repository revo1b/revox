import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { daysAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function WaitingForPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from('email_threads')
    .select('*, contacts(name), companies(name), opportunities(title)')
    .eq('folder', 'waiting')
    .order('waiting_since');

  return (
    <div className="page">
      <div className="page-title">Waiting For</div>
      <div className="page-subtitle mb-5">Every relationship where you&apos;re waiting on someone else to respond.</div>

      <div className="panel py-1">
        {!rows?.length && <div className="empty-state"><div className="title">Nothing pending</div>You&apos;re not waiting on anyone right now.</div>}
        {rows?.map((r) => {
          const days = daysAgo(r.waiting_since);
          return (
            <Link key={r.id} href={`/email/${r.id}`} className="email-list-item block">
              <div className="row1">
                <span>{r.companies?.name || r.contacts?.name}</span>
                <span className={`time font-bold ${days > 5 ? 'text-red' : 'text-amber'}`}>{days} day{days === 1 ? '' : 's'}</span>
              </div>
              <div className="preview">
                {r.ai_recommended_action || `Waiting for response on ${r.subject}`}{r.opportunities?.title ? ` — ${r.opportunities.title}` : ''}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
