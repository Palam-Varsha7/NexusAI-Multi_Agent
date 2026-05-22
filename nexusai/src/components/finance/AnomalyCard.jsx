import React from 'react'
import { motion } from "framer-motion";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";

function AnomalyCard({ anomaly, index = 0 }) {
  if (!anomaly) return null;

  return (
    <motion.article
      className="hover-lift rounded-lg border border-orange-400/50 bg-orange-500/10 p-4"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--text)]">{anomaly.vendor}</p>
          <p className="agent-output mt-1 text-xs text-orange-200">
            ${Number(anomaly.amount || 0).toLocaleString("en-US")}
          </p>
        </div>
        <ConfidenceBadge value={anomaly.confidence || 78} />
      </div>
      <p className="text-sm leading-6 text-orange-100">{anomaly.reason}</p>
      <div className="mt-4">
        <ReasoningTrace
          steps={[
            "Compared expense against category baseline.",
            "Checked vendor frequency and amount variance.",
            "Flagged transaction because the pattern needs finance review."
          ]}
        />
      </div>
    </motion.article>
  );
}

export default AnomalyCard;

