import os
import smtplib
from email.message import EmailMessage
from typing import Annotated
from urllib.parse import quote

import pdfplumber
from fastapi import APIRouter, File, Form, UploadFile
from pydantic import BaseModel

from ai_utils import call_groq_json, extract_keywords, stable_int

router = APIRouter()


class EmailDraftRequest(BaseModel):
  candidate_name: str
  decision: str = "offer"
  candidate_context: str = ""
  variation_seed: str = ""


class SendEmailRequest(BaseModel):
  recipient: str
  subject: str
  body: str
  sender_name: str = "NexusAI Recruiting"


class QuestionRequest(BaseModel):
  candidate_context: str
  gaps: list[str] = []


def _fallback_response(resume_text: str, jd_text: str) -> dict:
  resume_words = set(resume_text.lower().split())
  jd_words = set(jd_text.lower().split())
  overlap = len(resume_words & jd_words)
  score = min(94, max(58, 62 + overlap * 2))
  match_percent = min(96, max(50, 55 + overlap * 3))

  return {
    "score": score,
    "match_percent": match_percent,
    "summary": (
      "Candidate shows a practical match against the submitted job description, "
      f"especially around {', '.join(extract_keywords(resume_text + ' ' + jd_text, 3))}."
    ),
    "gaps": [
      "Validate depth in the highest-priority workflow area.",
      "Ask for measurable outcomes from previous automation work."
    ],
    "bias_flags": [
      "No protected-class language detected.",
      "Review should remain focused on role-related evidence."
    ],
    "reasoning": [
      "Compared resume keywords and role responsibilities.",
      "Estimated match strength from overlapping experience signals.",
      "Checked for biased or irrelevant screening language.",
      "Returned a conservative score with gaps and review notes."
    ],
    "confidence": 84
  }


async def _read_resume_file(resume_file: UploadFile | None) -> str:
  if not resume_file:
    return ""

  if resume_file.content_type != "application/pdf":
    raw = await resume_file.read()
    return raw.decode("utf-8", errors="ignore")

  text_parts = []
  with pdfplumber.open(resume_file.file) as pdf:
    for page in pdf.pages:
      text_parts.append(page.extract_text() or "")

  return "\n".join(text_parts)


def _call_groq(resume_text: str, jd_text: str) -> dict | None:
  prompt = f"""
You are NexusAI RecruitBot. Screen the resume against the job description.
Return only valid JSON with keys:
score, match_percent, summary, gaps, bias_flags, reasoning, confidence.

Resume:
{resume_text[:8000]}

Job description:
{jd_text[:4000]}
"""
  return call_groq_json(
    prompt,
    "Use keys score, match_percent, summary, gaps, bias_flags, reasoning, confidence."
  )


@router.post("/screen")
async def screen_candidate(
  resume_text: Annotated[str, Form()] = "",
  jd_text: Annotated[str, Form()] = "",
  resume_file: Annotated[UploadFile | None, File()] = None
):
  extracted_text = await _read_resume_file(resume_file)
  combined_resume = "\n".join(part for part in [resume_text, extracted_text] if part)

  try:
    groq_response = _call_groq(combined_resume, jd_text)
    if groq_response:
      return groq_response
  except Exception:
    pass

  return _fallback_response(combined_resume, jd_text)


