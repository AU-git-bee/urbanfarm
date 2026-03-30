/**
 * Setup database: crea tabelle e inserisce dati iniziali.
 * Eseguire una volta: node server/setup.js
 */
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import pool from './db.js'

async function setup() {
  console.log('🌱 UrbanFarm — setup database...')

  // ── Schema ────────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operatore')),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS plants (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      location VARCHAR(50) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'attention', 'critical')),
      last_watered TIMESTAMP,
      notes TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      dept VARCHAR(50) NOT NULL,
      available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      week_label VARCHAR(100) NOT NULL,
      week_start DATE NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('completed', 'current', 'upcoming')),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS schedule_plants (
      schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
      plant_id    INTEGER REFERENCES plants(id)    ON DELETE CASCADE,
      PRIMARY KEY (schedule_id, plant_id)
    );

    CREATE TABLE IF NOT EXISTS schedule_employees (
      schedule_id  INTEGER REFERENCES schedules(id)   ON DELETE CASCADE,
      employee_id  INTEGER REFERENCES employees(id)   ON DELETE CASCADE,
      PRIMARY KEY (schedule_id, employee_id)
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER REFERENCES users(id),
      nps          INTEGER NOT NULL CHECK (nps >= 0 AND nps <= 10),
      categories   TEXT[]  DEFAULT '{}',
      note         TEXT    DEFAULT '',
      submitted_at TIMESTAMP DEFAULT NOW()
    );
  `)
  console.log('✅ Tabelle create')

  // ── Utenti ────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 10)
  const opHash    = await bcrypt.hash('operatore123', 10)

  await pool.query(`
    INSERT INTO users (username, password_hash, name, role) VALUES
      ('admin',     $1, 'Amministratore', 'admin'),
      ('operatore', $2, 'Operatore Demo', 'operatore')
    ON CONFLICT (username) DO NOTHING
  `, [adminHash, opHash])
  console.log('✅ Utenti creati  (admin/admin123 · operatore/operatore123)')

  // ── Piante ────────────────────────────────────────────────────────────────
  const plantsResult = await pool.query(`
    INSERT INTO plants (name, location, status, last_watered, notes) VALUES
      ('Pomodoro Cherry',   'Box A1', 'ok',        NOW() - INTERVAL '2 days',  ''),
      ('Basilico Genovese', 'Box A2', 'attention', NOW() - INTERVAL '5 days',  'Necessita irrigazione urgente'),
      ('Lattuga Romana',    'Box B1', 'ok',        NOW() - INTERVAL '1 day',   ''),
      ('Zucchine',          'Box B2', 'critical',  NOW() - INTERVAL '7 days',  'Crescita bloccata, controllare radici'),
      ('Peperoni Dolci',    'Box C1', 'ok',        NOW() - INTERVAL '3 days',  ''),
      ('Rucola Selvatica',  'Box C2', 'ok',        NOW() - INTERVAL '2 days',  ''),
      ('Cipollotto',        'Box D1', 'attention', NOW() - INTERVAL '4 days',  'Foglie ingiallite'),
      ('Menta Piperita',    'Box D2', 'ok',        NOW() - INTERVAL '1 day',   '')
    ON CONFLICT DO NOTHING
    RETURNING id, name
  `)
  const plants = plantsResult.rows
  console.log(`✅ ${plants.length} piante inserite`)

  // ── Dipendenti ────────────────────────────────────────────────────────────
  const empResult = await pool.query(`
    INSERT INTO employees (name, dept, available) VALUES
      ('Marco Rossi',    'IT',         true),
      ('Sara Bianchi',   'HR',         true),
      ('Luca Verde',     'Marketing',  false),
      ('Anna Neri',      'Finance',    true),
      ('Paolo Gialli',   'Operations', true),
      ('Chiara Blu',     'Sales',      true),
      ('Roberto Viola',  'IT',         true),
      ('Elena Rosa',     'Marketing',  true),
      ('Davide Marrone', 'HR',         false),
      ('Francesca Oro',  'Finance',    true)
    ON CONFLICT DO NOTHING
    RETURNING id, name
  `)
  const emps = empResult.rows
  console.log(`✅ ${emps.length} dipendenti inseriti`)

  // ── Turni ─────────────────────────────────────────────────────────────────
  if (plants.length >= 8 && emps.length >= 8) {
    const schResult = await pool.query(`
      INSERT INTO schedules (week_label, week_start, status) VALUES
        ('Settimana 13 (25 mar)', '2025-03-25', 'completed'),
        ('Settimana 14 (1 apr)',  '2025-04-01', 'current'),
        ('Settimana 15 (8 apr)',  '2025-04-08', 'upcoming'),
        ('Settimana 16 (15 apr)', '2025-04-15', 'upcoming')
      ON CONFLICT DO NOTHING
      RETURNING id
    `)
    const sids = schResult.rows.map(r => r.id)

    if (sids.length === 4) {
      // schedule_plants
      await pool.query(`
        INSERT INTO schedule_plants VALUES
          ($1,$2),($1,$6),
          ($3,$3),($3,$5),
          ($4,$3),($4,$7),
          ($5,$4),($5,$8)
        ON CONFLICT DO NOTHING
      `, [sids[0], plants[0]?.id, sids[1], plants[1]?.id,
          plants[4]?.id, plants[5]?.id,
          sids[2], plants[2]?.id, plants[6]?.id,
          sids[3], plants[3]?.id, plants[7]?.id])

      // schedule_employees
      await pool.query(`
        INSERT INTO schedule_employees VALUES
          ($1,$5),($1,$6),
          ($2,$9),($2,$10),
          ($3,$11),($3,$12),
          ($4,$13),($4,$14)
        ON CONFLICT DO NOTHING
      `, [sids[0], emps[0]?.id, emps[1]?.id,
          sids[1], emps[2]?.id, emps[3]?.id,
          sids[2], emps[4]?.id, emps[5]?.id,
          sids[3], emps[6]?.id, emps[7]?.id])
      console.log('✅ Turni inseriti')
    }
  }

  console.log('\n🚀 Setup completato! Avvia il server con: npm start')
  await pool.end()
}

setup().catch(err => { console.error('❌ Errore setup:', err); process.exit(1) })
