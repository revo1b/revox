'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Revox never sends an email automatically (see product spec section 33 —
 * AI Safety, and section 56 — Audit Log). This action always requires an
 * explicit "send" or "draft" choice from the person reviewing the message.
 */
export async function replyOrComposeEmail(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let thread_id = String(formData.get('thread_id') || '') || null;
  const body = String(formData.get('body') || '').trim();
  const action = String(formData.get('action') || 'draft'); // draft | send

  if (!body) return;

  const senderName = (user?.user_metadata?.full_name as string) || 'Me';
  const senderEmail = user?.email || '';

  if (!thread_id) {
    const contact_id = String(formData.get('contact_id') || '') || null;
    const subject = String(formData.get('subject') || '(no subject)');

    let company_id: string | null = null;
    if (contact_id) {
      const { data: contact } = await supabase.from('contacts').select('company_id').eq('id', contact_id).single();
      company_id = contact?.company_id ?? null;
    }

    const { data: thread } = await supabase
      .from('email_threads')
      .insert({
        subject, contact_id, company_id,
        folder: action === 'send' ? 'sent' : 'inbox',
        is_unread: false,
        last_message_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    thread_id = thread?.id ?? null;
  }

  if (!thread_id) return;

  await supabase.from('emails').insert({
    thread_id, direction: 'outbound', sender_name: senderName, sender_email: senderEmail,
    body, is_draft: action === 'draft',
  });

  if (action === 'send') {
    await supabase
      .from('email_threads')
      .update({ last_message_at: new Date().toISOString(), folder: 'sent' })
      .eq('id', thread_id);

    const { data: thread } = await supabase
      .from('email_threads')
      .select('subject, contact_id, company_id, opportunity_id')
      .eq('id', thread_id)
      .single();

    if (thread) {
      await supabase.from('activities').insert({
        contact_id: thread.contact_id,
        company_id: thread.company_id,
        opportunity_id: thread.opportunity_id,
        type: 'email',
        description: `Email sent — ${thread.subject}`,
      });
    }
    await supabase.from('audit_logs').insert({ action: 'Email sent', details: `thread ${thread_id}` });
  } else {
    await supabase.from('audit_logs').insert({ action: 'Email draft saved', details: `thread ${thread_id}` });
  }

  revalidatePath('/email');
  redirect(`/email/${thread_id}`);
}
