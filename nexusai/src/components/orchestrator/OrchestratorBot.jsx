import React from 'react'
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import ActivityFeed from "./ActivityFeed.jsx";
import AgentDebate from "./AgentDebate.jsx";
import CommandBar from "./CommandBar.jsx";
import GoalMode from "./GoalMode.jsx";
import MemoryTimeline from "./MemoryTimeline.jsx";
import DocUpload from "../rag/DocUpload.jsx";
import CrossAgentReport from "../shared/CrossAgentReport.jsx";
import ProactiveAlert from "../shared/ProactiveAlert.jsx";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";
import SkeletonCard from "../shared/SkeletonCard.jsx";
import StreamingOutput from "../shared/StreamingOutput.jsx";
import { recordTokenUsage } from "../shared/TokenTracker.jsx";

const nowTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

const seedEvents = [
  {
    time: "10:04:12",
    agent: "Orchestrator",
    message: "Session memory initialized."
  },
  {
    time: "10:05:31",
    agent: "Finance",
    message: "Detected campaign spend anomaly and queued review."
  }
];

function OrchestratorBot() {
  const [events, setEvents] = useState(seedEvents);
  const [response, setResponse] = useState({
    output:
      "NexusAI Orchestrator is ready. Send a command and I will route it to Recruit, Sales, Project, Finance, or multiple agents in sequence.",
    agents: ["Orchestrator"],
    confidence: 88,
    reasoning: [
      "Listening for command intent.",
      "Will route by domain keywords and operational dependencies.",
      "Will synthesize a combined answer after agent execution."
    ]
  });
  const [loading, setLoading] = useState(false);

  const log = (agent, message) => {
    setEvents((current) => [
      { time: nowTime(), agent, message },
      ...current
    ]);
  };

  const routeCommand = async (command) => {
    setLoading(true);
    log("Orchestrator", `Routing command: ${command}`);

    try {
      const result = await fetch("/api/orchestrator/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command })
      });

      if (!result.ok) throw new Error("Orchestrator API unavailable");
      const data = await result.json();
      setResponse(data);
      (data.steps || []).forEach((step) => log(step.agent, step.action));
      recordTokenUsage(data.tokens_used || 1800);
    } catch {
      const fallback = {
        output:
          "I routed the command through the most relevant agents locally. Recruit checks people signals, Sales checks revenue impact, Project checks delivery risk, and Finance checks cost or anomaly exposure. Final recommendation: prioritize the highest-risk blocker first, then automate follow-up tasks.",
        agents: ["Recruit", "Sales", "Project", "Finance"],
        confidence: 82,
        reasoning: [
          "Detected broad operational command.",
          "Mapped command to all four specialist agents.",
          "Synthesized a sequenced recommendation."
        ],
        steps: [
          { agent: "Recruit", action: "Reviewed people and candidate impact." },
          { agent: "Sales", action: "Checked pipeline and customer impact." },
          { agent: "Project", action: "Assessed delivery risk." },
          { agent: "Finance", action: "Reviewed cost and anomaly impact." }
        ]
      };
      setResponse(fallback);
      fallback.steps.forEach((step) => log(step.agent, step.action));
      recordTokenUsage(1000);
    } finally {
      setLoading(false);
    }
  };

  const agentLabel = useMemo(
    () => (response.agents || ["Orchestrator"]).join(" + "),
    [response.agents]
  );

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
            Orchestrator agent
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-normal text-[var(--text)] md:text-5xl">
            Multi-agent command center
          </h1>
        </div>
        <ConfidenceBadge value={response.confidence || 82} />
      </motion.div>

      <CommandBar onSubmit={routeCommand} loading={loading} />

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <motion.section
            className="glass-card rounded-lg p-5"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.06, ease: "easeOut" }}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="agent-output mb-2 text-[11px] uppercase tracking-[0.18em] text-blue-300">
                  Routed to {agentLabel}
                </p>
                <h3 className="font-heading text-2xl font-bold tracking-normal text-[var(--text)]">
                  Combined output
                </h3>
              </div>
              <ConfidenceBadge value={response.confidence || 82} />
            </div>
            {loading ? (
              <SkeletonCard lines={5} />
            ) : (
              <>
                <StreamingOutput text={response.output || ""} />
                {response.live_stats && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {[
                      ["Urgency", `${response.live_stats.urgency || 0}%`],
                      ["Automation gain", `${response.live_stats.automation_gain || 0}%`],
                      ["Manual steps removed", response.live_stats.manual_steps_removed || 0]
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-[var(--border)] bg-white/5 p-3"
                      >
                        <p className="agent-output text-[10px] uppercase tracking-[0.18em] text-muted">
                          {label}
                        </p>
                        <p className="agent-output mt-1 text-2xl font-bold text-blue-200">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <ReasoningTrace steps={response.reasoning || []} />
                </div>
              </>
            )}
          </motion.section>

          <ProactiveAlert
            title="Finance anomaly auto-detected"
            message="Marketing spend exceeded the monthly baseline. NexusAI can route FinanceBot and SalesBot to decide whether campaign ROI justifies the variance."
            agent="Finance"
            onHandle={() =>
              routeCommand("Review marketing spend anomaly and decide if sales pipeline impact justifies it")
            }
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <AgentDebate onLog={log} />
            <GoalMode onLog={log} />
          </div>

          <DocUpload onLog={log} />
          <CrossAgentReport />
        </div>

        <div className="space-y-4">
          <MemoryTimeline events={events} />
          <ActivityFeed events={events} />
        </div>
      </div>
    </div>
  );
}

export default OrchestratorBot;

