# 🫀 Pulse

> *The Ambient Loneliness Detector & Micro-Connection Engine*  
> Built by Chandra Sura · M.S. Computer Science, UCM

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

---

## 📁 Repository Structure

```
pulse/
├── backend/                    ← Python FastAPI server (deploys to Railway)
│   ├── main.py                 ← App entry point
│   ├── __init__.py
│   └── api/
│       └── routes/
│           ├── chat.py         ← AI companion (Claude API)
│           ├── signals.py      ← Isolation score engine
│           ├── nudges.py       ← Micro-nudge generator
│           └── events.py       ← Nearby event matching
│
├── frontend/
│   ├── index.html              ← Landing page (deploy to Netlify)
│   └── dashboard.html          ← Employer wellness dashboard
│
├── Procfile                    ← Railway start command
├── requirements.txt            ← Python dependencies
├── runtime.txt                 ← Python version
├── .env.example                ← Environment variables template
└── .gitignore                  ← Keep secrets safe
```

---

## 🚀 Deploy Backend (Railway)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub → select this repo
3. Add environment variable: `ANTHROPIC_API_KEY=your_key`
4. Deploy — live in 2 minutes at `your-app.railway.app`

## 🌐 Deploy Frontend (Netlify)

1. Go to [netlify.com](https://netlify.com)
2. Already live! Just update `index.html` in this repo and it auto-deploys.

## 💻 Run Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Add your API key
cp .env.example .env
# Edit .env and add ANTHROPIC_API_KEY

# Start server
uvicorn backend.main:app --reload

# Visit http://localhost:8000/docs
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | AI companion chat |
| POST | `/api/signals/ingest` | Submit isolation signals |
| POST | `/api/nudges/generate` | Get micro-nudges |
| POST | `/api/events/nearby` | Get nearby events |

---

*Pulse · hello@pulse.app · pulse.app*
