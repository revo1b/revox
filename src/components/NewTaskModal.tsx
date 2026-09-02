'use client';

import { useState } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { createTask } from '@/lib/actions/tasks';

export function NewTaskModal({
  contactId,
  companyId,
  opportunityId,
  redirectPath,
  triggerLabel = 'Task',
}: {
  contactId?: string;
  companyId?: string;
  opportunityId?: string;
  redirectPath: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}>
        <CheckSquare size={14} strokeWidth={1.7} /> {triggerLabel}
      </button>
      <div className={`modal-backdrop ${open ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <div className="modal-box">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">New Task</h3>
            <button onClick={() => setOpen(false)} className="text-ink-faint"><X size={18} /></button>
          </div>
          <form action={createTask} className="space-y-3.5">
            {contactId && <input type="hidden" name="contact_id" value={contactId} />}
            {companyId && <input type="hidden" name="company_id" value={companyId} />}
            {opportunityId && <input type="hidden" name="opportunity_id" value={opportunityId} />}
            <input type="hidden" name="redirect_path" value={redirectPath} />
            <div className="form-field"><label>Title</label><input type="text" name="title" required /></div>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="form-field"><label>Due Date</label><input type="date" name="due_date" /></div>
              <div className="form-field">
                <label>Priority</label>
                <select name="priority" defaultValue="medium">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Task</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
