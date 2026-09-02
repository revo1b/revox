import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { money, timeAgo, formatDate } from '@/lib/utils';
import { Mail } from 'lucide-react';
import { NewTaskModal } from '@/components/NewTaskModal';
import { NoteForm } from '@/components/NoteForm';

export const dynamic = 'force-dynamic';

const STAGE_LABELS: Record<string, string> = {
  new: 'New', contacted: 'Contacted', qualified: 'Qualified', proposal: 'Proposal',
  negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
};

export default async function OpportunityViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: opp } = await supabase
    .from('opportunities')
    .select('*, contacts(name, email, position), companies(id, name)')
    .eq('id', id)
    .single();
  if (!opp) notFound();

  const [{ data: notes }, { data: tasks }, { data: emails }] = await Promise.all([
    supabase.from('notes').select('*').eq('opportunity_id', id).order('created_at', { ascending: false }),
    supabase.from('tasks').select('*').eq('opportunity_id', id).order('due_date'),
    supabase.from('email_threads').select('*').eq('opportunity_id', id).order('last_message_at', { ascending: false }),
  ]);

  const path = `/opportunities/${id}`;
  const reasons = (opp.next_best_action_reason || '').split(';').map((r: string) => r.trim()).filter(Boolean);

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-id">
          <div>
            <div className="text-[19px] font-bold">{opp.title}</div>
            <div className="text-ink-soft text-[13px] mt-0.5">{opp.companies?.name || '—'} · {opp.contacts?.name || '—'}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link className="btn" href={`/ai?q=${encodeURIComponent('Draft a follow-up email about ' + opp.title)}`}>
            <Mail size={14} strokeWidth={1.7} /> Draft Email
          </Link>
          <NewTaskModal opportunityId={id} redirectPath={path} triggerLabel="Create Task" />
        </div>
      </div>

      <div className="stat-strip">
        <div><div className="stat-label">Value</div><div className="stat-value">{money(opp.value)}</div></div>
        <div><div className="stat-label">Stage</div><div className="stat-value"><span className={`pill pill-${opp.stage}`}>{STAGE_LABELS[opp.stage]}</span></div></div>
        <div><div className="stat-label">Probability</div><div className="stat-value">{opp.probability}%</div></div>
        <div><div className="stat-label">Expected Close</div><div className="stat-value">{opp.expected_close ? formatDate(opp.expected_close) : '—'}</div></div>
      </div>

      {opp.ai_summary && <div className="ai-summary-box"><div className="label">AI Summary</div>{opp.ai_summary}</div>}

      {opp.next_best_action && (
        <div className="nba-box">
          <div className="label">Next Best Action</div>
          <div className="nba-text">{opp.next_best_action}</div>
          {!!reasons.length && (
            <>
              <div className="text-[12.5px] font-bold text-ink-soft mt-2">Why</div>
              <ul className="list-disc pl-4.5 my-2 text-[13px] text-ink-soft">
                {reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
              </ul>
            </>
          )}
          <div className="flex gap-2 mt-2">
            <Link className="btn btn-primary btn-sm" href={`/ai?q=${encodeURIComponent(opp.next_best_action)}`}>
              <Mail size={14} strokeWidth={1.7} /> Draft Email
            </Link>
            {opp.companies?.id && <Link className="btn btn-sm" href={`/companies/${opp.companies.id}`}>View Customer</Link>}
          </div>
        </div>
      )}

      <div className="grid-2">
        <div>
          <div className="section-label">Email Conversations</div>
          <div className="panel py-1">
            {!emails?.length && <div className="empty-state py-6"><div className="title">No emails linked yet</div></div>}
            {emails?.map((t) => (
              <Link key={t.id} href={`/email/${t.id}`} className="email-list-item block">
                <div className="row1"><span>{t.subject}</span><span className="time">{timeAgo(t.last_message_at)}</span></div>
              </Link>
            ))}
          </div>

          <div className="section-label mt-5.5">Tasks</div>
          <div className="panel px-4.5">
            {!tasks?.length && <div className="empty-state py-6"><div className="title">No tasks linked</div></div>}
            {tasks?.map((t) => (
              <div className="timeline-item" key={t.id}><div className="timeline-text"><b>{t.title}</b> — {t.status}</div></div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-label">Contact</div>
          <div className="card">
            <div className="font-bold">{opp.contacts?.name || '—'}</div>
            <div className="text-[12.5px] text-ink-soft">{opp.contacts?.position || ''}</div>
            <div className="text-[12.5px] text-ink-faint mt-1.5">{opp.contacts?.email || ''}</div>
          </div>

          <div className="section-label mt-4.5">Notes</div>
          <NoteForm opportunityId={id} redirectPath={path} notes={notes ?? []} />
        </div>
      </div>
    </div>
  );
}
