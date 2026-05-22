import React from 'react'
import { motion } from "framer-motion";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";
import ScoreRing from "./ScoreRing.jsx";

function CandidateCard({ candidate, index = 0 }) {
  if (!candidate) return null;

  return (
    <motion.article
      className="glass-card hover-lift rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <ScoreRing score={candidate.score} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-heading text-2xl font-bold tracking-normal text-[var(--text)]">
              {candidate.name}
            </h3>
            <ConfidenceBadge value={candidate.confidence} />
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            JD match {candidate.match_percent}% · {candidate.summary}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-white/5 p-4">
          <p className="mb-3 text-sm font-bold text-[var(--text)]">Gap analysis</p>
          <ul className="space-y-2 text-sm leading-6 text-muted">
            {candidate.gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-white/5 p-4">
          <p className="mb-3 text-sm font-bold text-[var(--text)]">Bias flags</p>
          <ul className="space-y-2 text-sm leading-6 text-muted">
            {candidate.bias_flags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4">
        <ReasoningTrace steps={candidate.reasoning} />
      </div>
    </motion.article>
  );
}

export default CandidateCard;

