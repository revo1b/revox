'use client';

import { toggleTask } from '@/lib/actions/tasks';
import { CheckSquare } from 'lucide-react';

export function TaskToggleButton({ id, completed, redirectPath }: { id: string; completed: boolean; redirectPath: string }) {
  return (
    <form action={toggleTask}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="redirect_path" value={redirectPath} />
      <button type="submit" className="icon-btn w-[26px] h-[26px]" title={completed ? 'Mark as open' : 'Mark as completed'}>
        {completed && <CheckSquare size={14} strokeWidth={1.7} />}
      </button>
    </form>
  );
}
