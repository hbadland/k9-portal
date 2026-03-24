import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '—';
  return timeStr.slice(0, 5);
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="py-3 border-b border-dark3 last:border-0">
      <p className="text-muted text-xs uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-cream text-sm">{value}</p>
    </div>
  );
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
    <span className={`inline-block text-sm px-3 py-1 rounded-full border ${cls}`}>
      {status}
    </span>
  );
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('bookings')
      .select('*, services(name), dogs(name)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError('Booking not found.');
        else setBooking(data);
      });
  }, [id]);

  const serviceName = booking?.services?.name ?? 'Walk';
  const dogName     = booking?.dogs?.name ?? '—';

  return (
    <div className="max-w-lg space-y-6">
      <button
        onClick={() => navigate('/bookings')}
        className="text-muted text-sm hover:text-cream transition"
      >
        ← Back to Bookings
      </button>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {!booking && !error && <p className="text-muted text-sm">Loading…</p>}

      {booking && (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-cream">{serviceName}</h1>
              <p className="text-muted text-sm mt-1">for {dogName}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="bg-dark2 border border-dark3 rounded-2xl px-5 divide-y divide-dark3">
            <Field label="Date" value={formatDate(booking.date)} />
            <Field
              label="Time"
              value={booking.time ? formatTime(booking.time) : null}
            />
            <Field label="Dog" value={dogName} />
            <Field label="Service" value={serviceName} />
            <Field label="Notes" value={booking.notes} />
            <Field
              label="Booked on"
              value={
                booking.created_at
                  ? new Date(booking.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })
                  : null
              }
            />
          </div>

          <button
            onClick={() => navigate(`/messages`)}
            className="text-gold text-sm hover:opacity-80 transition"
          >
            View messages for this booking →
          </button>
        </>
      )}
    </div>
  );
}
