import React from 'react'
import { motion } from "framer-motion";
import RiskBadge from "./RiskBadge.jsx";

const dayMs = 24 * 60 * 60 * 1000;

function toDate(value) {
  return new Date(`${value}T00:00:00`);
}

function GanttChart({ tasks = [] }) {
  if (!tasks.length) {
    return (
      <section className="glass-card rounded-lg p-5">
        <p className="text-sm text-muted">No timeline tasks available.</p>
      </section>
    );
  }

  const dates = tasks.flatMap((task) => [toDate(task.start), toDate(task.end)]);
  const min = Math.min(...dates.map((date) => date.getTime()));
  const max = Math.max(...dates.map((date) => date.getTime()));
  const total = Math.max(1, (max - min) / dayMs);

  return (
    <motion.section
      className="glass-card rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="agent-output mb-2 text-[11px] uppercase tracking-[0.18em] text-blue-300">
            Timeline
          </p>
          <h3 className="font-heading text-2xl font-bold tracking-normal text-[var(--text)]">
            Gantt view
          </h3>
        </div>
        <span className="agent-output text-xs text-muted">
          {new Date(min).toLocaleDateString()} - {new Date(max).toLocaleDateString()}
        </span>
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => {
          const startOffset = ((toDate(task.start).getTime() - min) / dayMs / total) * 100;
          const width = Math.max(
            8,
            ((toDate(task.end).getTime() - toDate(task.start).getTime()) /
              dayMs /
              total) *
              100
          );

          return (
            <motion.div
              key={task.id}
              className="grid gap-3 md:grid-cols-[220px_1fr]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.34,
                delay: index * 0.06,
                ease: "easeOut"
              }}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--text)]">
                  {task.title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="agent-output text-xs text-blue-300">
                    {task.priority}
                  </span>
                  <RiskBadge level={task.risk} />
                </div>
              </div>
              <div className="relative h-11 rounded-lg border border-[var(--border)] bg-white/5">
                <motion.div
                  className={`absolute top-2 h-7 rounded-md ${
                    task.overdue ? "bg-orange-500" : "bg-blue-500"
                  }`}
                  style={{ left: `${startOffset}%`, width: `${width}%` }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.1 + index * 0.06, ease: "easeOut" }}
                  transformOrigin="left"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

export default GanttChart;

