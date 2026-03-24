import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.slice(0, 5);
}

function StatusBadge({ status }) {
  const colours = {
    confirmed:   'bg-green-900/40 text-green-400 border-green-700/40',
    pending:     'bg-amber-900/40 text-amber-400 border-amber-700/40',
    cancelled:   'bg-red-900/40 text-red-400 border-red-700/40',
    in_progress: 'bg-blue-900/40 text-blue-400 border-blue-700/40',
    completed:   'bg-slate-700/60 text-slate-300 border-slate-600/40',
  };
  const cls = colours[status] ?? 'bg-slate-800 text-slate-400 border-slate-700';
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${cls}`}>
      {status}
    </span>
  );
}

function BookingRow({ booking, onClick }) {
  const serviceName = booking.services?.name ?? 'Walk';
  const dogName     = booking.dogs?.name ?? '—';
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 bg-dark2 border border-dark3 rounded-xl cursor-pointer hover:border-gold transition"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <p className="text-cream text-sm font-medium truncate">{serviceName}</p>
        <p className="text-muted text-xs mt-0.5">
          {formatDate(booking.date)} · {formatTime(booking.time)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-cream text-xs mb-1">{dogName}</p>
        <StatusBadge status={booking.status} />
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from('bookings')
      .select('*, services(name), dogs(name)')
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError('Failed to load bookings.');
        else setBookings(data ?? []);
      });
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings?.filter((b) => b.date >= today && b.status !== 'cancelled') ?? [];
  const past     = bookings?.filter((b) => b.date <  today || b.status === 'cancelled') ?? [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-cream">Bookings</h1>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {bookings === null && !error && <p className="text-muted text-sm">Loading…</p>}

      {bookings !== null && (
        <>
          <section>
            <h2 className="text-base font-semibold text-cream mb-3">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-muted text-sm">No upcoming bookings.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((b) => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    onClick={() => navigate(`/bookings/${b.id}`)}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-base font-semibold text-cream mb-3">Past</h2>
            {past.length === 0 ? (
              <p className="text-muted text-sm">No past bookings.</p>
            ) : (
              <div className="space-y-2">
                {past.map((b) => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    onClick={() => navigate(`/bookings/${b.id}`)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
