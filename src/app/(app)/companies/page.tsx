import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { money } from '@/lib/utils';
import { Search } from 'lucide-react';
import { NewCompanyModal } from '@/components/NewCompanyModal';

export const dynamic = 'force-dynamic';

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const search = params.q || '';
  const supabase = await createClient();

  let query = supabase.from('companies').select('*, contacts(count), opportunities(value, stage)').order('name');
  if (search) query = query.ilike('name', `%${search}%`);
  const { data: companies } = await query;

  const rows = (companies ?? []).map((c: any) => ({
    ...c,
    contact_count: c.contacts?.[0]?.count ?? 0,
    pipeline_value: (c.opportunities ?? []).filter((o: any) => !['won', 'lost'].includes(o.stage)).reduce((s: number, o: any) => s + (o.value || 0), 0),
  })).sort((a: any, b: any) => b.pipeline_value - a.pipeline_value);

  return (
    <div className="page">
      <div className="profile-header">
        <div>
          <div className="page-title">Companies</div>
          <div className="page-subtitle">The organizations behind your relationships.</div>
        </div>
        <NewCompanyModal />
      </div>

      <form className="filter-bar">
        <div className="search-box max-w-[320px]">
          <Search size={15} strokeWidth={1.7} />
          <input type="text" name="q" defaultValue={search} placeholder="Search companies…" />
        </div>
      </form>

      <div className="table-wrap panel">
        <table className="data-table">
          <thead><tr><th>Company</th><th>Industry</th><th>Contacts</th><th>Open Pipeline</th><th>Relationship</th></tr></thead>
          <tbody>
            {!rows.length && <tr><td colSpan={5}><div className="empty-state"><div className="title">No companies yet</div>Add a company to start tracking the relationship.</div></td></tr>}
            {rows.map((c: any) => (
              <tr key={c.id}>
                <td><Link href={`/companies/${c.id}`} className="font-bold">{c.name}</Link></td>
                <td>{c.industry || '—'}</td>
                <td>{c.contact_count}</td>
                <td>{money(c.pipeline_value)}</td>
                <td>
                  <span className={`pill pill-${c.relationship_health === 'healthy' ? 'customer' : c.relationship_health === 'at_risk' ? 'lost' : 'lead'}`}>
                    {c.relationship_health.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
