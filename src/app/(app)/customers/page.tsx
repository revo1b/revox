import { createClient } from '@/lib/supabase/server';
import { ContactsTable } from '@/components/ContactsTable';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from('contacts')
    .select('*, companies(name)')
    .eq('status', 'customer')
    .order('last_activity_at', { ascending: false, nullsFirst: false });

  return (
    <div className="page">
      <div className="profile-header">
        <div>
          <div className="page-title">Customers</div>
          <div className="page-subtitle">The relationships that are already generating revenue.</div>
        </div>
      </div>
      <ContactsTable rows={rows ?? []} />
    </div>
  );
}
