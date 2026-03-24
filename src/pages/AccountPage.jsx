import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

function Field({ label, value }) {
  return (
    <div className="py-3.5 border-b border-forest/8 last:border-0">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-charcoal text-sm">{value ?? <span className="text-muted italic">Not provided</span>}</p>
    </div>
  );
}

export default function AccountPage() {
  const [profile, setProfile] = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) { setError('Failed to load account details.'); return; }
      const meta = user.user_metadata ?? {};
      setProfile({
        full_name:  meta.full_name || meta.name || null,
        email:      user.email,
        phone:      meta.phone || null,
        created_at: user.created_at,
      });
    });
  }, []);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-forest font-bold">Account</h1>
        <p className="text-muted text-sm mt-1">Your profile details</p>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!profile && !error && <p className="text-muted text-sm">Loading…</p>}
      {profile && (
        <div className="bg-cream border border-forest/10 rounded-2xl px-5 divide-y divide-forest/8">
          <Field label="Name" value={profile.full_name} />
          <Field label="Email" value={profile.email} />
          <Field label="Phone" value={profile.phone} />
          <Field label="Member since" value={profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { dateStyle: 'long' }) : null} />
        </div>
      )}
      <p className="text-muted text-xs">To update your details, please contact the Battersea K9 team.</p>
    </div>
  );
}
