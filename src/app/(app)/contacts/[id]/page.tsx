import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { money, timeAgo, initials } from '@/lib/utils';
import { Mail, ChevronDown } from 'lucide-react';
import { NewTaskModal } from '@/components/NewTaskModal';
import { NoteForm } from '@/components/NoteForm';
import { EditContactModal } from '@/components/EditContactModal';

export const dynamic = 'force-dynamic';

export default async function ContactViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contact } = await supabase.from('contacts').select('*, companies(id, name)').eq('id', id).single();
  if (!contact) notFound();

  const [{ data: opps }, { data: emails }, { data: tasks }, { data: notes }, { data: activities }] = await Promise.all([
    supabase.from('opportunities').select('*').eq('contact_id', id).order('value', { ascending: false }),
    supabase.from('email_threads').select('*').eq('contact_id', id).order('last_message_at', { ascending: false }),
    supabase.from('tasks').select('*').eq('contact_id', id).order('due_date'),
    supabase.from('notes').select('*').eq('contact_id', id).order('created_at', { ascending: false }),
    supabase.from('activities').select('*').eq('contact_id', id).order('occurred_at', { ascending: false }).limit(12),
  ]);

  const primaryOpp = opps?.[0];
  const path = `/contacts/${id}`;

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-id">
          <div className="avatar w-[52px] h-[52px] text-lg">{initials(contact.name)}</div>
          <div>
            <div className="text-[19px] font-bold">{contact.name}</div>
            <div className="text-ink-soft text-[13px] mt-0.5">
              {contact.position}{contact.companies?.name ? ` · ${contact.companies.name}` : ''}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <a className="btn" href={`mailto:${contact.email}`}><Mail size={14} strokeWidth={1.7} /> Email</a>
          <NewTaskModal contactId={id} redirectPath={path} />
          <EditContactModal contact={contact} />
        </div>
      </div>

      <div className="stat-strip">
        <div><div className="stat-label">Relationship</div><div className="stat-value"><span className={`pill pill-${contact.status}`}>{contact.status[0].toUpperCase() + contact.status.slice(1)}</span></div></div>
        <div><div className="stat-label">AI Score</div><div className="stat-value">{contact.ai_score}</div></div>
        <div><div className="stat-label">Opportunity Value</div><div className="stat-value">{money(primaryOpp?.value || 0)}</div></div>
        <div><div className="stat-label">Last Contact</div><div className="stat-value">{timeAgo(contact.last_activity_at)}</div></div>
      </div>

      {contact.ai_summary && (
        <div className="ai-summary-box">
          <div className="label">AI Summary</div>
          {contact.ai_summary}
        </div>
      )}

      {primaryOpp?.next_best_action && (
        <div className="nba-box">
          <div className="label">Next Best Action</div>
          <div className="nba-text">{primaryOpp.next_best_action}</div>
          <Link className="btn btn-primary btn-sm" href={`/ai?q=${encodeURIComponent(primaryOpp.next_best_action)}`}>
            <Mail size={14} strokeWidth={1.7} /> Draft Email
          </Link>
        </div>
      )}

      <div className="grid-2">
        <div>
          <div className="section-label">Timeline</div>
          <div className="panel px-4.5">
            {!activities?.length && !emails?.length && (
              <div className="empty-state"><div className="title">No activity yet</div>Emails, tasks, and notes will appear here.</div>
            )}
            {activities?.map((a) => (
              <div className="timeline-item" key={a.id}>
                <div className="timeline-time">{timeAgo(a.occurred_at)}</div>
                <div className="timeline-text">{a.description}</div>
              </div>
            ))}
            {emails?.map((t) => (
              <div className="timeline-item" key={t.id}>
                <div className="timeline-time">{timeAgo(t.last_message_at)}</div>
                <div className="timeline-text"><Link href={`/email/${t.id}`} className="text-navy">Email: {t.subject}</Link></div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {!!opps?.length && (
            <>
              <div className="section-label">Opportunities</div>
              <div className="card mb-4.5 p-2">
                {opps.map((o) => (
                  <Link key={o.id} href={`/opportunities/${o.id}`} className="block p-2 rounded-sm hover:bg-bg-soft">
                    <div className="font-semibold text-[13px]">{o.title}</div>
                    <div className="text-xs text-ink-faint">{money(o.value)} · <span className={`pill pill-${o.stage}`}>{o.stage[0].toUpperCase() + o.stage.slice(1)}</span></div>
                  </Link>
                ))}
              </div>
            </>
          )}

          <div className="section-label">Tasks</div>
          <div className="card mb-4.5">
            {!tasks?.length && <span className="text-ink-faint text-[13px]">No tasks linked.</span>}
            {tasks?.map((t) => (
              <div key={t.id} className="text-[13px] mb-2">{t.title} <span className="text-ink-faint text-xs">({t.status})</span></div>
            ))}
          </div>

          <div className="section-label">Notes</div>
          <NoteForm contactId={id} redirectPath={path} notes={notes ?? []} />
        </div>
      </div>
    </div>
  );
}
