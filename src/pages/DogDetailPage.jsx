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
    <div className="py-3 border-b border-dark3 last:border-0">
      <p className="text-muted text-xs uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-cream text-sm whitespace-pre-line">{value}</p>
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
        className="text-muted text-sm hover:text-cream transition"
      >
        ← Back to My Dogs
      </button>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {!dog && !error && <p className="text-muted text-sm">Loading…</p>}

      {dog && (
        <>
          <div className="flex items-center gap-4">
            {dog.avatar_url ? (
              <img
                src={dog.avatar_url}
                alt={dog.name}
                className="w-20 h-20 rounded-full object-cover border border-dark3"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-dark3 flex items-center justify-center text-4xl">
                🐾
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-cream">{dog.name}</h1>
              {dog.breed && <p className="text-muted text-sm">{dog.breed}</p>}
            </div>
          </div>

          <div className="bg-dark2 border border-dark3 rounded-2xl px-5 divide-y divide-dark3">
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
