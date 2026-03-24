import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function formatDate(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
function formatTime(t) { return t ? t.slice(0, 5) : ''; }
function ageLabel(m) {
  if (m < 12) return `${m}mo`;
  const y = Math.floor(m / 12), r = m % 12;
  return r > 0 ? `${y}yr ${r}mo` : `${y}yr`;
}

function StatusBadge({ status }) {
  const c = {
    confirmed:   'bg-green-100 text-green-700 border-green-200',
    pending:     'bg-amber-100 text-amber-700 border-amber-200',
    cancelled:   'bg-red-100 text-red-600 border-red-200',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
    completed:   'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${c[status] ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [nextBooking, setNextBooking] = useState(undefined);
  const [dogs, setDogs]               = useState(undefined);
  const [messages, setMessages]       = useState(undefined);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase.from('bookings').select('*, services(name), dogs(name)')
      .gte('date', today).order('date').limit(1).maybeSingle()
      .then(({ data, error }) => setNextBooking(error ? null : (data ?? null)));
    supabase.from('dogs').select('*')
      .then(({ data, error }) => setDogs(error ? [] : (data ?? [])));
  }, []);

  useEffect(() => {
    if (nextBooking === undefined) return;
    if (!nextBooking) { setMessages([]); return; }
    supabase.from('messages').select('*').eq('booking_id', nextBooking.id)
      .order('created_at', { ascending: false }).limit(3)
      .then(({ data, error }) => setMessages(error ? [] : (data ?? [])));
  }, [nextBooking]);

  const nb = nextBooking ? {
    ...nextBooking,
    service_name: nextBooking.services?.name ?? 'Session',
    dog_name:     nextBooking.dogs?.name ?? '—',
  } : nextBooking;

  const card = 'bg-cream border border-forest/10 rounded-2xl';

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl text-forest font-bold">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Welcome back</p>
      </div>

      {/* Next booking */}
      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Next Booking</h2>
        {nb === undefined ? (
          <div className={`${card} p-5 text-muted text-sm`}>Loading…</div>
        ) : nb ? (
          <div className={`${card} p-5 cursor-pointer hover:border-forest/30 transition`}
            onClick={() => navigate(`/bookings/${nb.id}`)}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-charcoal font-semibold">{nb.service_name}</p>
                <p className="text-muted text-sm mt-0.5">{formatDate(nb.date)} at {formatTime(nb.time)}</p>
              </div>
              <div className="text-right">
                <p className="text-charcoal text-sm">{nb.dog_name}</p>
                <StatusBadge status={nb.status} />
              </div>
            </div>
          </div>
        ) : (
          <div className={`${card} p-5 text-muted text-sm`}>
            No upcoming bookings — contact us to schedule a session.
          </div>
        )}
      </section>

      {/* Dogs */}
      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">My Dogs</h2>
        {dogs === undefined ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : dogs.length === 0 ? (
          <div className={`${card} p-5 text-muted text-sm`}>No dogs added yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dogs.map((dog) => (
              <div key={dog.id} className={`${card} p-4 cursor-pointer hover:border-forest/30 transition`}
                onClick={() => navigate(`/dogs/${dog.id}`)}>
                <p className="text-charcoal font-semibold">{dog.name}</p>
                <p className="text-muted text-sm">{dog.breed ?? 'Unknown breed'}</p>
                {dog.age_months != null && <p className="text-muted text-xs mt-1">{ageLabel(dog.age_months)}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Messages */}
      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Recent Messages</h2>
        {messages === undefined ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : messages.length === 0 ? (
          <div className={`${card} p-5 text-muted text-sm`}>No messages yet.</div>
        ) : (
          <div className="space-y-2">
            {messages.slice(0, 2).map((msg) => (
              <div key={msg.id}
                className={`rounded-2xl px-4 py-3 max-w-lg border ${
                  msg.sender_role === 'owner'
                    ? 'bg-forest/5 border-forest/15 ml-auto text-right'
                    : 'bg-cream border-forest/10'
                }`}>
                <p className="text-charcoal text-sm">{msg.content}</p>
                <p className="text-muted text-xs mt-1">
                  {msg.sender_role === 'owner' ? 'You' : 'K9 Team'} · {new Date(msg.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              </div>
            ))}
            {nb && (
              <button onClick={() => navigate('/messages')} className="text-green text-sm hover:text-forest transition mt-1">
                View all messages →
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
