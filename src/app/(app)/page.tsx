import { createClient } from '@/lib/supabase/server';
import { money, timeAgo, daysAgo } from '@/lib/utils';
import { Sparkles, ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CommandCenter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const firstName = ((user?.user_metadata?.full_name as string) || user?.email || 'there').split(' ')[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const [
    { count: openLeads },
    { count: activeOpps },
    { data: pipelineOpps },
    { count: tasksDue },
    { count: unansweredEmails },
    { data: priorityOpps },
    { data: activities },
  ] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'lead'),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).not('stage', 'in', '("won","lost")'),
    supabase.from('opportunities').select('value').not('stage', 'in', '("won","lost")'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('email_threads').select('*', { count: 'exact', head: true }).or('folder.eq.waiting,is_unread.eq.true'),
    supabase.from('opportunities').select('*, contacts(name), companies(name)').not('stage', 'in', '("won","lost")').order('value', { ascending: false }).limit(3),
    supabase.from('activities').select('*').order('occurred_at', { ascending: false }).limit(8),
  ]);

  const pipelineValue = (pipelineOpps ?? []).reduce((sum, o) => sum + (o.value || 0), 0);

  return (
    <div className="page">
      <div className="ai-command">
        <div className="ai-greeting">
          {greeting}, {firstName}.
          <div className="sub">Here&apos;s what deserves your attention today.</div>
        </div>
        <form action="/ai" method="get">
          <input type="text" name="q" placeholder="Ask Revox about your business…" />
          <button type="submit" className="btn btn-primary">
            <ArrowRight size={16} strokeWidth={1.7} />
          </button>
        </form>
      </div>

      <div className="metric-row">
        <div className="metric">
          <div className="m-label">Open Leads</div>
          <div className="m-value">{openLeads ?? 0}</div>
        </div>
        <div className="metric">
          <div className="m-label">Active Opportunities</div>
          <div className="m-value">{activeOpps ?? 0}</div>
        </div>
        <div className="metric">
          <div className="m-label">Pipeline Value</div>
          <div className="m-value text-teal">{money(pipelineValue)}</div>
        </div>
        <div className="metric">
          <div className="m-label">Tasks Due</div>
          <div className="m-value">{tasksDue ?? 0}</div>
        </div>
        <div className="metric">
          <div className="m-label">Unanswered Emails</div>
          <div className="m-value text-amber">{unansweredEmails ?? 0}</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div className="section-label">AI Priorities</div>
          {!priorityOpps?.length && (
            <div className="panel empty-state">
              <div className="title">You&apos;re all caught up</div>
              No urgent priorities right now.
            </div>
          )}
          {priorityOpps?.map((opp, i) => {
            const age = daysAgo(opp.last_activity_at);
            const tag = i === 0 ? 'high' : age > 7 ? 'high' : 'medium';
            const tagLabel = i === 0 ? 'High Priority' : age > 7 ? 'Opportunity Risk' : 'Follow-Up';
            return (
              <div className="priority-card" key={opp.id}>
                <span className={`priority-tag ${tag}`}>{tagLabel}</span>
                <div className="priority-title">{opp.companies?.name || opp.contacts?.name}</div>
                <div className="priority-desc">{opp.next_best_action_reason || opp.ai_summary}</div>
                <div className="priority-meta">
                  <span>Opportunity value: <b>{money(opp.value)}</b></span>
                  <span>Last activity: <b>{timeAgo(opp.last_activity_at)}</b></span>
                </div>
                <div className="priority-actions">
                  <Link
                    className="btn btn-primary btn-sm"
                    href={`/ai?q=${encodeURIComponent('Draft a follow-up email for ' + (opp.contacts?.name || opp.companies?.name))}`}
                  >
                    <Mail size={14} strokeWidth={1.7} /> Draft Email
                  </Link>
                  <Link className="btn btn-sm" href={`/opportunities/${opp.id}`}>View Opportunity</Link>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div className="section-label">Today&apos;s Activity</div>
          <div className="panel px-4.5">
            {!activities?.length && (
              <div className="empty-state">
                <div className="title">No activity yet</div>
                Activity will appear here as your business moves.
              </div>
            )}
            {activities?.map((act) => (
              <div className="timeline-item" key={act.id}>
                <div className="timeline-time">
                  {new Date(act.occurred_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="timeline-text">{act.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
