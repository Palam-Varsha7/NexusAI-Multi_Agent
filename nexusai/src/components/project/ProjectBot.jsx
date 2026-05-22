import React from 'react'
import { useState } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarRange, GitBranch, Sparkles, ClipboardList } from "lucide-react";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";
import SkeletonCard from "../shared/SkeletonCard.jsx";
import StreamingOutput from "../shared/StreamingOutput.jsx";
import { useNexusAI } from "../../context/NexusAIContext.jsx";
import GanttChart from "./GanttChart.jsx";
import KanbanBoard from "./KanbanBoard.jsx";
import StatusReport from "./StatusReport.jsx";

const seedTasks = [
  {
    id: "t1",
    title: "Define launch scope",
    owner: "Priya",
    deadline: "May 24",
    start: "2026-05-21",
    end: "2026-05-24",
    status: "Done",
    risk: "Low",
    priority: "P1",
    overdue: false
  },
  {
    id: "t2",
    title: "Finalize vendor API",
    owner: "Marcus",
    deadline: "May 26",
    start: "2026-05-23",
    end: "2026-05-26",
    status: "In Progress",
    risk: "Medium",
    priority: "P1",
    overdue: false
  },
  {
    id: "t3",
    title: "Resolve mobile QA defects",
    owner: "Aisha",
    deadline: "May 20",
    start: "2026-05-19",
    end: "2026-05-22",
    status: "Review",
    risk: "High",
    priority: "P1",
    overdue: true
  },
  {
    id: "t4",
    title: "Prepare customer rollout comms",
    owner: "Dev",
    deadline: "May 28",
    start: "2026-05-25",
    end: "2026-05-28",
    status: "To Do",
    risk: "Low",
    priority: "P2",
    overdue: false
  }
];

function normalizeTasks(tasks = []) {
  return tasks.map((task, index) => ({
    id: task.id || `task-${index}`,
    title: task.title || `Task ${index + 1}`,
    owner: task.owner || "Unassigned",
    deadline: task.deadline || "TBD",
    start: task.start || "2026-05-21",
    end: task.end || "2026-05-28",
    status: task.status || ["To Do", "In Progress", "Review", "Done"][index % 4],
    risk: task.risk || "Medium",
    priority: task.priority || `P${Math.min(3, index + 1)}`,
    overdue: Boolean(task.overdue)
  }));
}