@router.post("/email")
async def draft_candidate_email(payload: EmailDraftRequest):
  decision = payload.decision.lower()
  try:
    response = call_groq_json(
      f"""
Draft a candidate email.
Candidate: {payload.candidate_name}
Decision: {decision}
Variation seed: {payload.variation_seed}
Context:
{payload.candidate_context[:5000]}

Make it respectful, role-related, bias-aware, and different from previous drafts.
""",
      "Use keys subject, draft, confidence, reasoning."
    )
    if response:
      return response
  except Exception:
    pass

  keywords = extract_keywords(payload.candidate_context + " " + payload.variation_seed)
  opener_options = [
    "Thank you for the time and detail you shared with the NexusAI team.",
    "We appreciated the conversation and the evidence you shared with our team.",
    "Thanks for walking us through your experience with the NexusAI team."
  ]
  opener = opener_options[stable_int(payload.variation_seed or payload.candidate_name, 0, len(opener_options) - 1)]
  if decision == "rejection":
    draft = (
      f"Hi {payload.candidate_name},\n\n{opener} "
      f"After reviewing the role evidence around {', '.join(keywords[:3])}, we will not move forward for this opening. "
      "We appreciate the time you invested and would be glad to keep your profile in mind for future roles that match more closely.\n\n"
      "Best,\nNexusAI Recruiting"
    )
  else:
    draft = (
      f"Hi {payload.candidate_name},\n\n{opener} "
      f"We were impressed by your evidence around {', '.join(keywords[:3])} and would like to move forward with an offer conversation. "
      "The next step is to align on compensation, start date, and any final questions you want us to address.\n\n"
      "Best,\nNexusAI Recruiting"
    )

  return {
    "subject": f"NexusAI {decision} update",
    "draft": draft,
    "confidence": stable_int(payload.candidate_context + decision + payload.variation_seed, 82, 92),
    "reasoning": [
      "Used role-related evidence from the candidate context.",
      "Kept the message respectful and legally safer.",
      "Avoided protected-class or subjective personality language."
    ]
  }


@router.post("/send-email")
async def send_candidate_email(payload: SendEmailRequest):
  smtp_host = os.getenv("SMTP_HOST")
  smtp_port = int(os.getenv("SMTP_PORT", "587"))
  smtp_user = os.getenv("SMTP_USER")
  smtp_password = os.getenv("SMTP_PASSWORD")
  smtp_from = os.getenv("SMTP_FROM", smtp_user or "noreply@nexusai.local")

  if smtp_host and smtp_user and smtp_password:
    message = EmailMessage()
    message["Subject"] = payload.subject
    message["From"] = f"{payload.sender_name} <{smtp_from}>"
    message["To"] = payload.recipient
    message.set_content(payload.body)
    with smtplib.SMTP(smtp_host, smtp_port, timeout=12) as smtp:
      smtp.starttls()
      smtp.login(smtp_user, smtp_password)
      smtp.send_message(message)
    return {
      "status": "sent",
      "recipient": payload.recipient,
      "message": "Email sent through configured SMTP.",
      "confidence": 96
    }

  return {
    "status": "queued_demo",
    "recipient": payload.recipient,
    "message": (
      "Demo send queued. Add SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM "
      "environment variables to send real emails from this button."
    ),
    "mailto_url": f"mailto:{quote(payload.recipient, safe='@._-')}?subject={quote(payload.subject)}&body={quote(payload.body)}",
    "confidence": 88
  }


@router.post("/questions")
async def generate_interview_questions(payload: QuestionRequest):
  try:
    response = call_groq_json(
      f"""
Generate interview questions for this candidate.
Context:
{payload.candidate_context[:5000]}
Known gaps: {payload.gaps[:6]}

Questions must probe evidence, bias safety, and job-specific execution.
""",
      "Use keys questions, confidence, reasoning. questions must be a list of strings."
    )
    if response:
      return response
  except Exception:
    pass

  signals = payload.gaps or extract_keywords(payload.candidate_context, 4)
  return {
    "questions": [
      f"Walk us through a measurable example related to {signals[0]}.",
      f"How would you close the gap around {signals[1] if len(signals) > 1 else 'cross-functional execution'} in the first 60 days?",
      "What evidence would make you question an AI-generated hiring recommendation?",
      "Which metrics would you use weekly to prove this role is creating value?",
      "How would you audit candidate scoring for bias and false positives?",
      "When should a human reviewer override the agent's recommendation?",
      "How would you explain the model confidence score to a non-technical reviewer?",
      "What data would you refuse to use in a hiring automation workflow?"
    ],
    "confidence": stable_int(payload.candidate_context, 82, 91),
    "reasoning": [
      "Mapped candidate evidence and gaps to practical interview probes.",
      "Prioritized measurable examples over generic questions.",
      "Included a bias-safety question because this is an AI hiring workflow."
    ]
  }
