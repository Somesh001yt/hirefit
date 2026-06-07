# HireFit 🎯

> AI-powered job application tracker that scores how well your resume matches a job description — and rewrites your summary to close the gap.

**Live demo:** [hirefit.info](https://hirefit.info)  
**API docs:** [hirefit-api.onrender.com/docs](https://hirefit-api.onrender.com/docs)

---

## What it does

Most job seekers apply with the same generic resume and wonder why they don't hear back. ATS systems reject resumes before any human reads them — purely based on keyword matching.

HireFit solves this by:

- **Scoring** how well your resume matches a specific job description (0–100)
- **Surfacing** missing keywords the ATS is looking for
- **Rewriting** your resume summary tailored to that exact role
- **Tracking** all your job applications in one place with status updates

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, TypeScript |
| Backend | FastAPI (Python), SQLAlchemy, Alembic |
| Database | PostgreSQL (Neon — serverless) |
| AI | Google Gemini 2.5 Flash (free tier) |
| Auth | JWT + bcrypt |
| Deployment | Vercel (frontend), Render (backend) |

---

## Architecture

```
hirefit/
├── backend/                  # FastAPI Python app
│   ├── app/
│   │   ├── core/             # Config, JWT security
│   │   ├── models/           # SQLAlchemy DB models
│   │   ├── routes/           # Auth, Applications, AI endpoints
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Gemini AI service layer
│   │   └── main.py           # App entry point, CORS, routers
│   ├── alembic/              # DB migrations
│   └── requirements.txt
└── frontend/                 # Next.js app
    ├── app/                  # App Router pages
    ├── components/           # Reusable UI components
    ├── context/              # Auth context (global state)
    ├── hooks/                # Business logic hooks
    └── lib/                  # Axios client + API endpoints
```

---

## API endpoints

```
POST   /auth/register         → create account, returns JWT
POST   /auth/login            → returns JWT
GET    /auth/me               → current user info

GET    /applications          → list all applications
POST   /applications          → add application
PATCH  /applications/:id      → update status
DELETE /applications/:id      → soft delete

POST   /ai/match              → AI resume vs JD score + keywords
POST   /ai/rewrite            → AI rewrite resume summary for JD
GET    /ai/history            → past AI analyses
GET    /health                → health check
```

---

## Local setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or Neon free account)
- Google Gemini API key (free at aistudio.google.com)

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # fill in your values
alembic upgrade head        # creates tables in DB
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # fill in NEXT_PUBLIC_API_URL
npm run dev
```

Frontend runs at `http://localhost:3000`

### Environment variables

**Backend `.env`:**
```
DATABASE_URL=postgresql+asyncpg://user:password@host/db?ssl=require
JWT_SECRET=your-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GEMINI_API_KEY=your-gemini-key
ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## AI model fallback chain

The Gemini service tries models in order if quota is exhausted:

```
gemini-2.5-flash-lite  →  gemini-2.5-flash  →  gemini-2.0-flash-lite  →  gemini-2.0-flash
```

This keeps the app running even under high load on the free tier.

---

## Deployment

| Service | Provider | Cost |
|---|---|---|
| Frontend | Vercel | Free |
| Backend | Render | Free |
| Database | Neon | Free |
| AI API | Google Gemini | Free |
| Keep-alive | UptimeRobot | Free |

**Total monthly cost: ₹0**

---

## Built by

**Somesh Bhandari** — Full Stack Developer  
[LinkedIn](https://linkedin.com/in/your-linkedin) · [Portfolio](https://hirefit.info) · [GitHub](https://github.com/Somesh001yt)
