'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { createEvent } from '@/lib/actions/tasks';

export function NewEventModal({ contacts }: { contacts: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        <Plus size={14} strokeWidth={1.7} /> New Event
      </button>
      <div className={`modal-backdrop ${open ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <div className="modal-box">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">New Event</h3>
            <button onClick={() => setOpen(false)} className="text-ink-faint"><X size={18} /></button>
          </div>
          <form action={createEvent} className="space-y-3.5">
            <div className="form-field"><label>Title</label><input type="text" name="title" required /></div>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="form-field"><label>Starts</label><input type="datetime-local" name="starts_at" required /></div>
              <div className="form-field"><label>Ends</label><input type="datetime-local" name="ends_at" required /></div>
            </div>
            <div className="form-field">
              <label>Contact</label>
              <select name="contact_id">
                <option value="">— None —</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Event</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
