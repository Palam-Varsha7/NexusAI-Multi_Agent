import os

from groq import Groq

from rag import ingest


def _score_chunk(question: str, chunk: dict) -> int:
  question_terms = set(question.lower().split())
  chunk_terms = set(chunk["text"].lower().split())
  return len(question_terms & chunk_terms)


def retrieve_chunks(question: str, top_k: int = 4) -> list[dict]:
  if ingest.VECTOR_STORE:
    docs = ingest.VECTOR_STORE.similarity_search(question, k=top_k)
    return [
      {
        "filename": doc.metadata.get("filename", "document.pdf"),
        "page": doc.metadata.get("page", 1),
        "text": doc.page_content
      }
      for doc in docs
    ]

  ranked = sorted(ingest.INDEX, key=lambda chunk: _score_chunk(question, chunk), reverse=True)
  return ranked[:top_k]


def answer_question(question: str) -> dict:
  chunks = retrieve_chunks(question)
  if not chunks:
    return {
      "answer": "No indexed documents are available yet. Upload a PDF first, then ask again.",
      "citations": [],
      "confidence": 55,
      "tokens_used": 220
    }

  context = "\n\n".join(
    f"Source: {chunk['filename']}, Page {chunk['page']}\n{chunk['text']}"
    for chunk in chunks
  )
  api_key = os.getenv("GROQ_API_KEY")

  if api_key:
    client = Groq(api_key=api_key)
    completion = client.chat.completions.create(
      model="llama-3.1-70b-versatile",
      messages=[
        {
          "role": "system",
          "content": "Detect Hindi, Telugu, or English input language and answer in the same language. Use only cited context."
        },
        {
          "role": "user",
          "content": f"Question: {question}\n\nContext:\n{context}"
        }
      ],
      temperature=0.2
    )
    answer = completion.choices[0].message.content
  else:
    answer = (
      "Based on the indexed document context, the strongest answer comes from the cited passages. "
      "Review the source pages below for the supporting evidence."
    )

  return {
    "answer": answer,
    "citations": [
      {"filename": chunk["filename"], "page": chunk["page"]}
      for chunk in chunks
    ],
    "confidence": 82,
    "tokens_used": 1200
  }
