import { Router } from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/', requireAuth, async (req, res) => {
  const { nps, categories, note } = req.body
  if (nps === undefined || nps === null) return res.status(400).json({ error: 'NPS richiesto' })
  try {
    const { rows } = await pool.query(
      `INSERT INTO feedback (user_id, nps, categories, note)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, nps, categories || [], note || '']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
