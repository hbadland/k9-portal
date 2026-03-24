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
    <div className="py-3 border-b border-forest/10 last:border-0">
      <p className="text-muted text-xs uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-charcoal text-sm">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const colours = {
    confirmed:   'bg-green-100 text-green-800 border-green-200',
    pending:     'bg-amber-100 text-amber-800 border-amber-200',
    cancelled:   'bg-red-100 text-red-700 border-red-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed:   'bg-forest/10 text-forest border-forest/20',
  };
  const cls = colours[status] ?? 'bg-cream text-muted border-forest/10';
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
        className="text-muted text-sm hover:text-forest transition"
      >
        ← Back to Bookings
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!booking && !error && <p className="text-muted text-sm">Loading…</p>}

      {booking && (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl font-bold text-forest">{serviceName}</h1>
              <p className="text-muted text-sm mt-1">for {dogName}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="bg-cream border border-forest/10 rounded-2xl px-5 divide-y divide-forest/10">
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
            className="text-forest text-sm hover:opacity-70 transition"
          >
            View messages for this booking →
          </button>
        </>
      )}
    </div>
  );
}
