import { login } from '@/lib/actions/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-5">
      <div className="w-full max-w-[380px] bg-surface border border-border rounded-lg p-8 shadow">
        <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-navy to-teal flex items-center justify-center text-white font-bold mb-4.5">
          R
        </div>
        <h1 className="text-xl font-bold mb-0.5">Sign in to Revox</h1>
        <p className="page-subtitle mb-5.5">Your business operating system.</p>

        {params.error && (
          <div className="bg-red-soft text-red px-3.5 py-2.5 rounded-sm text-[13px] mb-4">
            {params.error}
          </div>
        )}

        <form action={login} className="space-y-3.5">
          <div className="form-field">
            <label>Email</label>
            <input type="email" name="email" required autoComplete="email" />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" name="password" required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary w-full justify-center py-2.5 mt-1.5">
            Sign In
          </button>
        </form>
        <p className="text-xs text-ink-faint mt-4.5">
          Create your account in the Supabase dashboard (Authentication → Users), or run the
          setup instructions in the README.
        </p>
      </div>
    </div>
  );
}
