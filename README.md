# 🤖 NexusAI — Multi-Agent AI Business Automation Platform
> 👩‍💻 Built By
> Palam Varsha
> 
> [Passionate about AI, Full-Stack Development & Business Automation]

---

 Submitted for the "**Indian Servers Tech Contest**"
 
 Special thanks to  
 Sai Satish Sir — Founder & CEO of Indian Servers, Cybersecurity Expert & Microsoft Security Researcher, for inspiring innovation and technology-driven solutions 🇮🇳

---

## 💡 What is NexusAI?

NexusAI is a full-stack multi-agent AI platform that automates
core business operations through intelligent, specialized agents.

From closing sales leads to screening resumes, detecting financial
anomalies to managing project timelines — NexusAI handles it all
through a unified AI-powered dashboard.

Powered by **Groq LLM + LangChain + FAISS**, with a
**React + FastAPI** full-stack architecture.

> ⚠️ Demo project with sample data — not connected to live systems.

---

# 🛠️ Tech Stack

## Frontend
| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI Framework |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Recharts | Data Visualization |
| Lucide React | Icons |

## Backend
| Tool | Purpose |
|------|---------|
| FastAPI + Uvicorn | REST API Server |
| Groq | LLM Inference |
| LangChain | AI Agent Orchestration |
| FAISS (CPU) | Vector Search for RAG |
| pdfplumber | PDF Parsing |
| ReportLab | PDF Generation |
| Faker | Sample Data |

---

# 🤖 Agent Modules

## 🧠 Orchestrator
Central intelligence system coordinating all AI agents.
- AgentDebate
- OrchestratorBot
- MemoryTimeline
- ActivityFeed

## 💼 Sales Automation
Lead qualification, sentiment analysis & follow-up drafting.
- SalesBot
- LeadCard
- SentimentHeatmap
- FollowUpDrafter

## 🧑‍💼 Recruitment Automation
Resume screening & hiring pipeline management.
- RecruitBot
- CandidateCard
- PipelineBoard
- ScoreRing

## 💰 Finance Automation
Budget tracking, anomaly detection & invoice generation.
- FinanceBot
- BudgetChart
- CashFlowChart
- InvoiceDrafter

## 📋 Project Management
Sprint planning, task tracking & status reporting.
- ProjectBot
- KanbanBoard
- GanttChart
- RiskBadge

## 📄 RAG — Document Intelligence
Upload documents and receive AI-generated cited answers.
- DocUpload
- CitedResponse
- FAISS + LangChain Retrieval

---

# ⚙️ Run Locally

## Frontend
```bash
cd nexusai
npm install
npm run dev

Backend

cd nexusai/backend
pip install -r requirements.txt
uvicorn main:app --reload


---

📁 Project Structure

nexusai/
├── backend/
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   └── pages/
└── public/
    └── sample-data/


---
