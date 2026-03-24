import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const NAV = [
  { to: '/',         label: 'Dashboard', icon: '🏠', end: true },
  { to: '/dogs',     label: 'My Dogs',   icon: '🐾' },
  { to: '/bookings', label: 'Bookings',  icon: '📅' },
  { to: '/messages', label: 'Messages',  icon: '💬' },
  { to: '/account',  label: 'Account',   icon: '👤' },
];

export default function Layout() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('Owner');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const meta = user.user_metadata ?? {};
      const name = meta.full_name || meta.name || user.email || 'Owner';
      setDisplayName(name);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
      isActive ? 'bg-gold text-dark font-semibold' : 'text-muted hover:text-cream'
    }`;

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <nav className="hidden md:flex w-56 bg-dark2 border-r border-dark3 flex-col p-5 shrink-0 fixed h-full z-20">
        <div className="mb-8">
          <p className="text-cream font-bold text-lg">
            Battersea <span className="text-gold italic">K9</span>
          </p>
          <p className="text-muted text-xs mt-1 truncate">{displayName}</p>
        </div>
        <div className="space-y-1 flex-1">
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <span>{icon}</span>{label}
            </NavLink>
          ))}
        </div>
        <button
          onClick={logout}
          className="text-muted text-xs hover:text-cream transition text-left"
        >
          Sign out
        </button>
      </nav>

      {/* Main content — offset for sidebar on desktop */}
      <div className="flex-1 flex flex-col md:ml-56 min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-dark2 border-b border-dark3">
          <p className="text-cream font-bold">
            Battersea <span className="text-gold italic">K9</span>
          </p>
          <button onClick={logout} className="text-muted text-xs hover:text-cream transition">
            Sign out
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto pb-20 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark2 border-t border-dark3 flex z-20">
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs transition ${
                  isActive ? 'text-gold' : 'text-muted'
                }`
              }
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
