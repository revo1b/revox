'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createOpportunity(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get('title') || '').trim();
  const company_id = String(formData.get('company_id') || '') || null;
  const contact_id = String(formData.get('contact_id') || '') || null;
  const value = parseFloat(String(formData.get('value') || '0')) || 0;
  const stage = String(formData.get('stage') || 'new');
  const expected_close = String(formData.get('expected_close') || '') || null;

  if (!title) return;

  const { data, error } = await supabase
    .from('opportunities')
    .insert({
      title, company_id, contact_id, value, stage, expected_close,
      last_activity_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !data) return;

  await supabase.from('activities').insert({
    contact_id, company_id, opportunity_id: data.id,
    type: 'opportunity_update',
    description: `New opportunity created — ${title}`,
  });
  await supabase.from('audit_logs').insert({ action: 'Created opportunity', details: title });

  revalidatePath('/opportunities');
  revalidatePath('/leads');
  redirect(`/opportunities/${data.id}`);
}
