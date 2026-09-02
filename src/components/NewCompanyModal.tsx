'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { createCompany } from '@/lib/actions/companies';

export function NewCompanyModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        <Plus size={14} strokeWidth={1.7} /> New Company
      </button>
      <div className={`modal-backdrop ${open ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <div className="modal-box">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">New Company</h3>
            <button onClick={() => setOpen(false)} className="text-ink-faint"><X size={18} /></button>
          </div>
          <form action={createCompany} className="space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="form-field md:col-span-2"><label>Company Name</label><input type="text" name="name" required /></div>
              <div className="form-field"><label>Industry</label><input type="text" name="industry" /></div>
              <div className="form-field"><label>Website</label><input type="text" name="website" /></div>
              <div className="form-field"><label>Phone</label><input type="text" name="phone" /></div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Company</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
