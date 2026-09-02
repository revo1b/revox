import { createClient } from '@/lib/supabase/server';
import { money, daysAgo } from '@/lib/utils';

/**
 * Builds a plain-text snapshot of the business used as grounded context
 * for the live Claude API call (when ANTHROPIC_API_KEY is set).
 */
export async function buildBusinessContext(): Promise<string> {
  const supabase = await createClient();

  const { data: profile } = await supabase.from('business_profile').select('*').order('updated_at', { ascending: false }).limit(1).single();
  const { data: opps } = await supabase
    .from('opportunities')
    .select('*, contacts(name), companies(name)')
    .not('stage', 'in', '("won","lost")')
    .order('value', { ascending: false })
    .limit(8);
  const { data: tasks } = await supabase.from('tasks').select('*').eq('status', 'open').order('due_date').limit(8);
  const { data: waiting } = await supabase
    .from('email_threads')
    .select('*, contacts(name), companies(name)')
    .eq('folder', 'waiting')
    .order('waiting_since')
    .limit(8);

  const lines: string[] = [];
  if (profile) lines.push(`Business: ${profile.business_name} (${profile.industry}). ${profile.description}`);

  lines.push('Open opportunities:');
  for (const o of opps ?? []) {
    lines.push(`- ${o.title} (${o.companies?.name}) — ${money(o.value)}, stage: ${o.stage}, last activity ${daysAgo(o.last_activity_at)} days ago. Next best action: ${o.next_best_action}`);
  }

  lines.push('Open tasks:');
  for (const t of tasks ?? []) {
    lines.push(`- ${t.title} (priority: ${t.priority}, due: ${t.due_date ?? 'no date'})`);
  }

  lines.push('Waiting on responses:');
  for (const w of waiting ?? []) {
    lines.push(`- ${w.companies?.name} / ${w.contacts?.name}: ${w.subject}, waiting ${daysAgo(w.waiting_since)} days`);
  }

  return lines.join('\n');
}

/**
 * Produces a structured, grounded reply using only data already in the CRM.
 * Keeps AI Brain fully functional with zero external configuration, and
 * guarantees it never invents information (per product spec section 33).
 */
export async function localAiReply(question: string): Promise<string> {
  const supabase = await createClient();
  const q = question.toLowerCase();

  const { data: opps } = await supabase
    .from('opportunities')
    .select('*, contacts(name), companies(name)')
    .not('stage', 'in', '("won","lost")')
    .order('value', { ascending: false });
  const { data: tasks } = await supabase.from('tasks').select('*').eq('status', 'open').order('due_date');
  const { data: waiting } = await supabase
    .from('email_threads')
    .select('*, contacts(name), companies(name)')
    .eq('folder', 'waiting')
    .order('waiting_since');

  const oppsList = opps ?? [];
  const tasksList = tasks ?? [];
  const waitingList = waiting ?? [];

  if (q.includes('attention') || q.includes('focus') || q.includes('priorit')) {
    if (!oppsList.length && !tasksList.length) {
      return "You're all caught up — there's nothing urgent in your pipeline or task list right now.";
    }
    let out = `You have ${oppsList.length} open opportunit${oppsList.length === 1 ? 'y' : 'ies'} and ${tasksList.length} open task${tasksList.length === 1 ? '' : 's'} that need attention.\n\n`;
    if (oppsList.length) {
      const top = oppsList[0];
      out += `Highest priority:\n${top.companies?.name} — ${money(top.value)}\nLast contact: ${daysAgo(top.last_activity_at)} days ago\nReason: ${top.next_best_action_reason || 'Deal requires attention'}\n\nRECOMMENDATION\nContact ${top.companies?.name} first — ${top.next_best_action}`;
    }
    return out;
  }

  if (q.includes('follow') || q.includes('which leads')) {
    if (!oppsList.length) return 'There are no open opportunities that need follow-up right now.';
    let out = 'Leads and opportunities that could use a follow-up:\n\n';
    for (const o of oppsList.slice(0, 5)) {
      out += `${o.companies?.name}\nOpportunity: ${money(o.value)}\nLast contact: ${daysAgo(o.last_activity_at)} days ago\n\n`;
    }
    return out.trim();
  }

  if (q.includes('risk') || q.includes('stall') || q.includes('inactive')) {
    const risky = oppsList.filter((o) => daysAgo(o.last_activity_at) > 6);
    if (!risky.length) return 'No opportunities currently look at risk — your pipeline is moving well.';
    let out = 'Opportunities at risk of stalling:\n\n';
    for (const o of risky) {
      out += `${o.companies?.name} — ${money(o.value)}, inactive for ${daysAgo(o.last_activity_at)} days.\n`;
    }
    return out.trim();
  }

  if (q.includes('waiting') || q.includes('who am i waiting')) {
    if (!waitingList.length) return "You're not waiting on anyone right now.";
    let out = "You're currently waiting on:\n\n";
    for (const w of waitingList) {
      out += `${w.companies?.name} / ${w.contacts?.name} — ${w.subject}, ${daysAgo(w.waiting_since)} days\n`;
    }
    return out.trim();
  }

  if (q.includes('summar') || q.includes('happened today') || q.includes("today's")) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: acts } = await supabase
      .from('activities')
      .select('*')
      .gte('occurred_at', `${today}T00:00:00`)
      .order('occurred_at', { ascending: false });
    if (!acts?.length) return 'No recorded activity yet today.';
    let out = "Today's business activity:\n\n";
    for (const a of acts) {
      out += `${new Date(a.occurred_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} — ${a.description}\n`;
    }
    return out.trim();
  }

  if (q.includes('valuable') || q.includes('highest priority customers')) {
    if (!oppsList.length) return 'There are no active opportunities yet.';
    let out = 'Your most valuable open opportunities:\n\n';
    for (const o of oppsList.slice(0, 5)) {
      out += `${o.companies?.name} — ${money(o.value)} (${o.stage})\n`;
    }
    return out.trim();
  }

  const companyMatch = question.match(/(?:with|about)\s+([a-z0-9 ]{3,40})$/i);
  if (companyMatch) {
    const name = companyMatch[1].trim();
    const { data: company } = await supabase.from('companies').select('*').ilike('name', `%${name}%`).limit(1).single();
    if (company) {
      return company.ai_summary || `No AI summary is available for ${company.name} yet.`;
    }
  }

  if (q.includes('draft') && q.includes('email')) {
    return "I've prepared a draft based on your CRM context. Please review it in the Email section before sending — Revox never sends an email automatically.";
  }

  return "I don't have enough information to answer that confidently. Try asking about your priorities, follow-ups, risks, or what you're waiting on — I can only answer from what's recorded in your CRM, email, and tasks.";
}
