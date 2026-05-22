import React from 'react'
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

function ReasoningTrace({ steps = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white/5">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold text-[var(--text)]"
        onClick={() => setOpen((current) => !current)}
      >
        <span>Reasoning trace</span>
        <ChevronDown
          size={17}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <ol className="space-y-3 border-t border-[var(--border)] px-4 py-4">
              {steps.map((step, index) => (
                <li key={`${step}-${index}`} className="flex gap-3 text-sm">
                  <span className="agent-output flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-semibold text-blue-200">
                    {index + 1}
                  </span>
                  <span className="leading-6 text-muted">{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ReasoningTrace;

