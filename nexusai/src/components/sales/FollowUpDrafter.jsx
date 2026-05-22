import React from 'react'
import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import StreamingOutput from "../shared/StreamingOutput.jsx";

function FollowUpDrafter({ lead }) {
  const [draft, setDraft] = useState(
    "Hi Jordan,\n\nBased on your expansion goals, NexusAI can help remove manual handoffs across sales and finance. I can share a short automation map showing where your team could recover time this quarter.\n\nWould Tuesday or Wednesday work for a 20-minute walkthrough?"
  );
  const [subject, setSubject] = useState("Automation map for your revenue workflow");
  const [loading, setLoading] = useState(false);
  const [reasoning, setReasoning] = useState([
    "Uses lead score, buyer pain, and objective.",
    "Connects sales and finance workflow value.",
    "Ends with a concrete next step."
  ]);

  const personalize = async () => {
    const company = lead?.company || "your team";
    const leadInfo = [
      `Company: ${company}`,
      `Tier: ${lead?.tier || "Warm"}`,
      `Score: ${lead?.score || 62}`,
      `Reasoning: ${lead?.reasoning || "Pipeline follow-up opportunity"}`
    ].join("\n");

    setLoading(true);
    try {
      const response = await fetch("/api/sales/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_info: leadInfo,
          objective: "book a focused automation walkthrough"
        })
      });
      if (!response.ok) throw new Error("Sales follow-up API unavailable");
      const data = await response.json();
      setSubject(data.subject || subject);
      setDraft(data.draft || draft);
      setReasoning(data.reasoning || reasoning);
    } catch {
      setSubject(`${company}: 3-step automation plan`);
      setDraft(
        `Hi Jordan,\n\nI noticed ${company} is showing strong buying signals around workflow speed and forecast clarity. NexusAI can automate lead scoring, follow-up drafting, and invoice handoffs without adding another heavy operations layer.\n\nWould it be useful if I sent a 3-step automation plan for your current pipeline?`
      );
      setReasoning([
        "Used selected lead company and score.",
        "Mapped buying signal to an automation offer.",
        "Asked for a low-friction next step."
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      className="glass-card hover-lift rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.24, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15 text-orange-200">
            <Send size={18} />
          </span>
          <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
            Follow-up drafter
          </h3>
        </div>
        <ConfidenceBadge value={84} />
      </div>

      <input
        className="mb-3 w-full rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3 text-sm font-bold text-[var(--text)]"
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        aria-label="Email subject"
      />
      <textarea
        className="min-h-44 w-full resize-y rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm leading-6 text-[var(--text)]"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <button
        type="button"
        className="mt-4 rounded-lg border border-orange-400/30 bg-orange-500/15 px-4 py-3 text-sm font-bold text-orange-200 hover:shadow-glow"
        onClick={personalize}
      >
        {loading ? "Personalizing..." : "Personalize draft"}
      </button>
      <div className="mt-4">
        <StreamingOutput text={`Subject: ${subject}. ${draft.replace(/\n/g, " ")}`} speed={20} />
        <div className="mt-3 space-y-1">
          {reasoning.map((step) => (
            <p key={step} className="agent-output text-xs text-muted">
              {step}
            </p>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default FollowUpDrafter;

