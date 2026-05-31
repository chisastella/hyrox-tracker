import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IS_PROD   = process.env.NODE_ENV === 'production';

// Support Railway volume: DATABASE_PATH env var
const DB_PATH = process.env.DATABASE_PATH ?? join(__dirname, 'workouts.db');
const db      = new DatabaseSync(DB_PATH);
const app     = express();

app.use(cors());
app.use(express.json({ limit: '5mb' })); // allow avatar base64

db.exec(`
  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    duration INTEGER DEFAULT 60,
    notes TEXT DEFAULT '',
    points INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

try { db.exec('ALTER TABLE workouts ADD COLUMN distance_km REAL DEFAULT NULL'); } catch (_) {}
try { db.exec('ALTER TABLE workouts ADD COLUMN custom_label TEXT DEFAULT NULL'); } catch (_) {}

const upsertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
upsertSetting.run('name_chisa',   'Chisa');
upsertSetting.run('name_partner', 'Luc');
db.prepare("UPDATE settings SET value='Luc' WHERE key='name_partner' AND value='Kai'").run();

// ── API routes ────────────────────────────────────────────────────────────────

app.get('/api/workouts', (_req, res) => {
  res.json(db.prepare('SELECT * FROM workouts ORDER BY date DESC, created_at DESC').all());
});

app.post('/api/workouts', (req, res) => {
  const { user, date, type, duration, notes, points, distance_km, custom_label } = req.body;
  if (!user || !date || !type || !points)
    return res.status(400).json({ error: 'Missing required fields' });
  const result = db.prepare(
    'INSERT INTO workouts (user,date,type,duration,notes,points,distance_km,custom_label) VALUES(?,?,?,?,?,?,?,?)'
  ).run(user, date, type, duration ?? 60, notes ?? '', points, distance_km ?? null, custom_label ?? null);
  res.json(db.prepare('SELECT * FROM workouts WHERE id=?').get(result.lastInsertRowid));
});

app.delete('/api/workouts/:id', (req, res) => {
  db.prepare('DELETE FROM workouts WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/settings', (_req, res) => {
  const obj = {};
  db.prepare('SELECT key,value FROM settings').all().forEach(r => { obj[r.key] = r.value; });
  res.json(obj);
});

app.patch('/api/settings', (req, res) => {
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES(?,?)');
  Object.entries(req.body).forEach(([k, v]) => upsert.run(k, v ?? ''));
  res.json({ success: true });
});

// ── Static file serving (production) ─────────────────────────────────────────

if (IS_PROD) {
  const dist = join(__dirname, '..', 'client', 'dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(join(dist, 'index.html')));
}

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`\n🏋️  HYROX Tracker running on port ${PORT} [${IS_PROD ? 'production' : 'dev'}]\n`);
});
