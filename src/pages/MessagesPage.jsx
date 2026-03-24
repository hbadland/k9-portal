import { useEffect, useState } from 'react';
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

function Thread({ booking }) {
  const [messages, setMessages] = useState(null);
  const [open, setOpen] = useState(false);

  const load = () => {
    if (messages !== null) { setOpen((v) => !v); return; }
    supabase
      .from('messages')
      .select('*')
      .eq('booking_id', booking.id)
      .order('created_at')
      .then(({ data, error }) => {
        setMessages(error ? [] : (data ?? []));
        setOpen(true);
      });
  };

  const serviceName = booking.services?.name ?? 'Walk';
  const dogName     = booking.dogs?.name ?? '—';

  return (
    <div className="bg-dark2 border border-dark3 rounded-2xl overflow-hidden">
      <button
        onClick={load}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-dark3/30 transition text-left"
      >
        <div>
          <p className="text-cream text-sm font-medium">
            {serviceName} — {dogName}
          </p>
          <p className="text-muted text-xs mt-0.5">
            {formatDate(booking.date)} · {formatTime(booking.time)}
          </p>
        </div>
        <span className="text-muted text-xs ml-4">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-dark3">
          {messages === null && (
            <p className="text-muted text-sm pt-4">Loading…</p>
          )}
          {messages !== null && messages.length === 0 && (
            <p className="text-muted text-sm pt-4">No messages for this booking.</p>
          )}
          {messages !== null && messages.length > 0 && (
            <div className="pt-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl px-4 py-3 max-w-sm ${
                    msg.sender_role === 'owner'
                      ? 'bg-gold/10 border border-gold/30 ml-auto text-right'
                      : 'bg-dark3 border border-dark3'
                  }`}
                >
                  <p className="text-cream text-sm">{msg.content}</p>
                  <p className="text-muted text-xs mt-1">
                    {msg.sender_role === 'owner' ? 'You' : 'K9 Team'} ·{' '}
                    {new Date(msg.created_at).toLocaleString('en-GB', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('bookings')
      .select('*, messages(*), dogs(name), services(name)')
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) { setError('Failed to load bookings.'); return; }
        // Show bookings that have messages, plus all non-cancelled as thread containers
        const relevant = (data ?? []).filter((b) => b.status !== 'cancelled');
        setBookings(relevant);
      });
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-cream">Messages</h1>
        <p className="text-muted text-sm mt-1">
          Messages are organised by booking. Click a booking to view its thread.
        </p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {bookings === null && !error && <p className="text-muted text-sm">Loading…</p>}

      {bookings !== null && bookings.length === 0 && (
        <div className="bg-dark2 border border-dark3 rounded-2xl p-6 text-muted text-sm">
          No bookings found. Messages are attached to bookings.
        </div>
      )}

      {bookings !== null && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Thread key={b.id} booking={b} />
          ))}
        </div>
      )}
    </div>
  );
}
