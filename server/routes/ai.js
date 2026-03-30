import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/advice', requireAuth, async (req, res) => {
  const { plant } = req.body
  if (!plant) return res.status(400).json({ error: 'Dati pianta mancanti' })

  const statusLabel =
    plant.status === 'ok' ? 'buono' :
    plant.status === 'attention' ? 'necessita attenzione' :
    'critico — urgente'

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `Sei un agronomo esperto per orti aziendali urbani. Analizza questa pianta e fornisci 3 consigli pratici in italiano:

Pianta: ${plant.name}
Posizione: ${plant.location}
Stato: ${statusLabel}
Ultima irrigazione: ${plant.lastWatered || 'non registrata'}
Note: ${plant.notes || 'nessuna nota'}

Rispondi con bullet points brevi (max 2 righe ciascuno), pratici e immediatamente applicabili. Usa emoji pertinenti.`,
        }],
      }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error?.message || 'Errore API Anthropic')
    res.json({ advice: data.content?.[0]?.text || 'Nessuna risposta ricevuta.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

export default router
