'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '');
  const due_date = String(formData.get('due_date') || '') || null;
  const priority = String(formData.get('priority') || 'medium');
  const contact_id = String(formData.get('contact_id') || '') || null;
  const company_id = String(formData.get('company_id') || '') || null;
  const opportunity_id = String(formData.get('opportunity_id') || '') || null;
  const redirectPath = String(formData.get('redirect_path') || '/tasks');

  if (!title) return;

  await supabase.from('tasks').insert({
    title, description, due_date, priority, contact_id, company_id, opportunity_id,
  });
  await supabase.from('audit_logs').insert({ action: 'Created task', details: title });

  revalidatePath(redirectPath);
  revalidatePath('/tasks');
  revalidatePath('/');
}

export async function toggleTask(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id') || '');
  const redirectPath = String(formData.get('redirect_path') || '/tasks');

  const { data: task } = await supabase.from('tasks').select('*').eq('id', id).single();
  if (!task) return;

  const newStatus = task.status === 'open' ? 'completed' : 'open';
  await supabase.from('tasks').update({ status: newStatus }).eq('id', id);

  if (newStatus === 'completed') {
    await supabase.from('activities').insert({
      contact_id: task.contact_id,
      company_id: task.company_id,
      opportunity_id: task.opportunity_id,
      type: 'task',
      description: `Task completed — ${task.title}`,
    });
  }

  revalidatePath(redirectPath);
  revalidatePath('/tasks');
  revalidatePath('/');
}

export async function createNote(formData: FormData) {
  const supabase = await createClient();
  const body = String(formData.get('body') || '').trim();
  const contact_id = String(formData.get('contact_id') || '') || null;
  const company_id = String(formData.get('company_id') || '') || null;
  const opportunity_id = String(formData.get('opportunity_id') || '') || null;
  const redirectPath = String(formData.get('redirect_path') || '/');

  if (!body) return;

  await supabase.from('notes').insert({ body, contact_id, company_id, opportunity_id });
  await supabase.from('activities').insert({
    contact_id, company_id, opportunity_id, type: 'note', description: 'Note added',
  });

  revalidatePath(redirectPath);
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get('title') || '').trim();
  const starts_at = String(formData.get('starts_at') || '');
  const ends_at = String(formData.get('ends_at') || '');
  const contact_id = String(formData.get('contact_id') || '') || null;

  if (!title || !starts_at || !ends_at) return;

  await supabase.from('appointments').insert({ title, starts_at, ends_at, contact_id });
  await supabase.from('audit_logs').insert({ action: 'Created calendar event', details: title });

  revalidatePath('/calendar');
}
