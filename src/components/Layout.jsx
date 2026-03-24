import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const NAV = [
  { to: '/',         label: 'Dashboard', end: true },
  { to: '/dogs',     label: 'My Dogs'              },
  { to: '/bookings', label: 'Bookings'              },
  { to: '/messages', label: 'Messages'              },
  { to: '/account',  label: 'Account'               },
];

export default function Layout() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const meta = user.user_metadata ?? {};
      setDisplayName(meta.full_name || meta.name || user.email || '');
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-white/15 text-cream font-semibold'
        : 'text-cream/60 hover:text-cream hover:bg-white/8'
    }`;

  return (
    <div className="min-h-screen flex">

      {/* Desktop sidebar */}
      <nav className="hidden md:flex w-60 bg-forest flex-col p-6 shrink-0 fixed h-full z-20">
        <div className="mb-8">
          <p className="font-serif text-2xl text-cream font-bold leading-tight">
            Battersea <em className="not-italic text-sage">K9</em>
          </p>
          <p className="text-cream/50 text-xs mt-1.5 font-light truncate">{displayName}</p>
        </div>

        <div className="space-y-0.5 flex-1">
          {NAV.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </div>

        <button
          onClick={logout}
          className="text-cream/40 text-xs hover:text-cream/70 transition text-left mt-4 pb-1"
        >
          Sign out
        </button>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-60 min-h-screen bg-offwhite">

        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-5 py-4 bg-forest border-b border-white/10">
          <p className="font-serif text-xl text-cream font-bold">
            Battersea <em className="not-italic text-sage">K9</em>
          </p>
          <button onClick={logout} className="text-cream/50 text-xs hover:text-cream transition">
            Sign out
          </button>
        </header>

        {/* Page */}
        <main className="flex-1 p-6 md:p-10 overflow-auto pb-24 md:pb-10">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-forest border-t border-white/10 flex z-20">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-3 text-xs font-medium transition ${
                  isActive ? 'text-sage' : 'text-cream/50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
