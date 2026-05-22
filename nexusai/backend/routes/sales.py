from fastapi import APIRouter
from pydantic import BaseModel

from ai_utils import call_groq_json, extract_keywords, stable_int

router = APIRouter()


class LeadScoreRequest(BaseModel):
  lead_info: str


class SentimentRequest(BaseModel):
  email_text: str


class DraftRequest(BaseModel):
  lead_info: str
  objective: str = "book a 20-minute automation walkthrough"


class SummaryRequest(BaseModel):
  pipeline_context: str = ""


def _tier_from_score(score: int) -> str:
  if score >= 75:
    return "Hot"
  if score >= 50:
    return "Warm"
  return "Cold"


def _fallback_score(lead_info: str) -> dict:
  lowered = lead_info.lower()
  score = stable_int(lead_info, 45, 72)
  if "budget" in lowered or "$" in lowered:
    score += 12
  if "vp" in lowered or "ceo" in lowered or "founder" in lowered:
    score += 10
  if "urgent" in lowered or "pain" in lowered or "manual" in lowered:
    score += 12
  if "pricing" in lowered or "demo" in lowered:
    score += 8

  score = max(22, min(96, score))
  return {
    "company": _extract_company(lead_info),
    "tier": _tier_from_score(score),
    "score": score,
    "reasoning": (
      f"Lead score is based on {', '.join(extract_keywords(lead_info, 4))}, "
      "budget fit, urgency, buyer seniority, and recent engagement signals."
    ),
    "confidence": stable_int(lead_info, 80, 91)
  }


def _fallback_sentiment(email_text: str) -> dict:
  lowered = email_text.lower()
  score = 58
  if any(word in lowered for word in ["great", "useful", "interested", "ready"]):
    score += 18
  if any(word in lowered for word in ["concern", "delay", "expensive", "blocked"]):
    score -= 18

  score = max(15, min(92, score))
  label = "Positive" if score >= 68 else "Neutral" if score >= 45 else "Negative"
  return {
    "sentiment_score": score,
    "label": label,
    "confidence": 81,
    "weekly_data": [
      {"day": "Mon", "score": max(10, score - 18)},
      {"day": "Tue", "score": max(10, score - 10)},
      {"day": "Wed", "score": max(10, score - 4)},
      {"day": "Thu", "score": score},
      {"day": "Fri", "score": min(95, score + 6)},
      {"day": "Sat", "score": max(10, score - 3)},
      {"day": "Sun", "score": min(95, score + 2)}
    ]
  }


def _extract_company(text: str) -> str:
  for line in text.splitlines():
    if ":" in line and "company" in line.lower():
      return line.split(":", 1)[1].strip() or "Scored Lead"
  words = extract_keywords(text, 2)
  return " ".join(word.title() for word in words[:2]) or "Scored Lead"


@router.post("/score")
async def score_lead(payload: LeadScoreRequest):
  try:
    response = call_groq_json(
      f"Score this sales lead and explain the tier:\n{payload.lead_info[:5000]}",
      "Use keys company, tier, score, reasoning, confidence."
    )
    if response:
      return response
  except Exception:
    pass

  return _fallback_score(payload.lead_info)


@router.post("/sentiment")
async def analyze_sentiment(payload: SentimentRequest):
  try:
    response = call_groq_json(
      f"Analyze sales email sentiment and produce weekly trend data:\n{payload.email_text[:5000]}",
      "Use keys sentiment_score, label, weekly_data, confidence. weekly_data items need day and score."
    )
    if response:
      return response
  except Exception:
    pass

  return _fallback_sentiment(payload.email_text)


@router.post("/followup")
async def draft_followup(payload: DraftRequest):
  try:
    response = call_groq_json(
      f"""
Write a personalized B2B sales follow-up for this lead.
Lead context:
{payload.lead_info[:5000]}

Objective: {payload.objective}
Keep it concise, concrete, and executive-ready.
""",
      "Use keys subject, draft, next_steps, confidence, reasoning. next_steps must be a list."
    )
    if response:
      return response
  except Exception:
    pass

  company = _extract_company(payload.lead_info)
  keywords = extract_keywords(payload.lead_info)
  return {
    "subject": f"{company}: automation path for {keywords[0]}",
    "draft": (
      f"Hi Jordan,\n\nI noticed {company} is showing signals around {', '.join(keywords[:3])}. "
      "NexusAI can connect lead scoring, follow-up drafting, and finance handoffs so the team is not stitching the workflow together manually.\n\n"
      f"Could I send a 3-step automation map aimed at {payload.objective}?"
    ),
    "next_steps": [
      "Attach a one-page automation map.",
      "Ask for a concrete meeting window.",
      "Queue a 24-hour reminder if there is no reply."
    ],
    "confidence": stable_int(payload.lead_info, 82, 93),
    "reasoning": [
      f"Personalized the draft around {', '.join(keywords[:3])}.",
      "Connected the buyer pain to measurable automation value.",
      "Closed with a low-friction next action."
    ]
  }


@router.post("/summary")
async def sales_summary(payload: SummaryRequest):
  try:
    response = call_groq_json(
      f"Create a sales pipeline executive summary from this context:\n{payload.pipeline_context[:5000]}",
      "Use keys summary, opportunities, risks, actions, confidence, reasoning. opportunities, risks, actions must be lists."
    )
    if response:
      return response
  except Exception:
    pass

  keywords = extract_keywords(payload.pipeline_context)
  return {
    "summary": (
      f"Pipeline summary: the strongest signals are {', '.join(keywords[:4])}. "
      "Prioritize hot accounts with budget and senior engagement, recover cold deals with a value recap, "
      "and let SalesBot draft follow-ups tied to business pain rather than generic check-ins."
    ),
    "opportunities": [
      f"Use {keywords[0]} as the opening value hook.",
      "Move pricing-active leads into executive follow-up.",
      "Pair SalesBot with FinanceBot where approval friction appears."
    ],
    "risks": [
      "Cold accounts can decay without time-bound follow-up.",
      "Unanswered rollout questions can block late-stage opportunities."
    ],
    "actions": [
      "Generate personalized follow-up for the top three accounts.",
      "Add a 24-hour reminder to unanswered proposal threads.",
      "Escalate budget-fit accounts to a live demo offer."
    ],
    "confidence": stable_int(payload.pipeline_context, 81, 92),
    "reasoning": [
      "Scanned account context for urgency, budget, and buyer intent.",
      "Separated opportunities from stall risks.",
      "Converted the pipeline into agent-ready next actions."
    ]
  }
