import React from 'react'
import { motion } from "framer-motion";

const colors = {
  Recruit: "#3B82F6",
  Sales: "#F97316",
  Project: "#10B981",
  Finance: "#A855F7",
  Orchestrator: "#3B82F6"
};

function ActivityFeed({ events = [] }) {
  return (
    <section className="glass-card rounded-lg p-5">
      <div className="mb-4">
        <p className="agent-output mb-2 text-[11px] uppercase tracking-[0.18em] text-blue-300">
          Agent activity
        </p>
        <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
          Live routing log
        </h3>
      </div>
      <div className="space-y-3">
        {events.map((event, index) => (
          <motion.div
            key={`${event.time}-${event.message}-${index}`}
            className="rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3"
            style={{ borderLeft: `4px solid ${colors[event.agent] || colors.Orchestrator}` }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, delay: index * 0.06, ease: "easeOut" }}
          >
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <span className="agent-output text-xs text-muted">{event.time}</span>
              <span className="text-sm font-bold text-[var(--text)]">{event.agent}</span>
            </div>
            <p className="text-sm leading-6 text-muted">{event.message}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default ActivityFeed;

