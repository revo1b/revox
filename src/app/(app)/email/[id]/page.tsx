import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { money, formatDateTime } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { ReplyForm } from '@/components/ReplyForm';

export const dynamic = 'force-dynamic';

export default async function EmailThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: thread } = await supabase
    .from('email_threads')
    .select('*, contacts(id, name, position), companies(id, name), opportunities(id, title, value, stage)')
    .eq('id', id)
    .single();
  if (!thread) notFound();

  await supabase.from('email_threads').update({ is_unread: false }).eq('id', id);

  const { data: messages } = await supabase.from('emails').select('*').eq('thread_id', id).order('sent_at');

  return (
    <div className="page">
      <div className="profile-header">
        <div>
          <div className="page-title">{thread.subject}</div>
          <div className="page-subtitle">{thread.contacts?.name || ''}{thread.companies?.name ? ` · ${thread.companies.name}` : ''}</div>
        </div>
        <Link className="btn" href="/email">Back to Inbox</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <div>
          {messages?.map((m) => (
            <div key={m.id} className={`message-bubble ${m.direction === 'outbound' ? 'outbound' : ''}`}>
              <div className="m-head"><b>{m.sender_name}</b><span>{formatDateTime(m.sent_at)}</span></div>
              <div className="whitespace-pre-wrap">{m.body}</div>
            </div>
          ))}

          <div className="section-label mt-5">AI Email Tools</div>
          <div className="flex gap-2 flex-wrap mb-4">
            <Link className="btn btn-sm" href={`/ai?q=${encodeURIComponent('Summarize the email thread: ' + thread.subject)}`}><Sparkles size={14} strokeWidth={1.7} /> Summarize</Link>
            <Link className="btn btn-sm" href={`/ai?q=${encodeURIComponent('Draft a professional reply for the email thread: ' + thread.subject)}`}>Draft Reply</Link>
            <Link className="btn btn-sm" href={`/ai?q=${encodeURIComponent('Extract action items from the email thread: ' + thread.subject)}`}>Extract Actions</Link>
            <Link className="btn btn-sm" href={`/ai?q=${encodeURIComponent('Is there a sales opportunity in the thread: ' + thread.subject)}`}>Identify Opportunity</Link>
          </div>

          <ReplyForm threadId={id} />
        </div>

        <div className="panel p-4">
          {thread.contacts?.name && (
            <div className="py-3.5 border-b border-border">
              <div className="text-[10.5px] uppercase text-ink-faint font-bold tracking-wide mb-1.5">Contact</div>
              <div className="font-semibold text-[13.5px]">{thread.contacts.name}</div>
              <div className="text-xs text-ink-faint">{thread.contacts.position}</div>
            </div>
          )}
          {thread.companies?.name && (
            <div className="py-3.5 border-b border-border">
              <div className="text-[10.5px] uppercase text-ink-faint font-bold tracking-wide mb-1.5">Company</div>
              <Link href={`/companies/${thread.companies.id}`} className="font-semibold text-[13.5px] text-navy">{thread.companies.name}</Link>
            </div>
          )}
          {thread.opportunities?.title && (
            <>
              <div className="py-3.5 border-b border-border">
                <div className="text-[10.5px] uppercase text-ink-faint font-bold tracking-wide mb-1.5">Opportunity</div>
                <Link href={`/opportunities/${thread.opportunities.id}`} className="font-semibold text-[13.5px] text-navy">{thread.opportunities.title}</Link>
                <div className="text-[13px] text-teal font-bold mt-1">{money(thread.opportunities.value)}</div>
              </div>
              <div className="py-3.5 border-b border-border">
                <div className="text-[10.5px] uppercase text-ink-faint font-bold tracking-wide mb-1.5">Stage</div>
                <span className={`pill pill-${thread.opportunities.stage}`}>{thread.opportunities.stage}</span>
              </div>
            </>
          )}
          <div className="py-3.5">
            <div className="text-[10.5px] uppercase text-ink-faint font-bold tracking-wide mb-1.5">AI Insights</div>
            <div className="text-[13px] mt-1.5"><b>Intent:</b> {thread.ai_intent || '—'}</div>
            <div className="text-[13px] mt-1"><b>Priority:</b> {thread.ai_priority}</div>
            <div className="text-[13px] mt-1"><b>Sentiment:</b> {thread.ai_sentiment || '—'}</div>
            {thread.ai_recommended_action && (
              <div className="text-[13px] mt-2 pt-2 border-t border-border"><b>Recommended:</b> {thread.ai_recommended_action}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
