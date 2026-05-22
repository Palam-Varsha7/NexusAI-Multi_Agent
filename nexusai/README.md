# NexusAI

NexusAI is a business automation console with five agents:

- OrchestratorBot routes natural-language commands across agents.
- RecruitBot screens resumes, explains scoring, drafts emails, and flags low-score candidates.
- SalesBot scores leads, analyzes sentiment, drafts follow-ups, and flags cold deals.
- ProjectBot turns goals into tasks, boards, timelines, status reports, and overdue alerts.
- FinanceBot detects expense anomalies, forecasts cash flow, drafts invoices, and summarizes finance risk.

## Architecture

```text
Browser / React / Vite
  |
  | fetch /api/*
  v
FastAPI backend
  |
  +-- Recruit routes      -> Groq fallback scoring + PDF parsing
  +-- Sales routes        -> lead scoring + sentiment
  +-- Project routes      -> plan/status generation
  +-- Finance routes      -> anomaly and summary logic
  +-- RAG routes          -> PDF ingest + FAISS-backed retrieval
  +-- Report routes       -> cross-agent report + PDF download
```

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Framer Motion, Recharts, lucide-react |
| Backend | FastAPI, Uvicorn, Pydantic |
| AI | Groq API with deterministic local fallbacks |
| RAG | pdfplumber, LangChain, FAISS |
| Reports | reportlab PDF generation |
| Demo data | Faker-generated JSON in `public/sample-data` |
| Deployment | Vercel frontend, Render backend, backend Dockerfile |

## Run Locally

Frontend:

```bash
npm install
npm run dev
```

For a deployed frontend, set `VITE_API_BASE_URL` to your backend URL, for example:

```bash
VITE_API_BASE_URL=https://your-render-api.onrender.com
```

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Copy `backend/.env.example` to `backend/.env` and set `GROQ_API_KEY` for live LLM calls. Without the key, NexusAI uses local fallback logic so the demo still works.

## Deploy

Vercel:

1. Import the repo.
2. Use Vite defaults: build command `npm run build`, output `dist`.
3. Keep `vercel.json` rewrites enabled for client-side routing.

Render:

1. Create a Blueprint from `render.yaml`, or create a Python web service with root directory `backend`.
2. Build command: `pip install -r requirements.txt`.
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
4. Add `GROQ_API_KEY`, `FAISS_INDEX_PATH`, and `ALLOWED_ORIGINS`.

## Agent Logic

Routing: `backend/routes/orchestrator.py` detects domain keywords in a command and selects Recruit, Sales, Project, Finance, or all four. The frontend shows routed agents, reasoning steps, and memory/activity updates.

RAG: `DocUpload` sends PDFs to `/api/rag/upload`; the backend extracts chunks and stores the index. Queries call `/api/rag/query`, retrieve relevant chunks, and return cited answers.

Streaming: frontend responses render through `StreamingOutput`, which animates generated text into the UI. API calls are token-tracked globally by `useTokenTracker`.

Reasoning trace: each module displays concise trace steps explaining why the agent produced a score, route, risk, or summary. These are product-facing explanations, not hidden chain-of-thought.

## Sample Data

`backend/seed/generate_sample_data.py` creates:

- 20 resumes in `public/sample-data/resumes.json`
- 15 leads in `public/sample-data/leads.json`
- 25 tasks in `public/sample-data/tasks.json`
- 30 invoice/expense entries in `public/sample-data/invoices.json`

Each specialist module preloads its sample data on first render so the demo is usable without manual input.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `GROQ_API_KEY` | Enables live LLM responses. |
| `FAISS_INDEX_PATH` | Path for the RAG vector index. |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins for the FastAPI service. |

## QA Checklist

- Intro animation plays and skip works.
- All five role logins render the correct allowed modules.
- Recruit, Sales, Project, and Finance call backend endpoints and render animated responses.
- OrchestratorBot routes commands to all agents.
- RAG upload and cited response flow is available.
- Cross-agent report generates and downloads PDF.
- Proactive alerts fire for finance anomalies, cold deals, overdue tasks, and resume scores below 40.
- Token tracker updates on API calls.
- Dark/light toggle persists.
- Mobile layout works at 375px with bottom navigation.
- Sample data preloads on first render.
- Build completes without console-blocking errors.
