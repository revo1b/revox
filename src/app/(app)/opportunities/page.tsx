import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { money, formatDate } from '@/lib/utils';
import { NewOpportunityModal } from '@/components/NewOpportunityModal';

export const dynamic = 'force-dynamic';

const STAGE_LABELS: Record<string, string> = {
  new: 'New', contacted: 'Contacted', qualified: 'Qualified', proposal: 'Proposal',
  negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
};

export default async function OpportunitiesPage() {
  const supabase = await createClient();
  const [{ data: opps }, { data: companies }, { data: contacts }] = await Promise.all([
    supabase.from('opportunities').select('*, contacts(name), companies(name)').order('updated_at', { ascending: false }),
    supabase.from('companies').select('id, name').order('name'),
    supabase.from('contacts').select('id, name').order('name'),
  ]);

  return (
    <div className="page">
      <div className="profile-header">
        <div>
          <div className="page-title">Opportunities</div>
          <div className="page-subtitle">Every active deal, with the context to close it.</div>
        </div>
        <NewOpportunityModal companies={companies ?? []} contacts={contacts ?? []} />
      </div>

      <div className="table-wrap panel">
        <table className="data-table">
          <thead><tr><th>Opportunity</th><th>Company</th><th>Contact</th><th>Value</th><th>Stage</th><th>Probability</th><th>Expected Close</th></tr></thead>
          <tbody>
            {!opps?.length && <tr><td colSpan={7}><div className="empty-state"><div className="title">No opportunities yet</div>Create your first opportunity to start tracking a deal.</div></td></tr>}
            {opps?.map((o) => (
              <tr key={o.id}>
                <td><Link href={`/opportunities/${o.id}`} className="font-bold">{o.title}</Link></td>
                <td>{o.companies?.name || '—'}</td>
                <td>{o.contacts?.name || '—'}</td>
                <td>{money(o.value)}</td>
                <td><span className={`pill pill-${o.stage}`}>{STAGE_LABELS[o.stage]}</span></td>
                <td>{o.probability}%</td>
                <td>{o.expected_close ? formatDate(o.expected_close) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
