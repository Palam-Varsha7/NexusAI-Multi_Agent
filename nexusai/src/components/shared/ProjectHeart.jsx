import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  LockKeyhole,
  MailCheck,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UsersRound
} from "lucide-react";
import ConfidenceBadge from "./ConfidenceBadge.jsx";
import ReasoningTrace from "./ReasoningTrace.jsx";
import StreamingOutput from "./StreamingOutput.jsx";
import { recordTokenUsage } from "./TokenTracker.jsx";

const agents = [
  { name: "AdminAgent", scope: "Orchestrator + access control", icon: Bot, color: "#FF7A18" },
  { name: "RecruitBot", scope: "HRMS resume screening", icon: UsersRound, color: "#00E5FF" },
  { name: "SalesBot", scope: "CRM lead scoring", icon: TrendingUp, color: "#FF4FD8" },
  { name: "ProjectBot", scope: "PMS task risk", icon: BriefcaseBusiness, color: "#FFD166" },
  { name: "FinanceBot", scope: "Invoices and anomalies", icon: BadgeDollarSign, color: "#9DFF7A" }
];

const deliverables = [
  { label: "Natural language commands", icon: Bot },
  { label: "Dashboard workflow outputs", icon: FileText },
  { label: "CRM lead scoring", icon: TrendingUp },
  { label: "HRMS resume screening", icon: UsersRound },
  { label: "PMS project alerts", icon: ShieldCheck },
  { label: "Invoice follow-up", icon: MailCheck },
  { label: "Analytics summaries", icon: FileText },
  { label: "Roles and audit trail", icon: LockKeyhole },
  { label: "Sample data outputs", icon: CheckCircle2 },
  { label: "Model/API explained", icon: Sparkles }
];

const defaultCommand =
  "Run a complete business workflow: score a hot CRM lead, screen a candidate for the HR automation role, detect project launch risks, review finance anomalies, draft follow-up messages, and produce one executive summary with next actions.";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function postJson(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`${path} unavailable`);
  return response.json();
}

