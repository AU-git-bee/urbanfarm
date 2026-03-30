import { Router } from 'express'
import pool from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM employees ORDER BY name')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/availability', requireAdmin, async (req, res) => {
  const { available } = req.body
  try {
    const { rows } = await pool.query(
      'UPDATE employees SET available=$1 WHERE id=$2 RETURNING *',
      [available, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Dipendente non trovato' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
