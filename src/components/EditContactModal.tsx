'use client';

import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { createOrUpdateContact } from '@/lib/actions/contacts';
import type { Contact } from '@/lib/types';

export function EditContactModal({ contact }: { contact: Contact }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        <ChevronDown size={14} strokeWidth={1.7} /> More
      </button>
      <div className={`modal-backdrop ${open ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <div className="modal-box">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Edit Contact</h3>
            <button onClick={() => setOpen(false)} className="text-ink-faint"><X size={18} /></button>
          </div>
          <form action={createOrUpdateContact} className="space-y-3.5">
            <input type="hidden" name="id" value={contact.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="form-field"><label>Full Name</label><input type="text" name="name" defaultValue={contact.name} required /></div>
              <div className="form-field"><label>Position</label><input type="text" name="position" defaultValue={contact.position ?? ''} /></div>
              <div className="form-field"><label>Email</label><input type="email" name="email" defaultValue={contact.email ?? ''} /></div>
              <div className="form-field"><label>Phone</label><input type="text" name="phone" defaultValue={contact.phone ?? ''} /></div>
              <div className="form-field">
                <label>Status</label>
                <select name="status" defaultValue={contact.status}>
                  <option value="lead">Lead</option>
                  <option value="prospect">Prospect</option>
                  <option value="customer">Customer</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-field"><label>Tags</label><input type="text" name="tags" defaultValue={contact.tags ?? ''} /></div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
