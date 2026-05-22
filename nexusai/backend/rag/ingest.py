from pathlib import Path
from uuid import uuid4

import pdfplumber

try:
  from langchain_text_splitters import RecursiveCharacterTextSplitter
except Exception:
  try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
  except Exception:
    class RecursiveCharacterTextSplitter:
      def __init__(self, chunk_size: int = 900, chunk_overlap: int = 140):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

      def split_text(self, text: str) -> list[str]:
        chunks = []
        start = 0
        while start < len(text):
          end = start + self.chunk_size
          chunks.append(text[start:end])
          start = max(end - self.chunk_overlap, end)
        return chunks

try:
  from langchain_community.embeddings import FakeEmbeddings
  from langchain_community.vectorstores import FAISS
  from langchain_core.documents import Document
except Exception:
  FakeEmbeddings = None
  FAISS = None
  Document = None

INDEX: list[dict] = []
VECTOR_STORE = None


def ingest_pdf(file_path: str, filename: str) -> dict:
  global VECTOR_STORE

  text_chunks = []
  with pdfplumber.open(file_path) as pdf:
    for page_index, page in enumerate(pdf.pages, start=1):
      text = page.extract_text() or ""
      if text.strip():
        text_chunks.append({"text": text, "page": page_index})

  splitter = RecursiveCharacterTextSplitter(chunk_size=900, chunk_overlap=140)
  created = 0
  documents = []
  for page_chunk in text_chunks:
    for chunk in splitter.split_text(page_chunk["text"]):
      INDEX.append(
        {
          "id": str(uuid4()),
          "filename": filename,
          "page": page_chunk["page"],
          "text": chunk
        }
      )
      if Document:
        documents.append(
          Document(
            page_content=chunk,
            metadata={"filename": filename, "page": page_chunk["page"]}
          )
        )
      created += 1

  if FAISS and FakeEmbeddings and documents:
    store = FAISS.from_documents(documents, FakeEmbeddings(size=384))
    if VECTOR_STORE:
      VECTOR_STORE.merge_from(store)
    else:
      VECTOR_STORE = store

  return {
    "filename": filename,
    "chunks": created,
    "index_path": str(Path("backend/storage/faiss_memory.index"))
  }
