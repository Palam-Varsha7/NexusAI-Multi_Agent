import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from routes import finance, orchestrator, project, rag, recruit, report, sales

app = FastAPI(title="NexusAI API", version="2.0.0")

allowed_origins = [
  origin.strip()
  for origin in os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173"
  ).split(",")
  if origin.strip()
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=allowed_origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)

app.include_router(recruit.router, prefix="/api/recruit", tags=["recruit"])
app.include_router(sales.router, prefix="/api/sales", tags=["sales"])
app.include_router(project.router, prefix="/api/project", tags=["project"])
app.include_router(finance.router, prefix="/api/finance", tags=["finance"])
app.include_router(orchestrator.router, prefix="/api/orchestrator", tags=["orchestrator"])
app.include_router(rag.router, prefix="/api/rag", tags=["rag"])
app.include_router(report.router, prefix="/api/report", tags=["report"])


@app.get("/api/health")
async def health_check():
  return {"status": "ok", "service": "nexusai"}


@app.get("/")
async def open_frontend():
  return RedirectResponse("http://localhost:4173")
