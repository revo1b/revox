import { createClient } from '@/lib/supabase/server';
import { ContactsTable } from '@/components/ContactsTable';
import { NewContactModal } from '@/components/NewContactModal';
import Link from 'next/link';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string }>;
}) {
  const params = await searchParams;
  const view = params.view || 'all';
  const search = params.q || '';
  const supabase = await createClient();

  let query = supabase.from('contacts').select('*, companies(name)').order('last_activity_at', { ascending: false, nullsFirst: false });

  if (view === 'leads') query = query.eq('status', 'lead');
  if (view === 'prospects') query = query.eq('status', 'prospect');
  if (view === 'customers') query = query.eq('status', 'customer');
  if (search) query = query.ilike('name', `%${search}%`);

  const { data: rows } = await query;
  const { data: companies } = await supabase.from('companies').select('id, name').order('name');

  return (
    <div className="page">
      <div className="profile-header">
        <div>
          <div className="page-title">Contacts</div>
          <div className="page-subtitle">Every person you do business with, in one place.</div>
        </div>
        <NewContactModal companies={companies ?? []} />
      </div>

      <div className="tab-row">
        <Link className={`tab-item ${view === 'all' ? 'active' : ''}`} href="?view=all">All Contacts</Link>
        <Link className={`tab-item ${view === 'leads' ? 'active' : ''}`} href="?view=leads">New Leads</Link>
        <Link className={`tab-item ${view === 'prospects' ? 'active' : ''}`} href="?view=prospects">Hot Prospects</Link>
        <Link className={`tab-item ${view === 'customers' ? 'active' : ''}`} href="?view=customers">Customers</Link>
      </div>

      <form className="filter-bar">
        <input type="hidden" name="view" value={view} />
        <div className="search-box max-w-[320px]">
          <Search size={15} strokeWidth={1.7} />
          <input type="text" name="q" defaultValue={search} placeholder="Search contacts…" />
        </div>
      </form>

      <ContactsTable rows={rows ?? []} />
    </div>
  );
}
