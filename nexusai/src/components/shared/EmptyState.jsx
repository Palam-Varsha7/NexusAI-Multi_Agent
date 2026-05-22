import React from 'react'
import { Inbox } from "lucide-react";

function EmptyState({ icon: Icon = Inbox, text = "No data yet.", className = "" }) {
  return (
    <div
      className={`flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-white/5 p-6 text-center ${className}`}
    >
      <Icon size={28} className="mb-3 text-muted" />
      <p className="text-sm font-semibold text-muted">{text}</p>
    </div>
  );
}

export default EmptyState;

