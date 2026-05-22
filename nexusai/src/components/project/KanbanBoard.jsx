import React from 'react'
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import RiskBadge from "./RiskBadge.jsx";

const columns = ["To Do", "In Progress", "Review", "Done"];

function groupTasks(tasks) {
  return columns.reduce((acc, column) => {
    acc[column] = tasks.filter((task) => task.status === column);
    return acc;
  }, {});
}

function KanbanBoard({ tasks = [] }) {
  const [cards, setCards] = useState(tasks);
  const [dragged, setDragged] = useState(null);
  const grouped = groupTasks(cards);

  useEffect(() => {
    setCards(tasks);
  }, [tasks]);

  const moveTask = (targetStatus) => {
    if (!dragged) return;

    setCards((current) =>
      current.map((task) =>
        task.id === dragged.id ? { ...task, status: targetStatus } : task
      )
    );
    setDragged(null);
  };

  const moveTaskForward = (task) => {
    const currentIndex = columns.indexOf(task.status);
    const nextStatus = columns[(currentIndex + 1) % columns.length];
    setCards((current) =>
      current.map((item) =>
        item.id === task.id ? { ...item, status: nextStatus } : item
      )
    );
  };

  return (
    <motion.section
      className="glass-card rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
    >
      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((column, index) => (
          <motion.div
            key={column}
            className="min-h-80 rounded-lg border border-[var(--border)] bg-white/5 p-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.36,
              delay: index * 0.06,
              ease: "easeOut"
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => moveTask(column)}
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-[var(--text)]">{column}</h4>
              <span className="agent-output text-xs text-muted">
                {grouped[column].length}
              </span>
            </div>

            <div className="space-y-3">
              {grouped[column].map((task) => (
                <button
                  key={task.id}
                  type="button"
                  draggable
                  onDragStart={() => setDragged(task)}
                  onClick={() => moveTaskForward(task)}
                  className={`hover-lift w-full rounded-lg border bg-[var(--elevated)] p-3 text-left ${
                    task.overdue
                      ? "border-orange-400/50"
                      : "border-[var(--border)]"
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="agent-output rounded-full bg-blue-500/15 px-2 py-1 text-[11px] font-bold text-blue-200">
                      {task.priority}
                    </span>
                    <RiskBadge level={task.risk} />
                  </div>
                  <span className="block text-sm font-bold text-[var(--text)]">
                    {task.title}
                  </span>
                  <span className="mt-2 block text-sm text-muted">
                    {task.owner} · {task.deadline}
                  </span>
                  {task.overdue && (
                    <span className="agent-output mt-3 block text-xs uppercase tracking-[0.16em] text-orange-200">
                      Overdue alert
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default KanbanBoard;

