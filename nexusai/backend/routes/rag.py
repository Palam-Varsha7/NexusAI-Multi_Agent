from pathlib import Path

from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel

from rag.ingest import ingest_pdf
from rag.query import answer_question

router = APIRouter()

UPLOAD_DIR = Path("backend/storage/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class QueryRequest(BaseModel):
  question: str


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
  target = UPLOAD_DIR / file.filename
  target.write_bytes(await file.read())
  return ingest_pdf(str(target), file.filename)


@router.post("/query")
async def query_document(payload: QueryRequest):
  return answer_question(payload.question)
