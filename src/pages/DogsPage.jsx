import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function ageLabel(months) {
  if (months == null) return null;
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y} yr ${m} mo` : `${y} year${y !== 1 ? 's' : ''}`;
}

export default function DogsPage() {
  const [dogs, setDogs] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from('dogs')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError('Failed to load dogs.');
        else setDogs(data ?? []);
      });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-cream">My Dogs</h1>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {dogs === null && !error && (
        <p className="text-muted text-sm">Loading…</p>
      )}

      {dogs !== null && dogs.length === 0 && (
        <div className="bg-dark2 border border-dark3 rounded-2xl p-6 text-muted text-sm">
          No dogs on your profile yet. Contact us to add your dog.
        </div>
      )}

      {dogs !== null && dogs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dogs.map((dog) => (
            <div
              key={dog.id}
              className="bg-dark2 border border-dark3 rounded-2xl p-5 cursor-pointer hover:border-gold transition"
              onClick={() => navigate(`/dogs/${dog.id}`)}
            >
              {dog.avatar_url && (
                <img
                  src={dog.avatar_url}
                  alt={dog.name}
                  className="w-14 h-14 rounded-full object-cover mb-3 border border-dark3"
                />
              )}
              {!dog.avatar_url && (
                <div className="w-14 h-14 rounded-full bg-dark3 flex items-center justify-center mb-3 text-2xl">
                  🐾
                </div>
              )}
              <p className="text-cream font-semibold text-lg">{dog.name}</p>
              {dog.breed && <p className="text-muted text-sm">{dog.breed}</p>}
              {dog.age_months != null && (
                <p className="text-muted text-xs mt-1">{ageLabel(dog.age_months)}</p>
              )}
              {dog.notes && (
                <p className="text-muted text-xs mt-2 line-clamp-2">{dog.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
