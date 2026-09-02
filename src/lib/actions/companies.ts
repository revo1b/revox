'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get('name') || '').trim();
  const industry = String(formData.get('industry') || '');
  const website = String(formData.get('website') || '');
  const phone = String(formData.get('phone') || '');

  if (!name) return;

  const { data, error } = await supabase
    .from('companies')
    .insert({ name, industry, website, phone })
    .select('id')
    .single();

  if (error || !data) return;

  await supabase.from('audit_logs').insert({ action: 'Created company', details: name });
  revalidatePath('/companies');
  redirect(`/companies/${data.id}`);
}
