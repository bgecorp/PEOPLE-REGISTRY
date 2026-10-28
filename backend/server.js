import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import pool from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// Place names: letters, numbers, spaces and . , ' ( ) # -
const PLACE_RE = /^[\p{L}0-9 .,'()#-]{1,100}$/u;
const cleanPlace = (v) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');

// Validate a first name (letters, hyphens, apostrophes; no spaces), an age 0-150, a barangay and a city.
function validate({ firstName, age, barangay, city }) {
  const name = typeof firstName === 'string' ? firstName.trim() : '';
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'-]{1,50}$/.test(name)) {
    return { error: 'First name must be 1-50 letters with no spaces.' };
  }
  const n = Number(age);
  if (!Number.isInteger(n) || n < 0 || n > 150) {
    return { error: 'Age must be a whole number between 0 and 150.' };
  }
  const brgy = cleanPlace(barangay);
  if (!PLACE_RE.test(brgy)) {
    return { error: 'Barangay is required (up to 100 letters, numbers or spaces).' };
  }
  const cty = cleanPlace(city);
  if (!PLACE_RE.test(cty)) {
    return { error: 'City is required (up to 100 letters, numbers or spaces).' };
  }
  return { name, age: n, barangay: brgy, city: cty };
}

app.get('/api/people', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, first_name AS firstName, age, barangay, city FROM people ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/people', async (req, res) => {
  const v = validate(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  try {
    const [result] = await pool.execute(
      'INSERT INTO people (first_name, age, barangay, city) VALUES (?, ?, ?, ?)',
      [v.name, v.age, v.barangay, v.city]
    );
    res.status(201).json({ id: result.insertId, firstName: v.name, age: v.age, barangay: v.barangay, city: v.city });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/people/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM people WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