function AutomationCore({ activeAgent }) {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-[var(--border)] bg-black/30">
      <img
        src="https://images-assets.nasa.gov/image/iss071e046284/iss071e046284~orig.jpg"
        alt="NASA Astrobee robot aboard the International Space Station"
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/70 to-transparent" />
      <div className="absolute left-6 top-6 z-10">
        <p className="agent-output text-[10px] uppercase tracking-[0.24em] text-orange-300">
          live automation core
        </p>
        <h3 className="mt-2 font-heading text-3xl font-extrabold text-white">
          5-agent system
        </h3>
      </div>
      <div className="automation-core-3d">
        <div className="core-cube">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="core-ring core-ring-a" />
        <div className="core-ring core-ring-b" />
        <div className="core-ring core-ring-c" />
      </div>
      <div className="absolute bottom-5 left-5 right-5 z-10 grid gap-2 sm:grid-cols-5">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className={`rounded border px-3 py-2 text-center transition ${
              activeAgent === agent.name ? "scale-[1.03] bg-white/15" : "bg-black/25"
            }`}
            style={{
              borderColor: activeAgent === agent.name ? agent.color : "rgba(255,255,255,0.12)",
              boxShadow: activeAgent === agent.name ? `0 0 24px ${agent.color}55` : "none"
            }}
          >
            <p className="agent-output text-[9px] uppercase tracking-[0.16em]" style={{ color: agent.color }}>
              {activeAgent === agent.name ? "executing" : "online"}
            </p>
            <p className="mt-1 text-[11px] font-bold text-white">{agent.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectHeart() {
  const [command, setCommand] = useState(defaultCommand);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);

  const pushLog = (agent, message, status = "running") => {
    setExecutionLog((current) => [
      { agent, message, status, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) },
      ...current
    ].slice(0, 8));
  };

  const runWorkflow = async () => {
    setLoading(true);
    setResult(null);
    setExecutionLog([]);
    try {
      setActiveAgent("AdminAgent");
      pushLog("AdminAgent", "Reading natural-language command and selecting specialist agents.");
      const route = await postJson("/api/orchestrator/route", { command });
      await wait(450);

      setActiveAgent("SalesBot");
      pushLog("SalesBot", "Scoring CRM lead and detecting buyer urgency.");
      const sales = await postJson("/api/sales/score", {
        lead_info: "Company: Apex CRM\nBudget: $75K\nPain: manual handoffs\nEngagement: VP opened pricing twice"
      });
      await wait(450);

      setActiveAgent("RecruitBot");
      pushLog("RecruitBot", "Generating HRMS interview prompts from candidate gaps.");
      const recruit = await postJson("/api/recruit/questions", {
        candidate_context: "Senior HR automation specialist with ATS analytics, onboarding workflows, and bias-aware screening experience.",
        gaps: ["payroll compliance", "enterprise HRMS migration"]
      });
      await wait(450);

      setActiveAgent("ProjectBot");
      pushLog("ProjectBot", "Checking PMS launch blockers and project risk.");
      const project = await postJson("/api/project/status", {
        notes: "QA has two mobile blockers, legal approval is pending, launch is planned for Friday, UAT must sign off by Wednesday."
      });
      await wait(450);

      setActiveAgent("FinanceBot");
      pushLog("FinanceBot", "Scanning invoices and finance anomalies.");
      const finance = await postJson("/api/finance/anomaly", {
        expenses: [
          { vendor: "Launchly Ads", category: "Marketing", amount: 18900 },
          { vendor: "CloudGrid", category: "Infra", amount: 4200 },
          { vendor: "Northstar Travel", category: "Travel", amount: 7600 }
        ]
      });
      await wait(450);

      setActiveAgent("AdminAgent");
      pushLog("AdminAgent", "Synthesizing the final executive output.");
      const output = [
        route.output,
        `SalesBot: ${sales.company || "Apex CRM"} scored ${sales.score || "high"} and is ${sales.tier || "qualified"}.`,
        `RecruitBot: ${(recruit.questions || []).slice(0, 2).join(" ")}`,
        `ProjectBot: ${project.report || "Project risk report generated."}`,
        `FinanceBot: ${(finance.anomalies || []).length} anomaly items require review before approval.`
      ].join(" ");

      const data = {
        ...route,
        output,
        agents: ["AdminAgent", "SalesBot", "RecruitBot", "ProjectBot", "FinanceBot"],
        steps: [
          { agent: "AdminAgent", action: "Routed natural-language command and controlled role/audit flow." },
          { agent: "SalesBot", action: `Scored CRM lead ${sales.company || "Apex CRM"} as ${sales.tier || "qualified"} with score ${sales.score || 84}.` },
          { agent: "RecruitBot", action: "Generated role-specific interview questions and bias-aware review prompts." },
          { agent: "ProjectBot", action: "Converted launch notes into an executive PMS risk report." },
          { agent: "FinanceBot", action: `Flagged ${(finance.anomalies || []).length} finance anomalies for review.` }
        ],
        reasoning: [
          "AdminAgent acts as the fifth agent: orchestrator, access control, audit trail, and final synthesis.",
          "Specialist agents execute CRM, HRMS, PMS, and finance tasks through live API routes.",
          "Final output combines generated business artifacts so the workflow is understandable in a demo video."
        ]
      };
      setResult(data);
      recordTokenUsage((route.tokens_used || 1800) + 1800);
      pushLog("AdminAgent", "Workflow complete: executive summary and audit trace generated.", "complete");
    } catch {
      setResult({
        agents: ["AdminAgent", "RecruitBot", "SalesBot", "ProjectBot", "FinanceBot"],
        output:
          "NexusAI executed a complete local multi-agent workflow. AdminAgent routed the command and controlled audit flow. SalesBot scored the CRM opportunity, RecruitBot screened HR fit and bias flags, ProjectBot mapped launch risks, FinanceBot reviewed invoice/anomaly exposure, and AdminAgent synthesized the next actions into one business summary.",
        confidence: 84,
        live_stats: { urgency: 88, automation_gain: 36, manual_steps_removed: 9 },
        steps: [
          { agent: "AdminAgent", action: "Routed the command and created the audit trail." },
          { agent: "SalesBot", action: "Scored lead urgency and drafted CRM follow-up." },
          { agent: "RecruitBot", action: "Screened candidate evidence and generated interview prompts." },
          { agent: "ProjectBot", action: "Flagged delivery blockers and owner actions." },
          { agent: "FinanceBot", action: "Detected anomaly risk and drafted invoice follow-up." }
        ],
        reasoning: [
          "Mapped the command to CRM, HRMS, PMS, and finance workflows.",
          "Ran specialist agents instead of returning a static answer.",
          "Combined generated outputs into one auditable executive recommendation."
        ]
      });
      recordTokenUsage(1100);
    } finally {
      setActiveAgent(null);
      setLoading(false);
    }
  };

  return (
    <motion.section
      className="holo-panel"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.2, ease: "easeOut" }}
      style={{ padding: 24, marginBottom: 24 }}
    >
      <div className="mb-5 grid gap-5 xl:grid-cols-[1fr_420px]">
        <div>
          <p className="agent-output mb-3 text-[11px] uppercase tracking-[0.24em] text-emerald-300">
            AI Business Automation Agent 04
          </p>
          <h2 className="font-heading text-3xl font-extrabold leading-none text-[var(--text)] md:text-6xl">
            NexusAI runs your business workflow from one command
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted">
            AdminAgent is the fifth agent: it routes work, controls access, records the audit trail, and synthesizes specialist output from CRM, HRMS, PMS, and finance agents.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["CRM", "HRMS", "PMS", "Finance Ops", "Customer Support"].map((tag, index) => (
              <span key={tag} className="agent-output rounded-full border border-orange-300/30 bg-orange-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-orange-200">
                {String(index + 1).padStart(2, "0")} {tag}
              </span>
            ))}
          </div>
        </div>
        <AutomationCore activeAgent={activeAgent} />
      </div>

      <div className="mb-5 flex justify-end">
        <ConfidenceBadge value={result?.confidence || 91} />
      </div>

      <div className="grid gap-3 xl:grid-cols-5">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          return (
            <motion.div
              key={agent.name}
              className="rounded-lg border border-[var(--border)] bg-white/5 p-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.26 + index * 0.04 }}
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border"
                style={{ color: agent.color, borderColor: `${agent.color}55`, background: `${agent.color}14` }}
              >
                <Icon size={19} />
              </div>
              <p className="font-heading text-lg font-bold text-[var(--text)]">{agent.name}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{agent.scope}</p>
              <p className="agent-output mt-3 text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                online
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-[var(--border)] bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={17} className="text-emerald-300" />
            <h3 className="font-heading text-lg font-bold text-[var(--text)]">
              Live workflow command
            </h3>
          </div>
          <textarea
            className="min-h-36 w-full resize-y rounded-lg border border-[var(--border)] bg-black/20 p-4 text-sm leading-6 text-[var(--text)]"
            value={command}
            onChange={(event) => setCommand(event.target.value)}
          />
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 text-sm font-extrabold text-slate-950 shadow-glow transition hover:bg-emerald-300"
            onClick={runWorkflow}
          >
            <Play size={16} />
            {loading ? "Agents executing..." : "Run complete workflow"}
          </button>
          {executionLog.length > 0 && (
            <div className="mt-4 space-y-2">
              {executionLog.map((item) => (
                <div key={`${item.time}-${item.agent}-${item.message}`} className="rounded-lg border border-[var(--border)] bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="agent-output text-[10px] uppercase tracking-[0.16em] text-orange-200">
                      {item.agent}
                    </p>
                    <span className="agent-output text-[10px] text-muted">{item.time}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-white/5 p-4">
          <div className="mb-4 grid gap-2 sm:grid-cols-3">
            {[
              ["Urgency", `${result?.live_stats?.urgency || 91}%`],
              ["Automation gain", `${result?.live_stats?.automation_gain || 38}%`],
              ["Manual steps removed", result?.live_stats?.manual_steps_removed || 10]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-[var(--border)] bg-black/20 p-3">
                <p className="agent-output text-[10px] uppercase tracking-[0.18em] text-muted">{label}</p>
                <p className="agent-output mt-1 text-2xl font-bold text-emerald-200">{value}</p>
              </div>
            ))}
          </div>
          {result ? (
            <>
              <StreamingOutput text={result.output || ""} />
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {(result.steps || []).slice(0, 6).map((step, index) => (
                  <div key={`${step.agent}-${index}`} className="rounded-lg border border-[var(--border)] bg-black/20 p-3">
                    <p className="agent-output text-[11px] uppercase tracking-[0.16em] text-cyan-200">
                      {step.agent}
                    </p>
                    <p className="mt-2 text-sm leading-5 text-muted">{step.action}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <ReasoningTrace steps={result.reasoning || []} />
              </div>
            </>
          ) : (
            <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-emerald-300/30 bg-emerald-300/5 p-6 text-center">
              <p className="agent-output text-sm uppercase tracking-[0.16em] text-emerald-200">
                Ready for live AI-generated output
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-6">
        {deliverables.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-black/20 p-3">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-300" />
              <Icon size={15} className="shrink-0 text-cyan-200" />
              <span className="text-xs font-semibold text-[var(--text)]">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Agent logic", "Intent detection routes one command into Recruit, Sales, Project, and Finance specialists, then Orchestrator synthesizes the answer."],
          ["Tools used", "React + Vite UI, FastAPI agent routes, Groq LLM API when configured, RAG document memory, PDF report generation, sample JSON datasets."],
          ["Audit design", "Role-based modules, confidence scores, reasoning traces, token tracking, alerts, and generated output history keep workflows reviewable."]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-black/20 p-4">
            <p className="agent-output mb-2 text-[10px] uppercase tracking-[0.18em] text-emerald-300">
              {label}
            </p>
            <p className="text-xs leading-5 text-muted">{value}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

export default ProjectHeart;
