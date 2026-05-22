import React from 'react'
import { motion } from "framer-motion";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";

const tierStyles = {
  Hot: "border-green-400/30 bg-green-500/15 text-green-200",
  Warm: "border-orange-400/30 bg-orange-500/15 text-orange-200",
  Cold: "border-red-400/30 bg-red-500/15 text-red-200"
};

function LeadCard({ lead, index = 0 }) {
  if (!lead) return null;

  return (
    <motion.article
      className="glass-card hover-lift rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="agent-output mb-2 text-[11px] uppercase tracking-[0.18em] text-blue-300">
            Lead score
          </p>
          <h3 className="font-heading text-2xl font-bold tracking-normal text-[var(--text)]">
            {lead.company}
          </h3>
        </div>
        <span
          className={`agent-output rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
            tierStyles[lead.tier] || tierStyles.Warm
          }`}
        >
          {lead.tier} · {lead.score}
        </span>
      </div>

      <p className="mb-4 text-sm leading-6 text-muted">{lead.reasoning}</p>
      <ConfidenceBadge value={lead.confidence} />

      <div className="mt-4">
        <ReasoningTrace
          steps={[
            "Checked firmographic fit and buying urgency.",
            "Scored recent engagement and decision-maker access.",
            "Mapped risk signals to the Hot/Warm/Cold tier."
          ]}
        />
      </div>
    </motion.article>
  );
}

export default LeadCard;

