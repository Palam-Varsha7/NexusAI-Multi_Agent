import React from 'react'
import { Coins } from "lucide-react";
import { recordTokenUsage, useTokenTracker } from "../../hooks/useTokenTracker.js";

function TokenTracker() {
  const usage = useTokenTracker();
  const cost = (usage.tokens / 1_000_000) * 0.59;

  return (
    <div className="agent-output flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white/5 px-3 py-2.5 text-xs font-semibold text-[var(--text)]">
      <Coins size={16} className="text-orange-300" />
      <span>{usage.tokens.toLocaleString("en-US")} tokens</span>
      <span className="text-muted">·</span>
      <span>${cost.toFixed(3)}</span>
      <span className="text-muted">·</span>
      <span>{usage.requests} req</span>
    </div>
  );
}

export { recordTokenUsage };
export default TokenTracker;

