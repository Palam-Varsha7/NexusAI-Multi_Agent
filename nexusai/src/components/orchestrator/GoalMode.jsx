import React from 'react'
import { useState } from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";
import StreamingOutput from "../shared/StreamingOutput.jsx";
import { recordTokenUsage } from "../shared/TokenTracker.jsx";

function GoalMode({ onLog }) {
  const [goal, setGoal] = useState(
    "Improve monthly revenue operations by reducing hiring bottlenecks, warming sales leads, de-risking launch, and controlling spend."
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeGoal = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orchestrator/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal })
      });
      if (!response.ok) throw new Error("Goal API unavailable");
      const data = await response.json();
      setResult(data);
      onLog?.("Orchestrator", "Executed multi-agent goal mode.");
      recordTokenUsage(data.tokens_used || 2400);
    } catch {
      const fallback = {
        progress: 76,
        subtasks: [
          "RecruitBot screens urgent hiring roles.",
          "SalesBot prioritizes warm pipeline follow-ups.",
          "ProjectBot isolates delivery blockers.",
          "FinanceBot reviews spend anomalies."
        ],
        report:
          "Goal progress is 76%. NexusAI sequenced recruiting, sales, project, and finance workstreams and found the fastest path is hiring support plus launch-risk cleanup.",
        confidence: 84,
        reasoning: [
          "Split the high-level goal by operating domain.",
          "Sequenced subtasks by dependency and urgency.",
          "Synthesized progress from completed agent actions."
        ]
      };
      setResult(fallback);
      onLog?.("Orchestrator", "Executed fallback goal mode.");
      recordTokenUsage(1100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      className="glass-card hover-lift rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.18, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-200">
            <Target size={18} />
          </span>
          <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
            Goal mode
          </h3>
        </div>
        {result && <ConfidenceBadge value={result.confidence || 84} />}
      </div>
      <textarea
        className="min-h-28 w-full resize-y rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm leading-6 text-[var(--text)]"
        value={goal}
        onChange={(event) => setGoal(event.target.value)}
      />
      <button
        type="button"
        className="mt-4 rounded-lg bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-400"
        onClick={executeGoal}
      >
        {loading ? "Executing..." : "Execute goal"}
      </button>

      {result && (
        <div className="mt-4 space-y-4">
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${result.progress || 0}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {(result.subtasks || []).map((task) => (
              <div
                key={task}
                className="rounded-lg border border-[var(--border)] bg-white/5 p-3 text-sm text-muted"
              >
                {task}
              </div>
            ))}
          </div>
          <StreamingOutput text={result.report || ""} />
          <ReasoningTrace steps={result.reasoning || []} />
        </div>
      )}
    </motion.section>
  );
}

export default GoalMode;

