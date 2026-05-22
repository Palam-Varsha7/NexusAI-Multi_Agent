import json
import random
from datetime import date, timedelta
from pathlib import Path

from faker import Faker

fake = Faker()
random.seed(42)
Faker.seed(42)

ROOT = Path(__file__).resolve().parents[2]
SAMPLE_DIR = ROOT / "public" / "sample-data"
SAMPLE_DIR.mkdir(parents=True, exist_ok=True)


def write_json(filename: str, rows: list[dict]) -> None:
  target = SAMPLE_DIR / filename
  target.write_text(json.dumps(rows, indent=2), encoding="utf-8")


def resumes() -> list[dict]:
  skill_pool = [
    "ATS automation",
    "onboarding",
    "HR analytics",
    "workflow design",
    "compliance",
    "candidate screening",
    "HRIS",
    "SQL",
    "reporting",
    "change management"
  ]
  rows = []
  for index in range(20):
    score = random.randint(35, 96)
    if index in (6, 14):
      score = random.randint(28, 39)
    rows.append(
      {
        "name": fake.name(),
        "skills": random.sample(skill_pool, k=random.randint(3, 5)),
        "experience": random.randint(1, 10),
        "score": score
      }
    )
  return rows


def leads() -> list[dict]:
  sentiments = ["Hot", "Warm", "Cold"]
  rows = []
  for index in range(15):
    sentiment = random.choices(sentiments, weights=[4, 7, 4], k=1)[0]
    if index in (1, 3, 8):
      sentiment = "Cold"
    rows.append(
      {
        "company": fake.company(),
        "contact": fake.name(),
        "deal_size": random.randrange(35000, 155000, 1000),
        "sentiment": sentiment
      }
    )
  return rows


def tasks() -> list[dict]:
  statuses = ["To Do", "In Progress", "Review", "Done"]
  risks = ["Low", "Medium", "High"]
  owners = [fake.first_name() for _ in range(10)]
  today = date.today()
  rows = []
  for index in range(25):
    start = today + timedelta(days=random.randint(-4, 8))
    end = start + timedelta(days=random.randint(1, 5))
    overdue = end < today and random.random() > 0.35
    rows.append(
      {
        "id": f"task-{index + 1}",
        "title": fake.catch_phrase(),
        "owner": random.choice(owners),
        "deadline": end.strftime("%b %d"),
        "start": start.isoformat(),
        "end": end.isoformat(),
        "status": random.choice(statuses),
        "risk": "High" if overdue else random.choice(risks),
        "priority": f"P{random.randint(1, 3)}",
        "overdue": overdue
      }
    )
  return rows


def invoices() -> list[dict]:
  categories = ["Infra", "Marketing", "Travel", "Legal", "Software", "Sales", "Office"]
  rows = []
  today = date.today().replace(day=1)
  for index in range(30):
    category = random.choice(categories)
    amount = random.randrange(600, 12000, 100)
    anomaly = amount > 8000 or (category in {"Marketing", "Travel"} and amount > 6500)
    if index in (1, 9, 22):
      anomaly = True
      amount = random.randrange(14000, 26000, 500)
    rows.append(
      {
        "category": category,
        "amount": amount,
        "date": (today + timedelta(days=index)).isoformat(),
        "anomaly": anomaly,
        "vendor": fake.company()
      }
    )
  return rows


def main() -> None:
  write_json("resumes.json", resumes())
  write_json("leads.json", leads())
  write_json("tasks.json", tasks())
  write_json("invoices.json", invoices())
  print(f"Sample data written to {SAMPLE_DIR}")


if __name__ == "__main__":
  main()
