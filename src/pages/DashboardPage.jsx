import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.slice(0, 5);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [nextBooking, setNextBooking] = useState(undefined); // undefined = loading
  const [dogs, setDogs] = useState(undefined);
  const [messages, setMessages] = useState(undefined);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    supabase
      .from('bookings')
      .select('*, services(name), dogs(name)')
      .gte('date', today)
      .order('date')
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) { setNextBooking(null); return; }
        setNextBooking(data ?? null);
      });

    supabase
      .from('dogs')
      .select('*')
      .then(({ data, error }) => {
        setDogs(error ? [] : (data ?? []));
      });
  }, []);

  // Fetch messages once we know the next booking id
  useEffect(() => {
    if (nextBooking === undefined) return;
    if (!nextBooking) { setMessages([]); return; }
    setLoadingMsgs(true);
    supabase
      .from('messages')
      .select('*')
      .eq('booking_id', nextBooking.id)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        setMessages(error ? [] : (data ?? []));
        setLoadingMsgs(false);
      });
  }, [nextBooking]);

  // Normalise field names from Supabase joins
  const nb = nextBooking ? {
    ...nextBooking,
    service_name: nextBooking.services?.name ?? nextBooking.service_name ?? 'Walk',
    dog_name:     nextBooking.dogs?.name    ?? nextBooking.dog_name,
    slot_date:    nextBooking.date,
    slot_start:   nextBooking.time,
    slot_end:     null,
  } : nextBooking;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-cream">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Welcome back</p>
      </div>

      {/* Next booking */}
      <section>
        <h2 className="text-lg font-semibold text-cream mb-3">Next Booking</h2>
        {nb === undefined ? (
          <div className="bg-dark2 border border-dark3 rounded-2xl p-5 text-muted text-sm">Loading…</div>
        ) : nb ? (
          <div
            className="bg-dark2 border border-dark3 rounded-2xl p-5 cursor-pointer hover:border-gold transition"
            onClick={() => navigate(`/bookings/${nb.id}`)}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-cream font-semibold">{nb.service_name}</p>
                <p className="text-muted text-sm mt-0.5">
                  {formatDate(nb.slot_date)} at {formatTime(nb.slot_start)}
                  {nb.slot_end && ` – ${formatTime(nb.slot_end)}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-cream text-sm">{nb.dog_name}</p>
                <StatusBadge status={nb.status} />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-dark2 border border-dark3 rounded-2xl p-5 text-muted text-sm">
            No upcoming bookings. Contact us to schedule a walk.
          </div>
        )}
      </section>

      {/* Dogs */}
      <section>
        <h2 className="text-lg font-semibold text-cream mb-3">My Dogs</h2>
        {dogs === undefined ? (
          <div className="text-muted text-sm">Loading…</div>
        ) : dogs.length === 0 ? (
          <div className="bg-dark2 border border-dark3 rounded-2xl p-5 text-muted text-sm">
            No dogs added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dogs.map((dog) => (
              <div
                key={dog.id}
                className="bg-dark2 border border-dark3 rounded-2xl p-4 cursor-pointer hover:border-gold transition"
                onClick={() => navigate(`/dogs/${dog.id}`)}
              >
                <p className="text-cream font-semibold">{dog.name}</p>
                <p className="text-muted text-sm">{dog.breed ?? 'Unknown breed'}</p>
                {dog.age_months != null && (
                  <p className="text-muted text-xs mt-1">{ageLabel(dog.age_months)}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent messages */}
      <section>
        <h2 className="text-lg font-semibold text-cream mb-3">Recent Messages</h2>
        {loadingMsgs || messages === undefined ? (
          <div className="text-muted text-sm">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="bg-dark2 border border-dark3 rounded-2xl p-5 text-muted text-sm">
            No messages yet.
          </div>
        ) : (
          <div className="space-y-2">
            {messages.slice(0, 2).map((msg) => (
              <div
                key={msg.id}
                className={`rounded-2xl px-4 py-3 max-w-lg ${
                  msg.sender_role === 'owner'
                    ? 'bg-gold/10 border border-gold/30 ml-auto text-right'
                    : 'bg-dark2 border border-dark3'
                }`}
              >
                <p className="text-cream text-sm">{msg.content}</p>
                <p className="text-muted text-xs mt-1">
                  {msg.sender_role === 'owner' ? 'You' : 'K9 Team'} ·{' '}
                  {new Date(msg.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              </div>
            ))}
            {nb && (
              <button
                onClick={() => navigate('/messages')}
                className="text-gold text-sm hover:opacity-80 transition mt-1"
              >
                View all messages →
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }) {
  const colours = {
    confirmed: 'bg-green-900/40 text-green-400 border-green-700/40',
    pending: 'bg-amber-900/40 text-amber-400 border-amber-700/40',
    cancelled: 'bg-red-900/40 text-red-400 border-red-700/40',
    in_progress: 'bg-blue-900/40 text-blue-400 border-blue-700/40',
  };
  const cls = colours[status] ?? 'bg-slate-800 text-slate-400 border-slate-700';
  return (
    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${cls}`}>
      {status}
    </span>
  );
}

function ageLabel(months) {
  if (months < 12) return `${months}mo`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y}yr ${m}mo` : `${y}yr`;
}
