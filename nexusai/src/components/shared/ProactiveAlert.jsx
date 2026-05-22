import React from 'react'
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import ConfidenceBadge from "./ConfidenceBadge.jsx";

function ProactiveAlert({
  title = "Anomaly detected",
  message = "NexusAI found a workflow signal that needs attention.",
  agent = "Finance",
  confidence = 82,
  onHandle
}) {
  return (
    <motion.article
      className="hover-lift rounded-lg border border-orange-400/50 bg-orange-500/10 p-4"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15 text-orange-200">
            <AlertTriangle size={18} />
          </span>
          <div>
            <p className="font-bold text-[var(--text)]">{title}</p>
            <p className="agent-output mt-1 text-[11px] uppercase tracking-[0.14em] text-orange-200">
              {agent} agent
            </p>
          </div>
        </div>
        <ConfidenceBadge value={confidence} />
      </div>
      <p className="text-sm leading-6 text-orange-100">{message}</p>
      <button
        type="button"
        className="mt-4 rounded-lg border border-orange-400/30 bg-orange-500/15 px-3 py-2 text-sm font-bold text-orange-200 hover:shadow-glow"
        onClick={onHandle}
      >
        Let agent handle it
      </button>
    </motion.article>
  );
}

export default ProactiveAlert;

