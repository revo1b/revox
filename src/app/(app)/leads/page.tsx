import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { money, daysAgo } from '@/lib/utils';
import type { Stage } from '@/lib/types';

export const dynamic = 'force-dynamic';

const STAGES: { key: Stage; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' },
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode || 'pipeline';
  const supabase = await createClient();

  const { data: opps } = await supabase
    .from('opportunities')
    .select('*, contacts(name), companies(name)')
    .order('value', { ascending: false });

  const byStage: Record<string, typeof opps> = {};
  for (const s of STAGES) byStage[s.key] = [];
  for (const o of opps ?? []) byStage[o.stage]?.push(o);

  return (
    <div className="page">
      <div className="profile-header">
        <div>
          <div className="page-title">Leads</div>
          <div className="page-subtitle">Your pipeline, from first contact to close.</div>
        </div>
        <Link className="btn btn-primary" href="/opportunities#new">+ New Lead</Link>
      </div>

      <div className="tab-row">
        <Link className={`tab-item ${mode === 'table' ? 'active' : ''}`} href="?mode=table">Table</Link>
        <Link className={`tab-item ${mode === 'pipeline' ? 'active' : ''}`} href="?mode=pipeline">Pipeline</Link>
      </div>

      {mode === 'pipeline' ? (
        <div className="flex gap-3.5 overflow-x-auto pb-2.5">
          {STAGES.map((s) => (
            <div key={s.key} className="min-w-[230px] flex-shrink-0">
              <div className="section-label flex justify-between">
                <span>{s.label}</span><span>{byStage[s.key]?.length ?? 0}</span>
              </div>
              {byStage[s.key]?.map((o) => {
                const age = daysAgo(o.last_activity_at);
                return (
                  <Link key={o.id} href={`/opportunities/${o.id}`} className="card block mb-2.5">
                    <div className="font-bold text-[13.5px]">{o.companies?.name || o.contacts?.name}</div>
                    <div className="text-[12.5px] text-ink-soft mt-0.5">{o.contacts?.name}</div>
                    <div className="font-bold text-teal mt-2 text-[13px]">{money(o.value)}</div>
                    <div className="flex justify-between text-[11.5px] text-ink-faint mt-2">
                      <span>{age}d old</span><span>AI {o.probability}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="table-wrap panel">
          <table className="data-table">
            <thead><tr><th>Company</th><th>Contact</th><th>Value</th><th>Stage</th><th>Age</th><th>Last Activity</th><th>AI Score</th></tr></thead>
            <tbody>
              {opps?.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/opportunities/${o.id}`} className="font-bold">{o.companies?.name || '—'}</Link></td>
                  <td>{o.contacts?.name || '—'}</td>
                  <td>{money(o.value)}</td>
                  <td><span className={`pill pill-${o.stage}`}>{STAGES.find((s) => s.key === o.stage)?.label}</span></td>
                  <td>{daysAgo(o.last_activity_at)}d</td>
                  <td>{daysAgo(o.last_activity_at)}d ago</td>
                  <td>{o.probability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
