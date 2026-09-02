'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createOrUpdateContact(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id') || '');
  const name = String(formData.get('name') || '').trim();
  const company_id = String(formData.get('company_id') || '') || null;
  const position = String(formData.get('position') || '');
  const email = String(formData.get('email') || '');
  const phone = String(formData.get('phone') || '');
  const status = String(formData.get('status') || 'lead');
  const tags = String(formData.get('tags') || '');

  if (!name) return;

  if (id) {
    await supabase.from('contacts').update({ company_id, name, position, email, phone, status, tags }).eq('id', id);
    revalidatePath(`/contacts/${id}`);
    redirect(`/contacts/${id}`);
  } else {
    const { data, error } = await supabase
      .from('contacts')
      .insert({ company_id, name, position, email, phone, status, tags, last_activity_at: new Date().toISOString() })
      .select('id')
      .single();

    if (error || !data) return;

    await supabase.from('activities').insert({
      contact_id: data.id,
      company_id,
      type: 'lead_created',
      description: `New lead created — ${name}`,
    });
    await supabase.from('audit_logs').insert({ action: 'Created contact', details: name });

    revalidatePath('/contacts');
    redirect(`/contacts/${data.id}`);
  }
}
