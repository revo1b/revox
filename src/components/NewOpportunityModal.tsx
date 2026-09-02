'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { createOpportunity } from '@/lib/actions/opportunities';

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

export function NewOpportunityModal({
  companies,
  contacts,
}: {
  companies: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        <Plus size={14} strokeWidth={1.7} /> New Opportunity
      </button>
      <div className={`modal-backdrop ${open ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <div className="modal-box">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">New Opportunity</h3>
            <button onClick={() => setOpen(false)} className="text-ink-faint"><X size={18} /></button>
          </div>
          <form action={createOpportunity} className="space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="form-field md:col-span-2"><label>Title</label><input type="text" name="title" required /></div>
              <div className="form-field">
                <label>Company</label>
                <select name="company_id">
                  <option value="">— None —</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Contact</label>
                <select name="contact_id">
                  <option value="">— None —</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-field"><label>Value (TSh)</label><input type="number" step="0.01" name="value" /></div>
              <div className="form-field">
                <label>Stage</label>
                <select name="stage" defaultValue="new">
                  {STAGES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-field"><label>Expected Close</label><input type="date" name="expected_close" /></div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Opportunity</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
