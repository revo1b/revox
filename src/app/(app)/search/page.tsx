import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const term = params.q || '';
  const supabase = await createClient();

  let contacts: any[] = [], companies: any[] = [], opportunities: any[] = [], emails: any[] = [], tasks: any[] = [];

  if (term) {
    const like = `%${term}%`;
    [
      { data: contacts },
      { data: companies },
      { data: opportunities },
      { data: emails },
      { data: tasks },
    ] = await Promise.all([
      supabase.from('contacts').select('*').ilike('name', like).limit(6),
      supabase.from('companies').select('*').ilike('name', like).limit(6),
      supabase.from('opportunities').select('*').ilike('title', like).limit(6),
      supabase.from('email_threads').select('*').ilike('subject', like).limit(6),
      supabase.from('tasks').select('*').ilike('title', like).limit(6),
    ]) as any;
  }

  const hasResults = contacts.length || companies.length || opportunities.length || emails.length || tasks.length;

  return (
    <div className="page">
      <div className="page-title">Search results for &quot;{term}&quot;</div>
      <div className="page-subtitle mb-5">Across contacts, companies, opportunities, email, and tasks.</div>

      {!!contacts.length && (
        <>
          <div className="section-label mt-4.5">Contacts</div>
          <div className="panel py-1">{contacts.map((r) => <Link key={r.id} href={`/contacts/${r.id}`} className="email-list-item block">{r.name}</Link>)}</div>
        </>
      )}
      {!!companies.length && (
        <>
          <div className="section-label mt-4.5">Companies</div>
          <div className="panel py-1">{companies.map((r) => <Link key={r.id} href={`/companies/${r.id}`} className="email-list-item block">{r.name}</Link>)}</div>
        </>
      )}
      {!!opportunities.length && (
        <>
          <div className="section-label mt-4.5">Opportunities</div>
          <div className="panel py-1">{opportunities.map((r) => <Link key={r.id} href={`/opportunities/${r.id}`} className="email-list-item block">{r.title}</Link>)}</div>
        </>
      )}
      {!!emails.length && (
        <>
          <div className="section-label mt-4.5">Emails</div>
          <div className="panel py-1">{emails.map((r) => <Link key={r.id} href={`/email/${r.id}`} className="email-list-item block">{r.subject}</Link>)}</div>
        </>
      )}
      {!!tasks.length && (
        <>
          <div className="section-label mt-4.5">Tasks</div>
          <div className="panel py-1">{tasks.map((r) => <Link key={r.id} href="/tasks" className="email-list-item block">{r.title}</Link>)}</div>
        </>
      )}

      {term && !hasResults && (
        <div className="empty-state"><div className="title">No results found</div>Try a different search term.</div>
      )}
    </div>
  );
}
