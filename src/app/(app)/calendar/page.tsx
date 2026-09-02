import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { NewEventModal } from '@/components/NewEventModal';

export const dynamic = 'force-dynamic';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string; y?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const month = parseInt(params.m || String(now.getMonth() + 1), 10);
  const year = parseInt(params.y || String(now.getFullYear()), 10);

  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = firstDay.getDay();

  const supabase = await createClient();
  const monthStart = new Date(year, month - 1, 1).toISOString();
  const monthEnd = new Date(year, month, 1).toISOString();

  const { data: events } = await supabase
    .from('appointments')
    .select('*, contacts(name), companies(name)')
    .gte('starts_at', monthStart)
    .lt('starts_at', monthEnd);

  const { data: upcoming } = await supabase
    .from('appointments')
    .select('*')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at')
    .limit(5);

  const { data: contacts } = await supabase.from('contacts').select('id, name').order('name');

  const eventsByDay: Record<number, typeof events> = {};
  for (const ev of events ?? []) {
    const d = new Date(ev.starts_at).getDate();
    (eventsByDay[d] ||= []).push(ev);
  }

  let prevM = month - 1, prevY = year;
  if (prevM < 1) { prevM = 12; prevY--; }
  let nextM = month + 1, nextY = year;
  if (nextM > 12) { nextM = 1; nextY++; }

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="page">
      <div className="profile-header">
        <div>
          <div className="page-title">Calendar</div>
          <div className="page-subtitle">{firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
        </div>
        <div className="flex gap-2">
          <Link className="btn" href={`?m=${prevM}&y=${prevY}`}>&larr; Prev</Link>
          <Link className="btn" href={`?m=${nextM}&y=${nextY}`}>Next &rarr;</Link>
          <NewEventModal contacts={contacts ?? []} />
        </div>
      </div>

      <div className="cal-grid">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="cal-cell min-h-0 bg-bg-soft font-bold text-center">{wd}</div>
        ))}
        {Array.from({ length: startWeekday }).map((_, i) => <div key={`empty-${i}`} className="cal-cell bg-bg-soft" />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const isToday = isCurrentMonth && d === now.getDate();
          return (
            <div key={d} className={`cal-cell ${isToday ? 'today' : ''}`}>
              <div className="font-bold mb-1.5 text-ink-soft">{d}</div>
              {eventsByDay[d]?.map((ev) => (
                <div key={ev.id} className="cal-event" title={ev.title}>
                  {new Date(ev.starts_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} {ev.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="section-label mt-6.5">Upcoming</div>
      <div className="panel py-1">
        {!upcoming?.length && <div className="empty-state py-6"><div className="title">Nothing scheduled</div></div>}
        {upcoming?.map((ev) => (
          <div key={ev.id} className="email-list-item">
            <div className="row1">
              <span>{ev.title}</span>
              <span className="time">{new Date(ev.starts_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {ev.ai_preparation && <div className="preview">AI prep: {ev.ai_preparation}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
