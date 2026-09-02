import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { money, daysAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const supabase = await createClient();

  const [
    { data: pipelineOpps },
    { count: activeOpps },
    { count: wonCount },
    { data: wonOpps },
    { count: lostCount },
    { data: agingCandidate },
    { count: activeCustomers },
    { count: incoming },
    { count: outgoing },
    { count: waiting },
    { data: risky },
  ] = await Promise.all([
    supabase.from('opportunities').select('value').not('stage', 'in', '("won","lost")'),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).not('stage', 'in', '("won","lost")'),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('stage', 'won'),
    supabase.from('opportunities').select('value').eq('stage', 'won'),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('stage', 'lost'),
    supabase.from('opportunities').select('*, companies(name)').not('stage', 'in', '("won","lost")').order('last_activity_at'),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'customer'),
    supabase.from('emails').select('*', { count: 'exact', head: true }).eq('direction', 'inbound'),
    supabase.from('emails').select('*', { count: 'exact', head: true }).eq('direction', 'outbound'),
    supabase.from('email_threads').select('*', { count: 'exact', head: true }).eq('folder', 'waiting'),
    supabase.from('opportunities').select('*, companies(name)').not('stage', 'in', '("won","lost")').order('value', { ascending: false }).limit(3),
  ]);

  const pipelineValue = (pipelineOpps ?? []).reduce((s, o) => s + (o.value || 0), 0);
  const wonValue = (wonOpps ?? []).reduce((s, o) => s + (o.value || 0), 0);
  const totalClosed = (wonCount ?? 0) + (lostCount ?? 0);
  const conversion = totalClosed > 0 ? Math.round(((wonCount ?? 0) / totalClosed) * 100) : 0;
  const aging = (agingCandidate ?? []).filter((o) => daysAgo(o.last_activity_at) > 7);

  return (
    <div className="page">
      <div className="profile-header">
        <div>
          <div className="page-title">Insights</div>
          <div className="page-subtitle">A focused view of how the business is performing.</div>
        </div>
      </div>

      <div className="grid-3">
        <div className="panel p-4.5">
          <div className="section-label">Sales</div>
          <div className="stat-strip border-none py-1.5">
            <div><div className="stat-label">Pipeline</div><div className="stat-value">{money(pipelineValue)}</div></div>
            <div><div className="stat-label">Active</div><div className="stat-value">{activeOpps ?? 0}</div></div>
          </div>
          <div className="stat-strip border-none py-1.5">
            <div><div className="stat-label">Won</div><div className="stat-value text-green">{wonCount ?? 0}</div></div>
            <div><div className="stat-label">Lost</div><div className="stat-value text-red">{lostCount ?? 0}</div></div>
            <div><div className="stat-label">Conversion</div><div className="stat-value">{conversion}%</div></div>
          </div>
        </div>

        <div className="panel p-4.5">
          <div className="section-label">Customer</div>
          <div className="stat-strip border-none py-1.5">
            <div><div className="stat-label">Active Customers</div><div className="stat-value">{activeCustomers ?? 0}</div></div>
            <div><div className="stat-label">Won Value</div><div className="stat-value">{money(wonValue)}</div></div>
          </div>
        </div>

        <div className="panel p-4.5">
          <div className="section-label">Email</div>
          <div className="stat-strip border-none py-1.5">
            <div><div className="stat-label">Incoming</div><div className="stat-value">{incoming ?? 0}</div></div>
            <div><div className="stat-label">Outgoing</div><div className="stat-value">{outgoing ?? 0}</div></div>
          </div>
          <div className="stat-strip border-none py-1.5">
            <div><div className="stat-label">Waiting</div><div className="stat-value text-amber">{waiting ?? 0}</div></div>
          </div>
        </div>
      </div>

      <div className="grid-2 mt-5">
        <div>
          <div className="section-label">Aging Opportunities</div>
          <div className="panel py-1">
            {!aging.length && <div className="empty-state py-6"><div className="title">Nothing aging</div>Your pipeline is moving well.</div>}
            {aging.map((o) => (
              <Link key={o.id} href={`/opportunities/${o.id}`} className="email-list-item block">
                <div className="row1"><span>{o.companies?.name || o.title}</span><span className="time">{money(o.value)}</span></div>
                <div className="preview">Inactive for {daysAgo(o.last_activity_at)} days</div>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="section-label">AI: High-Intent Prospects</div>
          <div className="panel py-1">
            {risky?.map((o) => (
              <Link key={o.id} href={`/opportunities/${o.id}`} className="email-list-item block">
                <div className="row1"><span>{o.companies?.name || o.title}</span><span className="time">{money(o.value)}</span></div>
                <div className="preview">{o.next_best_action || 'Recommended action pending'}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
