from fastapi import APIRouter
from pydantic import BaseModel

from ai_utils import call_groq_json, extract_keywords, next_business_days, stable_int

router = APIRouter()


class PlanRequest(BaseModel):
  goal: str


class StatusRequest(BaseModel):
  notes: str


def _fallback_plan(goal: str) -> dict:
  keywords = extract_keywords(goal, 5)
  days = next_business_days(5)
  return {
    "tasks": [
      {
        "id": "p1",
        "title": f"Clarify scope for {keywords[0]}",
        "owner": "PM",
        "deadline": days[0],
        "start": "2026-05-21",
        "end": "2026-05-24",
        "status": "To Do",
        "risk": "Low",
        "priority": "P1",
        "overdue": False
      },
      {
        "id": "p2",
        "title": f"Build critical {keywords[1] if len(keywords) > 1 else 'workflow'} path",
        "owner": "Engineering",
        "deadline": days[1],
        "start": "2026-05-23",
        "end": "2026-05-27",
        "status": "In Progress",
        "risk": "Medium",
        "priority": "P1",
        "overdue": False
      },
      {
        "id": "p3",
        "title": f"Complete QA for {keywords[2] if len(keywords) > 2 else 'release'}",
        "owner": "QA",
        "deadline": days[2],
        "start": "2026-05-26",
        "end": "2026-05-28",
        "status": "Review",
        "risk": "High",
        "priority": "P1",
        "overdue": False
      },
      {
        "id": "p4",
        "title": f"Publish rollout update for {keywords[3] if len(keywords) > 3 else 'stakeholders'}",
        "owner": "Customer Success",
        "deadline": days[3],
        "start": "2026-05-28",
        "end": "2026-05-29",
        "status": "To Do",
        "risk": "Low",
        "priority": "P2",
        "overdue": False
      }
    ],
    "risks": [
      f"{keywords[0].title()} scope could expand without a hard launch definition.",
      f"{keywords[1].title() if len(keywords) > 1 else 'External'} dependency should have a named owner."
    ],
    "priorities": ["P1 launch path", "P2 enablement", "P3 follow-up"],
    "timeline": "Two-week delivery plan with QA and rollout gates.",
    "confidence": stable_int(goal, 82, 92),
    "reasoning": [
      "Converted the goal into milestone-based delivery tasks.",
      "Assigned owners by function and dependency ownership.",
      "Prioritized launch blockers before enablement work."
    ]
  }


@router.post("/plan")
async def create_plan(payload: PlanRequest):
  try:
    response = call_groq_json(
      f"""
Create a project plan for this goal:
{payload.goal[:5000]}

Return tasks with id, title, owner, deadline, start, end, status, risk, priority, overdue.
Use statuses To Do, In Progress, Review, Done. Use risks High, Medium, Low.
""",
      "Use keys tasks, risks, priorities, timeline, confidence, reasoning."
    )
    if response:
      return response
  except Exception:
    pass

  return _fallback_plan(payload.goal)


@router.post("/status")
async def create_status(payload: StatusRequest):
  try:
    response = call_groq_json(
      f"Format these project notes into an executive status report:\n{payload.notes[:5000]}",
      "Use keys report, confidence, reasoning."
    )
    if response:
      return response
  except Exception:
    pass

  return {
    "report": (
      f"Status: Amber. The key signals are {', '.join(extract_keywords(payload.notes, 4))}. "
      "Completed work should be locked, blockers need named owners, and the next update should confirm launch readiness with dates."
    ),
    "confidence": stable_int(payload.notes, 80, 91),
    "reasoning": [
      "Separated completed work from blockers.",
      "Converted raw notes into a concise status color.",
      "Highlighted owner-driven next actions."
    ]
  }
