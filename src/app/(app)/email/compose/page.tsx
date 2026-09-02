import { createClient } from '@/lib/supabase/server';
import { Send } from 'lucide-react';
import { replyOrComposeEmail } from '@/lib/actions/email';

export const dynamic = 'force-dynamic';

export default async function ComposePage() {
  const supabase = await createClient();
  const { data: contacts } = await supabase.from('contacts').select('id, name, email').order('name');

  return (
    <div className="page">
      <div className="page-title">Compose Email</div>
      <div className="page-subtitle mb-5">Revox never sends automatically — you always review before it goes out.</div>

      <div className="card max-w-[640px]">
        <form action={replyOrComposeEmail} className="space-y-3.5">
          <div className="form-field">
            <label>To (contact)</label>
            <select name="contact_id">
              {contacts?.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
            </select>
          </div>
          <div className="form-field"><label>Subject</label><input type="text" name="subject" required /></div>
          <div className="form-field"><label>Message</label><textarea name="body" rows={6} required /></div>
          <div className="pt-2">
            <button type="submit" name="action" value="send" className="btn btn-primary">
              <Send size={14} strokeWidth={1.7} /> Review &amp; Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
