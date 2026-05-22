import React from 'react'
import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Sparkles } from "lucide-react";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";
import StreamingOutput from "../shared/StreamingOutput.jsx";

function StatusReport() {
  const [notes, setNotes] = useState(
    "Payments API is complete. QA found two mobile defects. Vendor contract is waiting on legal. Launch is still possible Friday if UAT signs off by Wednesday."
  );
  const [report, setReport] = useState(
    "Status: Amber. Completed: Payments API. Risks: mobile defects and legal review. Next actions: close QA blockers, get legal approval, confirm UAT sign-off by Wednesday."
  );
  const [confidence, setConfidence] = useState(84);

  const generateReport = async () => {
    try {
      const response = await fetch("/api/project/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes })
      });

      if (!response.ok) throw new Error("Project status API unavailable");
      const data = await response.json();
      setReport(data.report);
      setConfidence(data.confidence || 84);
    } catch {
      setReport(
        "Status: Amber. Completed work is moving well, but legal review and QA defects remain the critical blockers. Recommended action: assign owners to blockers and publish a 48-hour recovery plan."
      );
      setConfidence(82);
    }
  };

  return (
    <motion.section
      className="glass-card hover-lift rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.24, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-200">
            <ClipboardList size={18} />
          </span>
          <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
            Status report
          </h3>
        </div>
        <ConfidenceBadge value={confidence} />
      </div>

      <textarea
        className="min-h-36 w-full resize-y rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm leading-6 text-[var(--text)]"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <button
        type="button"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-400"
        onClick={generateReport}
      >
        <Sparkles size={17} />
        Generate status
      </button>
      <div className="mt-4">
        <StreamingOutput text={report} />
      </div>
      <div className="mt-4">
        <ReasoningTrace
          steps={[
            "Grouped notes into completed work, blockers, risks, and next actions.",
            "Assigned a status color from delivery risk and deadline pressure.",
            "Compressed raw notes into an executive-ready update."
          ]}
        />
      </div>
    </motion.section>
  );
}

export default StatusReport;

