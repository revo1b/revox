'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { createOrUpdateContact } from '@/lib/actions/contacts';

export function NewContactModal({
  companies,
  fixedCompanyId,
  triggerLabel = 'New Contact',
}: {
  companies: { id: string; name: string }[];
  fixedCompanyId?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        <Plus size={14} strokeWidth={1.7} /> {triggerLabel}
      </button>
      <div className={`modal-backdrop ${open ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <div className="modal-box">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">New Contact</h3>
            <button onClick={() => setOpen(false)} className="text-ink-faint"><X size={18} /></button>
          </div>
          <form action={createOrUpdateContact} className="space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="form-field"><label>Full Name</label><input type="text" name="name" required /></div>
              {fixedCompanyId ? (
                <input type="hidden" name="company_id" value={fixedCompanyId} />
              ) : (
                <div className="form-field">
                  <label>Company</label>
                  <select name="company_id">
                    <option value="">— None —</option>
                    {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-field"><label>Position</label><input type="text" name="position" /></div>
              <div className="form-field">
                <label>Status</label>
                <select name="status" defaultValue="lead">
                  <option value="lead">Lead</option>
                  <option value="prospect">Prospect</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              <div className="form-field"><label>Email</label><input type="email" name="email" /></div>
              <div className="form-field"><label>Phone</label><input type="text" name="phone" /></div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Contact</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
