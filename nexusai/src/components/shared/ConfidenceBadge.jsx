import React from 'react'
function ConfidenceBadge({ value = 0 }) {
  const score = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const tone =
    score > 70
      ? "border-blue-400/30 bg-blue-500/15 text-blue-200"
      : score >= 50
        ? "border-orange-400/30 bg-orange-500/15 text-orange-200"
        : "border-red-400/30 bg-red-500/15 text-red-200";

  return (
    <span
      className={`agent-output inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${tone}`}
    >
      {score}% confident
    </span>
  );
}

export default ConfidenceBadge;

