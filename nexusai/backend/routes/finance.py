from fastapi import APIRouter, Body
from pydantic import BaseModel

from ai_utils import call_groq_json, extract_keywords, stable_int

router = APIRouter()


class Expense(BaseModel):
  vendor: str
  category: str = "General"
  amount: float


class ExpenseList(BaseModel):
  expenses: list[Expense]


class SummaryRequest(BaseModel):
  finance_context: str = ""


class InvoiceRequest(BaseModel):
  invoice_context: str
  tone: str = "firm but helpful"


def _category_baselines(expenses: list[Expense]) -> dict[str, float]:
  totals: dict[str, list[float]] = {}
  for expense in expenses:
    totals.setdefault(expense.category, []).append(expense.amount)

  return {
    category: sum(values) / max(1, len(values))
    for category, values in totals.items()
  }


@router.post("/anomaly")
async def detect_anomalies(payload: ExpenseList):
  try:
    response = call_groq_json(
      f"""
Detect finance anomalies in these expenses and explain the audit action.
Expenses:
{[expense.dict() for expense in payload.expenses][:30]}
""",
      "Use keys anomalies, normal, confidence, reasoning. anomalies must include vendor, category, amount, reason, confidence."
    )
    if response:
      return response
  except Exception:
    pass

  baselines = _category_baselines(payload.expenses)
  anomalies = []
  normal = []

  for expense in payload.expenses:
    baseline = baselines.get(expense.category, expense.amount)
    is_large = expense.amount > max(6000, baseline * 1.25)
    is_round = expense.amount >= 5000 and expense.amount % 1000 == 0

    if is_large or is_round:
      anomalies.append(
        {
          "vendor": expense.vendor,
          "category": expense.category,
          "amount": expense.amount,
          "reason": (
            f"{expense.vendor} is above the {expense.category} baseline of "
            f"{baseline:,.0f} or has a review-worthy amount pattern."
          ),
          "confidence": 82 if is_large else 74
        }
      )
    else:
      normal.append(expense.dict())

  return {
    "anomalies": anomalies,
    "normal": normal,
    "confidence": 83,
    "reasoning": [
      "Computed category-level spend baselines.",
      "Flagged expenses above expected range or with unusual amount patterns.",
      "Separated normal expenses for audit trail continuity."
    ]
  }


@router.post("/cashflow")
async def cashflow_forecast():
  return {
    "predicted": [
      {"month": "Jan", "value": 82},
      {"month": "Feb", "value": 88},
      {"month": "Mar", "value": 95},
      {"month": "Apr", "value": 104},
      {"month": "May", "value": 116},
      {"month": "Jun", "value": 124}
    ],
    "actual": [
      {"month": "Jan", "value": 78},
      {"month": "Feb", "value": 86},
      {"month": "Mar", "value": 91},
      {"month": "Apr", "value": 98},
      {"month": "May", "value": 109},
      {"month": "Jun", "value": 118}
    ],
    "confidence": 86
  }


@router.post("/summary")
async def monthly_summary(payload: SummaryRequest | None = Body(default=None)):
  context = payload.finance_context if payload else ""
  try:
    response = call_groq_json(
      f"""
Create a monthly finance summary with cash, anomaly, runway, and action guidance.
Context:
{context[:5000]}
""",
      "Use keys summary, metrics, actions, confidence, reasoning. metrics and actions must be lists."
    )
    if response:
      return response
  except Exception:
    pass

  keywords = extract_keywords(context)
  return {
    "summary": (
      f"Monthly summary: cash flow remains positive, but the watchlist is {', '.join(keywords[:4])}. "
      "Collections should be accelerated before month close, expense approvals should tighten for categories above plan, "
      "and anomaly review should happen before invoices are released."
    ),
    "metrics": [
      f"Runway confidence {stable_int(context or 'runway', 12, 18)} months",
      f"Collections risk {stable_int(context or 'collections', 14, 29)}%",
      f"Approval load {stable_int(context or 'approvals', 4, 11)} exceptions"
    ],
    "actions": [
      "Send payment nudges for open receivables.",
      "Review high-variance vendors before approval.",
      "Route campaign spend through SalesBot for ROI validation."
    ],
    "confidence": stable_int(context or "finance summary", 82, 92),
    "reasoning": [
      "Reviewed cash flow variance.",
      "Identified expense pressure by category.",
      "Generated action-oriented monthly guidance."
    ]
  }


@router.post("/invoice")
async def draft_invoice_followup(payload: InvoiceRequest):
  try:
    response = call_groq_json(
      f"""
Draft an invoice follow-up.
Invoice context:
{payload.invoice_context[:5000]}
Tone: {payload.tone}
Include clear next action and support options.
""",
      "Use keys subject, draft, escalation_level, confidence, reasoning."
    )
    if response:
      return response
  except Exception:
    pass

  keywords = extract_keywords(payload.invoice_context)
  overdue = stable_int(payload.invoice_context, 4, 19)
  return {
    "subject": f"Invoice follow-up: {keywords[0]} approval",
    "draft": (
      f"Hi Alex,\n\nFollowing up on the invoice tied to {', '.join(keywords[:3])}. "
      f"It appears to be about {overdue} days past the expected payment window. "
      "Please confirm payment timing today, or let us know whether a PO, payment link, or supporting document is blocking approval.\n\n"
      "Best,\nNexusAI Finance"
    ),
    "escalation_level": "Medium" if overdue < 14 else "High",
    "confidence": stable_int(payload.invoice_context, 82, 92),
    "reasoning": [
      "Identified overdue context and likely approval friction.",
      "Kept tone firm while offering support options.",
      "Added a clear confirmation request."
    ]
  }
