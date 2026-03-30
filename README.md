# 🌱 UrbanFarm

Webapp per la gestione di orti aziendali urbani con AI agronomica powered by Claude (Anthropic).

---

## Stack tecnico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 18 + Vite |
| Stili | Tailwind CSS |
| AI | Anthropic Claude API (Sonnet) |
| Hosting frontend | Railway / Vercel |
| Hosting backend | Railway (Node.js) |
| Database | PostgreSQL su Railway |

---

## Prerequisiti

- Node.js >= 18
- npm >= 9
- Chiave API Anthropic → https://console.anthropic.com

---

## Setup locale

### 1. Clona e installa

```bash
git clone https://github.com/tuo-utente/urbanfarm.git
cd urbanfarm
npm install
```

### 2. Configura le variabili d'ambiente

```bash
cp .env.example .env
```

Apri `.env` e inserisci la tua chiave:

```
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx
```

> ⚠️ **Non committare mai il file `.env`** — è già in `.gitignore`

### 3. Avvia il dev server

```bash
npm run dev
```

Apri → http://localhost:5173

---

## Struttura del progetto

```
urbanfarm/
├── src/
│   ├── UrbanFarm.jsx      # App principale (tutti i componenti)
│   ├── main.jsx           # Entry point React
│   └── index.css          # Stili globali + Tailwind
├── public/
│   └── favicon.ico
├── .env                   # Chiavi API (NON su Git)
├── .env.example           # Template variabili
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## Funzionalità

### 👤 Ruolo Amministratore
- **Registro Piante** — elenco con stato (ok / attenzione / critico), dettaglio, QR code, note
- **Team Builder** — genera squadra mista tra reparti, importa CSV dipendenti
- **Turni** — calendario rotazioni settimanali con stato

### 🌿 Ruolo Operatore
- **Home** — turno corrente, stato rapido piante, statistiche
- **Scanner QR** — scansiona pianta (simulato) → apre dettaglio
- **Dettaglio pianta** — irrigazione, stato, segnalazione "Non posso", AI advice
- **Feedback** — wizard NPS a 3 step con categorie attività e upload foto

### 🤖 Integrazione Claude AI
Nel dettaglio di ogni pianta, il pulsante **"Genera consigli agronomici"** chiama Claude Sonnet in tempo reale con contesto specifico (nome pianta, stato, ultima irrigazione, note) e restituisce 3 consigli pratici.

---

## Chiamata API Anthropic (attuale — browser diretto)

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true"
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }]
  })
});
```

> ⚠️ La chiave nel frontend è accettabile **solo in sviluppo locale**. In produzione usa il backend proxy (vedi sotto).

---

## Backend proxy (produzione su Railway)

Per non esporre la chiave API nel bundle JS, crea un server Express su Railway:

```bash
mkdir server && cd server
npm init -y
npm install express cors
```

`server/index.js`:

```javascript
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json())

app.post('/api/ai/advice', async (req, res) => {
  const { prompt } = req.body
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await response.json()
  res.json(data)
})

app.listen(process.env.PORT || 3001)
```

Poi nel frontend punta a `/api/ai/advice` invece che direttamente ad Anthropic.

---

## Deploy su Railway

### Frontend (statico)
```bash
npm run build
# Collega la cartella dist a Railway o Vercel
```

### Backend (Node)
```bash
# Su Railway: nuovo servizio → GitHub repo → cartella /server
# Variabili d'ambiente da impostare su Railway:
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=https://urbanfarm.up.railway.app
PORT=3001
```

---

## Roadmap

- [ ] Autenticazione reale (JWT / OAuth aziendali)
- [ ] Database PostgreSQL — piante, turni, feedback persistenti
- [ ] Notifiche push per turni imminenti
- [ ] Dashboard IoT con InfluxDB (sensori suolo, aria, temperatura)
- [ ] Scanner QR reale (libreria `html5-qrcode`)
- [ ] Upload foto reale (S3 / Cloudinary)
- [ ] Export report PDF turni e feedback
- [ ] App mobile (React Native / Capacitor)

---

## Sviluppato con Claude Code

Questo progetto è stato prototipato interattivamente su Claude.ai e continua lo sviluppo con **Claude Code** in VS Code.

```bash
# Installa Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Avvia Claude Code nella root del progetto
claude
```

---

## Licenza

MIT — Progetto interno aziendale Pronove.
