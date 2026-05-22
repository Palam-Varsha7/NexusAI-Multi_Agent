import hashlib
import json
import os
import re
from datetime import date, timedelta
from typing import Any

from groq import Groq


MODEL = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")


def call_groq_json(prompt: str, schema_hint: str, *, temperature: float = 0.25) -> dict[str, Any] | None:
  api_key = os.getenv("GROQ_API_KEY")
  if not api_key:
    return None

  client = Groq(api_key=api_key)
  completion = client.chat.completions.create(
    model=MODEL,
    messages=[
      {
        "role": "system",
        "content": (
          "You are NexusAI, a multi-agent business automation system. "
          "Return compact valid JSON only. Avoid markdown. "
          f"{schema_hint}"
        )
      },
      {"role": "user", "content": prompt}
    ],
    temperature=temperature,
    response_format={"type": "json_object"}
  )
  return json.loads(completion.choices[0].message.content)


def stable_int(text: str, low: int, high: int) -> int:
  digest = hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()
  span = max(1, high - low + 1)
  return low + (int(digest[:8], 16) % span)


def extract_keywords(text: str, limit: int = 6) -> list[str]:
  stop = {
    "about", "above", "after", "again", "agent", "and", "are", "automation",
    "business", "can", "could", "for", "from", "have", "into", "nexusai",
    "our", "please", "should", "that", "the", "this", "through", "with", "would"
  }
  words = re.findall(r"[a-zA-Z][a-zA-Z0-9-]{2,}", text.lower())
  ranked: list[str] = []
  for word in words:
    if word not in stop and word not in ranked:
      ranked.append(word)
    if len(ranked) >= limit:
      break
  return ranked or ["workflow", "risk", "growth"]


def next_business_days(count: int = 4) -> list[str]:
  current = date.today()
  days: list[str] = []
  while len(days) < count:
    current += timedelta(days=1)
    if current.weekday() < 5:
      days.append(current.strftime("%b %d"))
  return days
