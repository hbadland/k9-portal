import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function ageLabel(months) {
  if (months == null) return '—';
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y} yr ${m} mo` : `${y} year${y !== 1 ? 's' : ''}`;
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="py-3 border-b border-forest/10 last:border-0">
      <p className="text-muted text-xs uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-charcoal text-sm whitespace-pre-line">{value}</p>
    </div>
  );
}

export default function DogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dog, setDog] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('dogs')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError('Dog not found.');
        else setDog(data);
      });
  }, [id]);

  return (
    <div className="max-w-lg space-y-6">
      <button
        onClick={() => navigate('/dogs')}
        className="text-muted text-sm hover:text-forest transition"
      >
        ← Back to My Dogs
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!dog && !error && <p className="text-muted text-sm">Loading…</p>}

      {dog && (
        <>
          <div className="flex items-center gap-4">
            {dog.avatar_url ? (
              <img
                src={dog.avatar_url}
                alt={dog.name}
                className="w-20 h-20 rounded-full object-cover border border-forest/20"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-forest flex items-center justify-center">
                <span className="text-cream text-3xl font-serif font-bold">{dog.name?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <div>
              <h1 className="font-serif text-2xl font-bold text-forest">{dog.name}</h1>
              {dog.breed && <p className="text-muted text-sm">{dog.breed}</p>}
            </div>
          </div>

          <div className="bg-cream border border-forest/10 rounded-2xl px-5 divide-y divide-forest/10">
            <Field label="Age" value={ageLabel(dog.age_months)} />
            <Field label="Notes" value={dog.notes} />
            <Field label="Vet name" value={dog.vet_name} />
            <Field label="Vet phone" value={dog.vet_phone} />
            <Field label="Medical notes" value={dog.medical_notes} />
            <Field label="Behavioural notes" value={dog.behavioural_notes} />
            {dog.collar_id && <Field label="Collar ID" value={dog.collar_id} />}
          </div>
        </>
      )}
    </div>
  );
}
