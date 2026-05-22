import React from 'react'
import { useState } from "react";
import { motion } from "framer-motion";
import { MessagesSquare } from "lucide-react";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";
import StreamingOutput from "../shared/StreamingOutput.jsx";
import { recordTokenUsage } from "../shared/TokenTracker.jsx";

function AgentDebate({ onLog }) {
  const [topic, setTopic] = useState(
    "Should we prioritize enterprise sales follow-up over project QA this week?"
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDebate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orchestrator/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic })
      });
      if (!response.ok) throw new Error("Debate API unavailable");
      const data = await response.json();
      setResult(data);
      onLog?.("Orchestrator", "Completed debate mode verdict.");
      recordTokenUsage(data.tokens_used || 1700);
    } catch {
      const fallback = {
        pro_agent: "Sales",
        con_agent: "Project",
        pro: "Sales argues pipeline follow-up creates immediate revenue protection.",
        con: "Project argues QA blockers can damage launch trust if ignored.",
        verdict:
          "Final verdict: protect the launch path first, then schedule same-day executive follow-up for hot sales opportunities.",
        confidence: 83,
        reasoning: [
          "Compared urgency, reversibility, and business impact.",
          "Weighted launch trust above short-term pipeline speed.",
          "Recommended a sequenced plan instead of a binary tradeoff."
        ]
      };
      setResult(fallback);
      onLog?.("Orchestrator", "Completed fallback debate mode verdict.");
      recordTokenUsage(900);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      className="glass-card hover-lift rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.12, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15 text-orange-200">
            <MessagesSquare size={18} />
          </span>
          <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
            Agent debate
          </h3>
        </div>
        {result && <ConfidenceBadge value={result.confidence || 82} />}
      </div>
      <textarea
        className="min-h-28 w-full resize-y rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm leading-6 text-[var(--text)]"
        value={topic}
        onChange={(event) => setTopic(event.target.value)}
      />
      <button
        type="button"
        className="mt-4 rounded-lg border border-orange-400/30 bg-orange-500/15 px-4 py-3 text-sm font-bold text-orange-200 hover:shadow-glow"
        onClick={runDebate}
      >
        {loading ? "Debating..." : "Debate Mode"}
      </button>

      {result && (
        <div className="mt-4 space-y-4">
          <StreamingOutput
            text={`${result.pro_agent}: ${result.pro} ${result.con_agent}: ${result.con} ${result.verdict}`}
          />
          <ReasoningTrace steps={result.reasoning || []} />
        </div>
      )}
    </motion.section>
  );
}

export default AgentDebate;

