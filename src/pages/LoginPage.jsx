import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl text-cream font-bold">
            Battersea <em className="not-italic text-sage">K9</em>
          </h1>
          <p className="text-cream/50 text-sm mt-2 font-light tracking-wide">Client Portal</p>
        </div>
        <div className="bg-cream rounded-2xl p-8 shadow-xl shadow-black/20">
          <h2 className="text-forest font-semibold text-lg mb-6">Sign in to your account</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Email</label>
              <input
                className="w-full bg-offwhite border border-forest/15 rounded-xl px-4 py-3 text-charcoal placeholder-muted/50 focus:outline-none focus:border-forest transition text-sm"
                type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Password</label>
              <input
                className="w-full bg-offwhite border border-forest/15 rounded-xl px-4 py-3 text-charcoal placeholder-muted/50 focus:outline-none focus:border-forest transition text-sm"
                type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            <button type="submit" disabled={busy}
              className="w-full bg-forest text-cream font-semibold rounded-xl py-3 hover:bg-green transition disabled:opacity-50 mt-2">
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="text-center text-cream/30 text-xs mt-8">© {new Date().getFullYear()} Battersea K9</p>
      </div>
    </div>
  );
}