function ProjectBot({ role }) {
  const { addAlert } = useNexusAI();
  const [goal, setGoal] = useState(
    "Launch a client onboarding automation in two weeks with engineering, legal, QA, and customer success coordination."
  );
  const [tasks, setTasks] = useState([]);
  const [risks, setRisks] = useState([
    "Vendor API review could delay QA.",
    "Legal approval is on the critical path."
  ]);
  const [confidence, setConfidence] = useState(86);
  const [view, setView] = useState("kanban");
  const [summary, setSummary] = useState(
    "Project plan generated with four workstreams, P1 launch blockers, and a Friday decision point."
  );
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadTasks = async () => {
      setLoading(true);
      try {
        const response = await fetch("/sample-data/tasks.json");
        const data = normalizeTasks(await response.json());
        if (!active) return;
        setTasks(data);
        const overdue = data.filter((task) => task.overdue);
        setRisks(overdue.slice(0, 4).map((task) => `${task.title} is overdue and owned by ${task.owner}.`));
        overdue.forEach((task) =>
          addAlert({
            id: `project-overdue-${task.id}`,
            title: "Overdue task detected",
            message: `${task.title} is overdue. ProjectBot recommends immediate owner follow-up.`,
            agent: "Project",
            module: "project",
            confidence: 84
          })
        );
      } catch {
        if (active) setTasks(seedTasks);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTasks();
    return () => {
      active = false;
    };
  }, [addAlert]);

  const generatePlan = async () => {
    setApiLoading(true);
    try {
      const response = await fetch("/api/project/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal })
      });

      if (!response.ok) throw new Error("Project plan API unavailable");
      const data = await response.json();
      setTasks(normalizeTasks(data.tasks));
      setRisks(data.risks || []);
      setConfidence(data.confidence || 84);
      setSummary(
        `Generated ${data.tasks?.length || 0} tasks with ${data.risks?.length || 0} active risks and auto-prioritized delivery ownership.`
      );
    } catch {
      setTasks(seedTasks);
      setRisks([
        "Vendor dependency has schedule impact.",
        "QA and legal approvals need named owners."
      ]);
      setConfidence(82);
      setSummary(
        "Fallback plan generated with prioritized tasks, owners, deadlines, and risk handling."
      );
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col justify-between gap-4 md:flex-row md:items-end"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
      >
        <div>
          <p className="agent-output mb-3 text-xs uppercase tracking-[0.24em] text-blue-300">
            Project agent
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-normal text-[var(--text)] md:text-5xl">
            Delivery intelligence
          </h1>
        </div>
        <ConfidenceBadge value={confidence} />
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <motion.section
          className="glass-card hover-lift rounded-lg p-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.06, ease: "easeOut" }}
          whileHover={{ y: -2 }}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15 text-blue-200">
              <GitBranch size={20} />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-normal text-[var(--text)]">
                Plan from goal
              </h2>
              <p className="text-sm text-muted">Natural language to tasks, owners, dates, and risks</p>
            </div>
          </div>
          <textarea
            className="min-h-44 w-full resize-y rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm leading-6 text-[var(--text)]"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          />
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-400"
            onClick={generatePlan}
          >
            <Sparkles size={17} />
            {apiLoading ? "Planning..." : "Generate plan"}
          </button>
        </motion.section>

        <motion.section
          className="glass-card hover-lift rounded-lg p-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.12, ease: "easeOut" }}
          whileHover={{ y: -2 }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="agent-output mb-2 text-[11px] uppercase tracking-[0.18em] text-blue-300">
                Agent plan
              </p>
              <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
                Delivery summary
              </h3>
              <p className="mt-1 text-xs text-muted">{role?.title || "PM"} workspace</p>
            </div>
            <CalendarRange size={19} className="text-orange-300" />
          </div>
          <StreamingOutput text={summary} />
          <div className="mt-4">
            <ReasoningTrace
              steps={[
                "Translated project goal into workstreams and concrete task cards.",
                "Assigned owners and priorities by dependency pressure.",
                "Flagged overdue and high-risk items for immediate attention."
              ]}
            />
          </div>
        </motion.section>
      </div>

      <motion.section
        className="glass-card rounded-lg p-5"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.18, ease: "easeOut" }}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="agent-output mb-2 text-[11px] uppercase tracking-[0.18em] text-blue-300">
              Risk queue
            </p>
            <h3 className="font-heading text-2xl font-bold tracking-normal text-[var(--text)]">
              Active risks
            </h3>
          </div>
          <div className="flex rounded-lg border border-[var(--border)] bg-white/5 p-1">
            {["kanban", "gantt"].map((option) => (
              <button
                key={option}
                type="button"
                className={`rounded-md px-4 py-2 text-sm font-bold capitalize ${
                  view === option
                    ? "bg-blue-500 text-white shadow-glow"
                    : "text-muted hover:text-[var(--text)]"
                }`}
                onClick={() => setView(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        {loading && <SkeletonCard lines={3} />}
        {!loading && !risks.length && (
          <EmptyState icon={ClipboardList} text="No project risks detected." />
        )}
        {!loading && risks.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {risks.map((risk, index) => (
            <motion.div
              key={risk}
              className="rounded-lg border border-orange-400/40 bg-orange-500/10 p-4 text-sm leading-6 text-orange-100"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.34,
                delay: index * 0.06,
                ease: "easeOut"
              }}
            >
              {risk}
            </motion.div>
          ))}
        </div>
        )}
      </motion.section>

      {loading && <SkeletonCard lines={6} />}
      {!loading && !tasks.length && (
        <EmptyState icon={ClipboardList} text="No project tasks available." />
      )}
      {!loading && tasks.length > 0 && (
        view === "kanban" ? <KanbanBoard tasks={tasks} /> : <GanttChart tasks={tasks} />
      )}

      <StatusReport />
    </div>
  );
}

export default ProjectBot;

