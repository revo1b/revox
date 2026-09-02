import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Upload, LogOut } from 'lucide-react';
import { updateUserProfile, updateBusinessProfile, addKnowledgeSource, changePassword } from '@/lib/actions/settings';
import { logout } from '@/lib/actions/auth';

export const dynamic = 'force-dynamic';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab || 'profile';
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('business_profile').select('*').order('updated_at', { ascending: false }).limit(1).single();
  const { data: knowledge } = await supabase.from('knowledge_sources').select('*').order('created_at', { ascending: false });

  const hasAiKey = !!process.env.ANTHROPIC_API_KEY;

  return (
    <div className="page">
      <div className="page-title">Settings</div>
      <div className="page-subtitle mb-5">Manage your account, business, and Revox preferences.</div>

      <div className="tab-row">
        <Link className={`tab-item ${tab === 'profile' ? 'active' : ''}`} href="?tab=profile">Profile</Link>
        <Link className={`tab-item ${tab === 'business' ? 'active' : ''}`} href="?tab=business">Business</Link>
        <Link className={`tab-item ${tab === 'ai' ? 'active' : ''}`} href="?tab=ai">AI</Link>
        <Link className={`tab-item ${tab === 'knowledge' ? 'active' : ''}`} href="?tab=knowledge">Knowledge</Link>
        <Link className={`tab-item ${tab === 'security' ? 'active' : ''}`} href="?tab=security">Security</Link>
      </div>

      {tab === 'profile' && (
        <div className="card max-w-[520px]">
          <form action={updateUserProfile} className="space-y-3.5">
            <div className="form-field"><label>Full Name</label><input type="text" name="full_name" defaultValue={(user?.user_metadata?.full_name as string) || ''} /></div>
            <div className="form-field"><label>Email</label><input type="email" defaultValue={user?.email || ''} disabled /></div>
            <button className="btn btn-primary" type="submit">Save Changes</button>
          </form>
        </div>
      )}

      {tab === 'business' && (
        <div className="card max-w-[600px]">
          <form action={updateBusinessProfile} className="space-y-3.5">
            <div className="form-field"><label>Business Name</label><input type="text" name="business_name" defaultValue={profile?.business_name || ''} /></div>
            <div className="form-field"><label>Industry</label><input type="text" name="industry" defaultValue={profile?.industry || ''} /></div>
            <div className="form-field"><label>Description</label><textarea name="description" rows={3} defaultValue={profile?.description || ''} /></div>
            <div className="form-field"><label>Products &amp; Services</label><textarea name="services" rows={3} defaultValue={profile?.services || ''} /></div>
            <button className="btn btn-primary" type="submit">Save Business Info</button>
          </form>
        </div>
      )}

      {tab === 'ai' && (
        <div className="card max-w-[600px]">
          <p className="text-[13.5px] text-ink-soft">
            The AI Brain works out of the box using a local business-summary engine. To enable
            live, natural-language AI responses, add your Anthropic API key as the
            <code> ANTHROPIC_API_KEY</code> environment variable in your Vercel project settings.
          </p>
          <div className="form-field mt-3.5">
            <label>AI Provider</label>
            <select disabled>
              <option>{hasAiKey ? 'Anthropic (Claude) — connected' : 'Local Business Engine (no key configured)'}</option>
            </select>
          </div>
        </div>
      )}

      {tab === 'knowledge' && (
        <div className="card">
          <div className="section-label">Business Knowledge</div>
          {knowledge?.map((k) => (
            <div className="timeline-item" key={k.id}>
              <div className="timeline-text"><b>{k.title}</b> <span className="text-ink-faint text-xs">({k.type})</span></div>
            </div>
          ))}
          <form action={addKnowledgeSource} className="mt-4 pt-4 border-t border-border space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="form-field"><label>Title</label><input type="text" name="title" required /></div>
              <div className="form-field">
                <label>Type</label>
                <select name="type" defaultValue="document">
                  <option value="document">Document</option>
                  <option value="product">Product</option>
                  <option value="pricing">Pricing</option>
                  <option value="sales">Sales Knowledge</option>
                  <option value="policy">Policy</option>
                </select>
              </div>
              <div className="form-field md:col-span-2"><label>Content / Notes</label><textarea name="content" rows={3} /></div>
              <div className="form-field md:col-span-2"><label>Upload file (PDF, DOCX, XLSX, PPTX, image)</label><input type="file" name="file" /></div>
            </div>
            <button className="btn btn-primary" type="submit"><Upload size={14} strokeWidth={1.7} /> Add to Knowledge Base</button>
          </form>
          <p className="text-xs text-ink-faint mt-3">
            File uploads are stored in a Supabase Storage bucket named <code>knowledge</code> —
            create it once in your Supabase dashboard (Storage → New bucket) before uploading.
          </p>
        </div>
      )}

      {tab === 'security' && (
        <div className="card max-w-[480px]">
          <form action={changePassword} className="space-y-3.5">
            <div className="form-field"><label>New Password</label><input type="password" name="new_password" required minLength={8} /></div>
            <button className="btn btn-primary" type="submit">Update Password</button>
          </form>
          <form action={logout} className="mt-5">
            <button className="btn btn-danger" type="submit"><LogOut size={14} strokeWidth={1.7} /> Sign Out</button>
          </form>
        </div>
      )}
    </div>
  );
}
