'use client';

import { createNote } from '@/lib/actions/tasks';

export function NoteForm({
  contactId,
  companyId,
  opportunityId,
  redirectPath,
  notes,
}: {
  contactId?: string;
  companyId?: string;
  opportunityId?: string;
  redirectPath: string;
  notes: { id: string; body: string; created_at: string }[];
}) {
  return (
    <div className="card">
      {!notes.length && <span className="text-ink-faint text-[13px]">No notes yet.</span>}
      {notes.map((n) => (
        <div key={n.id} className="text-[13px] mb-2.5">
          {n.body}
          <div className="text-[11px] text-ink-faint">{new Date(n.created_at).toLocaleDateString()}</div>
        </div>
      ))}
      <form action={createNote} className="mt-2.5">
        {contactId && <input type="hidden" name="contact_id" value={contactId} />}
        {companyId && <input type="hidden" name="company_id" value={companyId} />}
        {opportunityId && <input type="hidden" name="opportunity_id" value={opportunityId} />}
        <input type="hidden" name="redirect_path" value={redirectPath} />
        <textarea name="body" rows={2} placeholder="Add a note…" className="w-full border border-border-strong rounded-sm p-2 text-[13px]" required />
        <button className="btn btn-sm mt-1.5" type="submit">Add Note</button>
      </form>
    </div>
  );
}
