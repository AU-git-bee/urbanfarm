import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Username e password richiesti' })

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username])
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Credenziali non valide' })
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, role: user.role, name: user.name })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore del server' })
  }
})

export default router
