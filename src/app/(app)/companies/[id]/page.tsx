import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { money, timeAgo, initials } from '@/lib/utils';
import { Phone } from 'lucide-react';
import { NewContactModal } from '@/components/NewContactModal';

export const dynamic = 'force-dynamic';

export default async function CompanyViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase.from('companies').select('*').eq('id', id).single();
  if (!company) notFound();

  const [{ data: contacts }, { data: opps }, { data: emails }, { data: activities }] = await Promise.all([
    supabase.from('contacts').select('*').eq('company_id', id).order('ai_score', { ascending: false }),
    supabase.from('opportunities').select('*').eq('company_id', id).order('value', { ascending: false }),
    supabase.from('email_threads').select('*').eq('company_id', id).order('last_message_at', { ascending: false }),
    supabase.from('activities').select('*').eq('company_id', id).order('occurred_at', { ascending: false }).limit(10),
  ]);

  const pipelineValue = (opps ?? []).filter((o) => !['won', 'lost'].includes(o.stage)).reduce((s, o) => s + (o.value || 0), 0);

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-id">
          <div className="avatar w-[52px] h-[52px] text-lg">{initials(company.name)}</div>
          <div>
            <div className="text-[19px] font-bold">{company.name}</div>
            <div className="text-ink-soft text-[13px] mt-0.5">{company.industry || '—'}{company.website ? ` · ${company.website}` : ''}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {company.phone && <a className="btn" href={`tel:${company.phone}`}><Phone size={14} strokeWidth={1.7} /> Call</a>}
          <NewContactModal companies={[]} fixedCompanyId={id} triggerLabel="Add Contact" />
        </div>
      </div>

      <div className="stat-strip">
        <div><div className="stat-label">Contacts</div><div className="stat-value">{contacts?.length ?? 0}</div></div>
        <div><div className="stat-label">Open Pipeline</div><div className="stat-value">{money(pipelineValue)}</div></div>
        <div><div className="stat-label">Relationship</div><div className="stat-value capitalize">{company.relationship_health.replace('_', ' ')}</div></div>
      </div>

      {company.ai_summary && <div className="ai-summary-box"><div className="label">AI Summary</div>{company.ai_summary}</div>}

      <div className="grid-2">
        <div>
          <div className="section-label">Opportunities</div>
          <div className="panel py-1">
            {!opps?.length && <div className="empty-state py-6"><div className="title">No opportunities yet</div></div>}
            {opps?.map((o) => (
              <Link key={o.id} href={`/opportunities/${o.id}`} className="email-list-item block">
                <div className="row1"><span>{o.title}</span><span className="time">{money(o.value)}</span></div>
                <div className="preview"><span className={`pill pill-${o.stage}`}>{o.stage[0].toUpperCase() + o.stage.slice(1)}</span></div>
              </Link>
            ))}
          </div>

          <div className="section-label mt-5.5">Email History</div>
          <div className="panel py-1">
            {!emails?.length && <div className="empty-state py-6"><div className="title">No emails yet</div></div>}
            {emails?.map((t) => (
              <Link key={t.id} href={`/email/${t.id}`} className="email-list-item block">
                <div className="row1"><span>{t.subject}</span><span className="time">{timeAgo(t.last_message_at)}</span></div>
              </Link>
            ))}
          </div>

          <div className="section-label mt-5.5">Activities</div>
          <div className="panel px-4.5">
            {!activities?.length && <div className="empty-state py-6"><div className="title">No activity yet</div></div>}
            {activities?.map((a) => (
              <div className="timeline-item" key={a.id}>
                <div className="timeline-time">{timeAgo(a.occurred_at)}</div>
                <div className="timeline-text">{a.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-label">Contacts</div>
          <div className="card p-2">
            {contacts?.map((c) => (
              <Link key={c.id} href={`/contacts/${c.id}`} className="flex items-center gap-2.5 p-2 rounded-sm hover:bg-bg-soft">
                <div className="avatar w-8 h-8 text-xs">{initials(c.name)}</div>
                <div>
                  <div className="font-semibold text-[13px]">{c.name}</div>
                  <div className="text-[11.5px] text-ink-faint">{c.position}</div>
                </div>
              </Link>
            ))}
            {!contacts?.length && <span className="text-ink-faint text-[13px]">No contacts linked yet.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
