import { Router } from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        s.id, s.week_label AS week, s.week_start, s.status,
        COALESCE(json_agg(DISTINCT p.name) FILTER (WHERE p.id IS NOT NULL), '[]') AS plants,
        COALESCE(json_agg(DISTINCT e.name) FILTER (WHERE e.id IS NOT NULL), '[]') AS team
      FROM schedules s
      LEFT JOIN schedule_plants sp ON s.id = sp.schedule_id
      LEFT JOIN plants p ON sp.plant_id = p.id
      LEFT JOIN schedule_employees se ON s.id = se.schedule_id
      LEFT JOIN employees e ON se.employee_id = e.id
      GROUP BY s.id
      ORDER BY s.week_start
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
