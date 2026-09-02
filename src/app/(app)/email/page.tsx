import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';
import { Mail, Clock, Send, FileText, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EmailInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const params = await searchParams;
  const folder = params.folder || 'inbox';
  const supabase = await createClient();

  let query = supabase
    .from('email_threads')
    .select('*, contacts(name), companies(name), emails(body, sent_at)')
    .order('last_message_at', { ascending: false });

  if (folder === 'unread') query = query.eq('is_unread', true);
  else if (folder === 'important') query = query.eq('is_important', true);
  else if (folder === 'waiting') query = query.eq('folder', 'waiting');
  else if (folder === 'sent') query = query.eq('folder', 'sent');
  else if (folder === 'archive') query = query.eq('folder', 'archive');
  else query = query.eq('folder', 'inbox');

  const { data: threads } = await query;

  return (
    <div className="page">
      <div className="profile-header">
        <div>
          <div className="page-title">Email</div>
          <div className="page-subtitle">Every conversation, connected to the customer relationship behind it.</div>
        </div>
        <Link className="btn btn-primary" href="/email/compose"><Plus size={14} strokeWidth={1.7} /> Compose</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
        <div className="panel p-3">
          <Link href="?folder=inbox" className={`nav-item ${folder === 'inbox' ? 'active' : ''}`}><Mail size={16} strokeWidth={1.7} /> Inbox</Link>
          <Link href="?folder=unread" className={`nav-item ${folder === 'unread' ? 'active' : ''}`}><Mail size={16} strokeWidth={1.7} /> Unread</Link>
          <Link href="?folder=important" className={`nav-item ${folder === 'important' ? 'active' : ''}`}><Mail size={16} strokeWidth={1.7} /> Important</Link>
          <Link href="?folder=waiting" className={`nav-item ${folder === 'waiting' ? 'active' : ''}`}><Clock size={16} strokeWidth={1.7} /> Waiting</Link>
          <Link href="?folder=sent" className={`nav-item ${folder === 'sent' ? 'active' : ''}`}><Send size={16} strokeWidth={1.7} /> Sent</Link>
          <Link href="?folder=archive" className={`nav-item ${folder === 'archive' ? 'active' : ''}`}><FileText size={16} strokeWidth={1.7} /> Archive</Link>
          <div className="border-t border-border mt-2.5 pt-2.5">
            <Link href="/email/waiting" className="nav-item"><Clock size={16} strokeWidth={1.7} /> Waiting For</Link>
          </div>
        </div>

        <div className="panel p-0">
          {!threads?.length && <div className="empty-state"><div className="title">Your inbox is clear</div>Nothing here for now.</div>}
          {threads?.map((t: any) => {
            const preview = t.emails?.length ? t.emails.sort((a: any, b: any) => (a.sent_at < b.sent_at ? 1 : -1))[0].body : '';
            return (
              <Link key={t.id} href={`/email/${t.id}`} className={`email-list-item ${t.is_unread ? 'unread' : ''}`}>
                <div className="row1">
                  <span>{t.companies?.name || t.contacts?.name || 'Unknown'}</span>
                  <span className="time">{timeAgo(t.last_message_at)}</span>
                </div>
                <div className="subject">{t.subject}{t.is_important ? ' ★' : ''}</div>
                <div className="preview">{(preview || '').slice(0, 100)}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
