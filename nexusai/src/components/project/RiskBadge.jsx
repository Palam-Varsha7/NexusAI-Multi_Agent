import React from 'react'
const styles = {
  High: "border-red-400/30 bg-red-500/15 text-red-200",
  Medium: "border-orange-400/30 bg-orange-500/15 text-orange-200",
  Low: "border-green-400/30 bg-green-500/15 text-green-200"
};

function RiskBadge({ level = "Low" }) {
  return (
    <span
      className={`agent-output inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
        styles[level] || styles.Low
      }`}
    >
      {level} risk
    </span>
  );
}

export default RiskBadge;

