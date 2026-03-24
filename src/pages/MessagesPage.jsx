import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
function formatTime(t) { return t ? t.slice(0, 5) : ''; }

function Thread({ booking }) {
  const [messages, setMessages] = useState(null);
  const [open, setOpen]         = useState(false);

  const load = () => {
    if (messages !== null) { setOpen((v) => !v); return; }
    supabase.from('messages').select('*').eq('booking_id', booking.id).order('created_at')
      .then(({ data, error }) => { setMessages(error ? [] : (data ?? [])); setOpen(true); });
  };

  return (
    <div className="bg-cream border border-forest/10 rounded-2xl overflow-hidden">
      <button onClick={load}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-forest/5 transition text-left">
        <div>
          <p className="text-charcoal text-sm font-medium">
            {booking.services?.name ?? 'Session'} — {booking.dogs?.name ?? '—'}
          </p>
          <p className="text-muted text-xs mt-0.5">
            {formatDate(booking.date)} · {formatTime(booking.time)}
          </p>
        </div>
        <span className="text-muted text-xs ml-4">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-forest/8">
          {messages === null && <p className="text-muted text-sm pt-4">Loading…</p>}
          {messages !== null && messages.length === 0 && (
            <p className="text-muted text-sm pt-4">No messages for this booking.</p>
          )}
          {messages !== null && messages.length > 0 && (
            <div className="pt-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id}
                  className={`rounded-xl px-4 py-3 max-w-sm border ${
                    msg.sender_role === 'owner'
                      ? 'bg-forest/5 border-forest/15 ml-auto text-right'
                      : 'bg-offwhite border-forest/10'
                  }`}>
                  <p className="text-charcoal text-sm">{msg.content}</p>
                  <p className="text-muted text-xs mt-1">
                    {msg.sender_role === 'owner' ? 'You' : 'K9 Team'} · {new Date(msg.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
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
  const [error, setError]       = useState('');

  useEffect(() => {
    supabase.from('bookings').select('*, messages(*), dogs(name), services(name)')
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) { setError('Failed to load bookings.'); return; }
        setBookings((data ?? []).filter((b) => b.status !== 'cancelled'));
      });
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl text-forest font-bold">Messages</h1>
        <p className="text-muted text-sm mt-1">Messages are organised by booking. Click a booking to view its thread.</p>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {bookings === null && !error && <p className="text-muted text-sm">Loading…</p>}
      {bookings !== null && bookings.length === 0 && (
        <div className="bg-cream border border-forest/10 rounded-2xl p-6 text-muted text-sm">
          No bookings found. Messages are attached to bookings.
        </div>
      )}
      {bookings !== null && bookings.length > 0 && (
        <div className="space-y-3">{bookings.map((b) => <Thread key={b.id} booking={b} />)}</div>
      )}
    </div>
  );
}
