import React from 'react'
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Check, Trash2, X } from "lucide-react";
import EmptyState from "./EmptyState.jsx";

const timeLabel = (value) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric"
  }).format(new Date(value));

function NotificationPanel({
  open = false,
  alerts = [],
  onClose,
  onMarkRead,
  onClearAll
}) {
  const markAllRead = () => {
    alerts.forEach((alert) => onMarkRead?.(alert.id));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-black/35 backdrop-blur-sm"
            aria-label="Close notifications"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] p-5 shadow-2xl backdrop-blur-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-200">
                  <BellRing size={18} />
                </span>
                <div>
                  <h2 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
                    Notifications
                  </h2>
                  <p className="text-sm text-muted">
                    {alerts.filter((alert) => !alert.read).length} unread alerts
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-white/5 text-muted hover:text-[var(--text)]"
                onClick={onClose}
                aria-label="Close notifications"
                title="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-blue-400/30 bg-blue-500/15 px-3 py-2 text-sm font-bold text-blue-200 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
                onClick={markAllRead}
                disabled={!alerts.length}
              >
                <Check size={15} />
                Mark all read
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-2 text-sm font-bold text-red-200 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
                onClick={onClearAll}
                disabled={!alerts.length}
              >
                <Trash2 size={15} />
                Clear all
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {!alerts.length && (
                <EmptyState
                  icon={BellRing}
                  text="No proactive alerts yet."
                  className="h-full"
                />
              )}

              {alerts.map((alert, index) => (
                <motion.article
                  key={alert.id}
                  className={`rounded-lg border p-4 ${
                    alert.read
                      ? "border-[var(--border)] bg-white/5"
                      : "border-blue-400/40 bg-blue-500/15 shadow-glow"
                  }`}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.28, delay: index * 0.035 }}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[var(--text)]">{alert.title}</p>
                      <p className="agent-output mt-1 text-[11px] uppercase tracking-[0.14em] text-blue-300">
                        {alert.agent} · {timeLabel(alert.createdAt)}
                      </p>
                    </div>
                    {!alert.read && (
                      <button
                        type="button"
                        className="rounded-lg border border-[var(--border)] bg-white/5 px-2.5 py-1.5 text-xs font-bold text-blue-200"
                        onClick={() => onMarkRead?.(alert.id)}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="text-sm leading-6 text-muted">{alert.message}</p>
                </motion.article>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default NotificationPanel;

