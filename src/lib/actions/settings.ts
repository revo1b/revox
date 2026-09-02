'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient();
  const full_name = String(formData.get('full_name') || '').trim();

  if (!full_name) return;

  await supabase.auth.updateUser({ data: { full_name } });
  revalidatePath('/settings');
}

export async function updateBusinessProfile(formData: FormData) {
  const supabase = await createClient();
  const business_name = String(formData.get('business_name') || '').trim();
  const industry = String(formData.get('industry') || '');
  const description = String(formData.get('description') || '');
  const services = String(formData.get('services') || '');

  if (!business_name) return;

  const { data: existing } = await supabase.from('business_profile').select('id').order('updated_at', { ascending: false }).limit(1).single();

  if (existing) {
    await supabase.from('business_profile').update({ business_name, industry, description, services, updated_at: new Date().toISOString() }).eq('id', existing.id);
  } else {
    await supabase.from('business_profile').insert({ business_name, industry, description, services });
  }

  await supabase.from('audit_logs').insert({ action: 'Updated business profile', details: business_name });
  revalidatePath('/settings');
}

export async function addKnowledgeSource(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get('title') || '').trim();
  const type = String(formData.get('type') || 'document');
  const content = String(formData.get('content') || '');
  const file = formData.get('file') as File | null;

  if (!title) return;

  let file_path: string | null = null;

  if (file && file.size > 0) {
    const safeName = `${Date.now()}_${file.name.replace(/[^A-Za-z0-9._-]/g, '_')}`;
    const { data, error } = await supabase.storage.from('knowledge').upload(safeName, file, { upsert: false });
    if (!error && data) {
      file_path = data.path;
    }
  }

  await supabase.from('knowledge_sources').insert({ title, type, content, file_path });
  await supabase.from('audit_logs').insert({ action: 'Added knowledge source', details: title });
  revalidatePath('/settings');
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const new_password = String(formData.get('new_password') || '');

  if (new_password.length < 8) return;

  await supabase.auth.updateUser({ password: new_password });
  await supabase.from('audit_logs').insert({ action: 'Password changed', details: '' });
  revalidatePath('/settings');
}
