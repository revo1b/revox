import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { TaskToggleButton } from '@/components/TaskToggleButton';
import { StandaloneNewTaskModal } from '@/components/StandaloneNewTaskModal';

export const dynamic = 'force-dynamic';

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view = params.view || 'today';
  const supabase = await createClient();

  let query = supabase.from('tasks').select('*, contacts(name), companies(name)');
  const today = new Date().toISOString().slice(0, 10);

  if (view === 'upcoming') query = query.eq('status', 'open').gt('due_date', today).order('due_date');
  else if (view === 'overdue') query = query.eq('status', 'open').lt('due_date', today).order('due_date');
  else if (view === 'completed') query = query.eq('status', 'completed').order('due_date', { ascending: false });
  else query = query.eq('status', 'open').order('priority');

  const { data: rows } = await query;

  return (
    <div className="page">
      <div className="profile-header">
        <div>
          <div className="page-title">Tasks</div>
          <div className="page-subtitle">Everything you need to execute on, in one queue.</div>
        </div>
        <StandaloneNewTaskModal />
      </div>

      <div className="tab-row">
        <Link className={`tab-item ${view === 'today' ? 'active' : ''}`} href="?view=today">Today</Link>
        <Link className={`tab-item ${view === 'upcoming' ? 'active' : ''}`} href="?view=upcoming">Upcoming</Link>
        <Link className={`tab-item ${view === 'overdue' ? 'active' : ''}`} href="?view=overdue">Overdue</Link>
        <Link className={`tab-item ${view === 'completed' ? 'active' : ''}`} href="?view=completed">Completed</Link>
      </div>

      <div className="panel px-4.5">
        {!rows?.length && <div className="empty-state"><div className="title">Nothing urgent today</div>You&apos;re on top of things.</div>}
        {rows?.map((t) => (
          <div className="timeline-item items-center" key={t.id}>
            <TaskToggleButton id={t.id} completed={t.status === 'completed'} redirectPath={`/tasks?view=${view}`} />
            <div className="timeline-text flex-1">
              <b className={t.status === 'completed' ? 'line-through text-ink-faint' : ''}>{t.title}</b>
              {(t.contacts?.name || t.companies?.name) && (
                <span className="text-ink-faint text-xs"> — {t.companies?.name || t.contacts?.name}</span>
              )}
            </div>
            <span className={`pill pill-${t.priority === 'high' ? 'lost' : t.priority === 'medium' ? 'proposal' : 'customer'}`}>
              {t.priority[0].toUpperCase() + t.priority.slice(1)}
            </span>
            <span className="w-20 text-right text-xs text-ink-faint">{t.due_date ? formatDate(t.due_date, { month: 'short', day: 'numeric' }) : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
