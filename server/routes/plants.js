import { Router } from 'express'
import pool from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM plants ORDER BY location')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', requireAdmin, async (req, res) => {
  const { name, location, status, notes } = req.body
  if (!name || !location) return res.status(400).json({ error: 'Nome e posizione richiesti' })
  try {
    const { rows } = await pool.query(
      `INSERT INTO plants (name, location, status, notes, last_watered)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [name, location, status || 'ok', notes || '']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', requireAdmin, async (req, res) => {
  const { name, location, status, notes } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE plants SET name=$1, location=$2, status=$3, notes=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [name, location, status, notes, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Pianta non trovata' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/water', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE plants SET last_watered=NOW(), updated_at=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Pianta non trovata' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM plants WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
