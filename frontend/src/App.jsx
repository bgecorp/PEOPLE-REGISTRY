import { useEffect, useMemo, useState } from 'react';

const API = '/api/people';

const SORTS = [
  { key: 'oldest', label: 'Oldest first' },
  { key: 'youngest', label: 'Youngest first' },
];

export default function App() {
  const [people, setPeople] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState('oldest');

  const sortedPeople = useMemo(() => {
    const dir = sort === 'oldest' ? -1 : 1;
    return [...people].sort((a, b) => dir * (a.age - b.age));
  }, [people, sort]);

  const averageAge = people.length
    ? (people.reduce((sum, p) => sum + p.age, 0) / people.length).toFixed(1)
    : null;

  // Clicking the Age header toggles between oldest and youngest first.
  function toggleAgeSort() {
    setSort((s) => (s === 'oldest' ? 'youngest' : 'oldest'));
  }

  useEffect(() => {
    fetch(API)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setPeople)
      .catch(() => setError('Could not load people. Is the backend running?'));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const name = firstName.trim();
    if (!name || /\s/.test(name)) return setError('Enter a first name only (no spaces).');
    if (age === '' || Number(age) < 0 || Number(age) > 150) return setError('Enter an age from 0 to 150.');
    if (!barangay.trim()) return setError('Enter a barangay.');
    if (!city.trim()) return setError('Enter a city.');

    setLoading(true);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: name, age: Number(age), barangay: barangay.trim(), city: city.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setPeople((prev) => [data, ...prev]);
      setFirstName('');
      setAge('');
      setBarangay('');
      setCity('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (res.ok) setPeople((prev) => prev.filter((p) => p.id !== id));
    else setError('Delete failed');
  }

  return (
    <main className="container">
      <h1>People Registry</h1>

      <form onSubmit={handleSubmit} className="card">
        <label>
          First name
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Maria"
            maxLength={50}
          />
        </label>
        <label>
          Age
          <input
            type="number"
            min="0"
            max="150"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 28"
          />
        </label>
        <label>
          Barangay
          <input
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            placeholder="e.g. San Isidro"
            maxLength={100}
          />
        </label>
        <label>
          City
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Quezon City"
            maxLength={100}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Add person'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>

      <section className="card">
        <div className="list-header">
          <h2>Saved <span className="count">{people.length}</span></h2>
          <div className="segmented" role="group" aria-label="Sort">
            {SORTS.map((o) => (
              <button
                key={o.key}
                type="button"
                className={sort === o.key ? 'active' : ''}
                aria-pressed={sort === o.key}
                onClick={() => setSort(o.key)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        {people.length === 0 ? (
          <p className="muted">No one added yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>First name</th>
                <th>
                  <button type="button" className="th-sort" onClick={toggleAgeSort}>
                    Age
                    <span className="arrow">
                      {sort === 'oldest' ? '↓' : '↑'}
                    </span>
                  </button>
                </th>
                <th>Barangay</th>
                <th>City</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedPeople.map((p) => (
                <tr key={p.id}>
                  <td>{p.firstName}</td>
                  <td>{p.age}</td>
                  <td>{p.barangay || '—'}</td>
                  <td>{p.city || '—'}</td>
                  <td><button className="link" onClick={() => handleDelete(p.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {averageAge !== null && (
          <div className="average">
            <span>Average age</span>
            <strong>{averageAge}</strong>
          </div>
        )}
      </section>
    </main>
  );
}
