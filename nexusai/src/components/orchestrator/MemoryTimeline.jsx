import React from 'react'
import { Clock3 } from "lucide-react";

function MemoryTimeline({ events = [] }) {
  return (
    <aside className="glass-card rounded-lg p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-200">
          <Clock3 size={18} />
        </span>
        <div>
          <p className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
            Memory timeline
          </p>
          <p className="agent-output text-[11px] uppercase tracking-[0.16em] text-muted">
            Session audit trail
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={`${event.time}-${index}`} className="relative pl-5">
            <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-blue-400" />
            <span className="absolute bottom-[-1.2rem] left-[4px] top-4 w-px bg-[var(--border)]" />
            <p className="agent-output text-xs text-muted">{event.time}</p>
            <p className="mt-1 text-sm font-bold text-[var(--text)]">{event.agent}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{event.message}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default MemoryTimeline;

