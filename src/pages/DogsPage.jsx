import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function ageLabel(m) {
  if (m == null) return null;
  if (m < 12) return `${m} month${m !== 1 ? 's' : ''}`;
  const y = Math.floor(m / 12), r = m % 12;
  return r > 0 ? `${y} yr ${r} mo` : `${y} year${y !== 1 ? 's' : ''}`;
}

export default function DogsPage() {
  const [dogs, setDogs] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('dogs').select('*')
      .then(({ data, error }) => {
        if (error) setError('Failed to load dogs.');
        else setDogs(data ?? []);
      });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-forest font-bold">My Dogs</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {dogs === null && !error && <p className="text-muted text-sm">Loading…</p>}
      {dogs !== null && dogs.length === 0 && (
        <div className="bg-cream border border-forest/10 rounded-2xl p-6 text-muted text-sm">
          No dogs on your profile yet. Contact us to add your dog.
        </div>
      )}
      {dogs !== null && dogs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dogs.map((dog) => (
            <div key={dog.id}
              className="bg-cream border border-forest/10 rounded-2xl p-5 cursor-pointer hover:border-forest/30 transition"
              onClick={() => navigate(`/dogs/${dog.id}`)}>
              <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center mb-3 text-forest font-serif font-bold text-lg">
                {dog.name.charAt(0)}
              </div>
              <p className="text-charcoal font-semibold text-lg">{dog.name}</p>
              {dog.breed && <p className="text-muted text-sm">{dog.breed}</p>}
              {dog.age_months != null && <p className="text-muted text-xs mt-1">{ageLabel(dog.age_months)}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
