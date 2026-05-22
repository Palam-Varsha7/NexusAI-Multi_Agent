import React from 'react'
import { useState } from "react";
import { motion } from "framer-motion";
import { MailPlus } from "lucide-react";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";
import StreamingOutput from "../shared/StreamingOutput.jsx";

function InvoiceDrafter() {
  const [context, setContext] = useState(
    "Invoice NX-1048 for $18,900 is 12 days past due. Customer needs payment link and PO confirmation. Relationship is important but finance wants a firm confirmation."
  );
  const [subject, setSubject] = useState("Invoice NX-1048 follow-up");
  const [template, setTemplate] = useState(
    "Hi Alex,\n\nI wanted to follow up on invoice NX-1048, which is currently 12 days past due. Please let me know if your team needs the payment link, PO reference, or any supporting documentation.\n\nBest,\nNexusAI Finance"
  );
  const [loading, setLoading] = useState(false);
  const [reasoning, setReasoning] = useState([
    "Identified overdue invoice context.",
    "Kept the message direct while preserving customer relationship tone.",
    "Included clear next action and support options."
  ]);

  const sharpenTone = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/finance/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_context: context, tone: "firm but helpful" })
      });
      if (!response.ok) throw new Error("Finance invoice API unavailable");
      const data = await response.json();
      setSubject(data.subject || subject);
      setTemplate(data.draft || template);
      setReasoning(data.reasoning || reasoning);
    } catch {
      setSubject("Invoice NX-1048: payment timing");
      setTemplate(
        "Hi Alex,\n\nFollowing up on invoice NX-1048, now 12 days past due. To keep the account in good standing, please confirm payment timing by end of day or let us know if documentation is blocking approval.\n\nBest,\nNexusAI Finance"
      );
      setReasoning([
        "Detected overdue payment and approval friction.",
        "Raised the firmness while keeping support options.",
        "Asked for payment timing confirmation."
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      className="glass-card hover-lift rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.3, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-200">
            <MailPlus size={18} />
          </span>
          <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
            Invoice follow-up
          </h3>
        </div>
        <ConfidenceBadge value={85} />
      </div>

      <textarea
        className="mb-3 min-h-24 w-full resize-y rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm leading-6 text-[var(--text)]"
        value={context}
        onChange={(event) => setContext(event.target.value)}
        aria-label="Invoice context"
      />
      <input
        className="mb-3 w-full rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3 text-sm font-bold text-[var(--text)]"
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        aria-label="Invoice subject"
      />
      <textarea
        className="min-h-44 w-full resize-y rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm leading-6 text-[var(--text)]"
        value={template}
        onChange={(event) => setTemplate(event.target.value)}
      />
      <button
        type="button"
        className="mt-4 rounded-lg border border-blue-400/30 bg-blue-500/15 px-4 py-3 text-sm font-bold text-blue-200 hover:shadow-glow"
        onClick={sharpenTone}
      >
        {loading ? "Drafting..." : "Tighten follow-up"}
      </button>
      <div className="mt-4">
        <StreamingOutput text={`Subject: ${subject}. ${template.replace(/\n/g, " ")}`} speed={20} />
      </div>
      <div className="mt-4">
        <ReasoningTrace steps={reasoning} />
      </div>
    </motion.section>
  );
}

export default InvoiceDrafter;

