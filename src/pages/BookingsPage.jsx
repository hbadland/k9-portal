import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
function formatTime(t) { return t ? t.slice(0, 5) : ''; }

function StatusBadge({ status }) {
  const c = {
    confirmed:   'bg-green-100 text-green-700 border-green-200',
    pending:     'bg-amber-100 text-amber-700 border-amber-200',
    cancelled:   'bg-red-100 text-red-600 border-red-200',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
    completed:   'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${c[status] ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>
      {status}
    </span>
  );
}

function BookingRow({ booking, onClick }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-cream border border-forest/10 rounded-xl cursor-pointer hover:border-forest/30 transition"
      onClick={onClick}>
      <div className="flex-1 min-w-0">
        <p className="text-charcoal text-sm font-medium truncate">{booking.services?.name ?? 'Session'}</p>
        <p className="text-muted text-xs mt-0.5">{formatDate(booking.date)} · {formatTime(booking.time)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-charcoal text-xs mb-1">{booking.dogs?.name ?? '—'}</p>
        <StatusBadge status={booking.status} />
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState(null);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('bookings').select('*, services(name), dogs(name)').order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError('Failed to load bookings.');
        else setBookings(data ?? []);
      });
  }, []);

  const today    = new Date().toISOString().slice(0, 10);
  const upcoming = bookings?.filter((b) => b.date >= today && b.status !== 'cancelled') ?? [];
  const past     = bookings?.filter((b) => b.date <  today || b.status === 'cancelled') ?? [];

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="font-serif text-3xl text-forest font-bold">Bookings</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {bookings === null && !error && <p className="text-muted text-sm">Loading…</p>}
      {bookings !== null && (
        <>
          <section>
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Upcoming</h2>
            {upcoming.length === 0
              ? <p className="text-muted text-sm">No upcoming bookings.</p>
              : <div className="space-y-2">{upcoming.map((b) => <BookingRow key={b.id} booking={b} onClick={() => navigate(`/bookings/${b.id}`)} />)}</div>
            }
          </section>
          <section>
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Past</h2>
            {past.length === 0
              ? <p className="text-muted text-sm">No past bookings.</p>
              : <div className="space-y-2">{past.map((b) => <BookingRow key={b.id} booking={b} onClick={() => navigate(`/bookings/${b.id}`)} />)}</div>
            }
          </section>
        </>
      )}
    </div>
  );
}
