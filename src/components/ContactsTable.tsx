import Link from 'next/link';
import { timeAgo } from '@/lib/utils';
import type { Contact } from '@/lib/types';

export function ContactsTable({ rows }: { rows: Contact[] }) {
  return (
    <div className="table-wrap panel">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th><th>Company</th><th>Position</th><th>Email</th><th>Phone</th>
            <th>Status</th><th>Last Activity</th><th>AI Score</th><th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {!rows.length && (
            <tr><td colSpan={9}><div className="empty-state"><div className="title">No records yet</div>Your customer relationships start here.</div></td></tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className="cursor-pointer">
              <td>
                <Link href={`/contacts/${r.id}`} className="font-bold block">{r.name}</Link>
              </td>
              <td>{r.companies?.name || '—'}</td>
              <td>{r.position || '—'}</td>
              <td>{r.email || '—'}</td>
              <td>{r.phone || '—'}</td>
              <td><span className={`pill pill-${r.status}`}>{r.status[0].toUpperCase() + r.status.slice(1)}</span></td>
              <td>{timeAgo(r.last_activity_at)}</td>
              <td>{r.ai_score}</td>
              <td>{r.tags || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
