import React from 'react'
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MailCheck, RefreshCw, Send } from "lucide-react";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import StreamingOutput from "../shared/StreamingOutput.jsx";

function EmailDrafter({ candidateName = "Candidate", confidence = 87, candidateContext = "" }) {
  const [mode, setMode] = useState("offer");
  const draft = useMemo(() => {
    if (mode === "offer") {
      return `Hi ${candidateName},\n\nThank you for speaking with the NexusAI team. We were impressed by your execution depth and believe your profile is a strong fit for the role. We would like to move forward with an offer conversation and align on compensation, start date, and next steps.\n\nBest,\nNexusAI Recruiting`;
    }

    return `Hi ${candidateName},\n\nThank you for taking the time to apply and interview with NexusAI. After careful review, we will not be moving forward for this opening. Your background has meaningful strengths, and we would be glad to keep your profile in mind for future roles that align more closely.\n\nBest,\nNexusAI Recruiting`;
  }, [candidateName, mode]);
  const [content, setContent] = useState(draft);
  const [subject, setSubject] = useState("NexusAI recruiting update");
  const [recipient, setRecipient] = useState("candidate@example.com");
  const [loading, setLoading] = useState(false);
  const [sendStatus, setSendStatus] = useState("");
  const [reasoning, setReasoning] = useState([
    "Uses candidate name and decision mode.",
    "Keeps wording respectful and role-related.",
    "Avoids protected-class or personality language."
  ]);

  const generateDraft = async (nextMode = mode) => {
    setMode(nextMode);
    setLoading(true);
    setSendStatus("");
    const variationSeed = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    try {
      const response = await fetch("/api/recruit/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_name: candidateName,
          decision: nextMode,
          candidate_context: candidateContext,
          variation_seed: variationSeed
        })
      });
      if (!response.ok) throw new Error("Recruit email API unavailable");
      const data = await response.json();
      setSubject(data.subject || "NexusAI recruiting update");
      setContent(data.draft || draft);
      setReasoning(data.reasoning || reasoning);
    } catch {
      setSubject(nextMode === "offer" ? "NexusAI offer conversation" : "NexusAI application update");
      setContent(
        nextMode === "offer"
          ? `Hi ${candidateName},\n\nThank you for speaking with the NexusAI team. We were impressed by your execution depth and believe your profile is a strong fit for the role. We would like to move forward with an offer conversation and align on compensation, start date, and next steps.\n\nBest,\nNexusAI Recruiting`
          : `Hi ${candidateName},\n\nThank you for taking the time to apply and interview with NexusAI. After careful review, we will not be moving forward for this opening. Your background has meaningful strengths, and we would be glad to keep your profile in mind for future roles that align more closely.\n\nBest,\nNexusAI Recruiting`
      );
      setReasoning([
        "Generated a role-related message from the selected decision.",
        "Kept the tone professional and bias-aware.",
        "Made the next step clear for the candidate."
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    setSendStatus("sending");
    try {
      const response = await fetch("/api/recruit/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient,
          subject,
          body: content,
          sender_name: "NexusAI Recruiting"
        })
      });
      if (!response.ok) throw new Error("Send email API unavailable");
      const data = await response.json();
      if (data.status === "sent") {
        setSendStatus(`Sent to ${data.recipient}`);
        return;
      }
      const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
      window.location.href = mailto;
      setSendStatus(`Opened email client for ${data.recipient}. SMTP can be added for direct sending.`);
    } catch {
      const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
      window.location.href = mailto;
      setSendStatus("Opened email client fallback");
    }
  };

  return (
    <motion.section
      className="glass-card hover-lift rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.18, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-200">
            <MailCheck size={19} />
          </span>
          <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
            Bulk email draft
          </h3>
        </div>
        <ConfidenceBadge value={confidence} />
      </div>

      <div className="mb-4 flex rounded-lg border border-[var(--border)] bg-white/5 p-1">
        {["offer", "rejection"].map((option) => (
          <button
            key={option}
            type="button"
            className={`flex-1 rounded-md px-3 py-2 text-sm font-bold capitalize transition ${
              mode === option
                ? "bg-blue-500 text-white shadow-glow"
                : "text-muted hover:text-[var(--text)]"
            }`}
            onClick={() => generateDraft(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <input
        className="mb-3 w-full rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3 text-sm text-[var(--text)]"
        value={recipient}
        onChange={(event) => setRecipient(event.target.value)}
        aria-label="Recipient email"
        placeholder="candidate@example.com"
      />
      <input
        className="mb-3 w-full rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3 text-sm font-bold text-[var(--text)]"
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        aria-label="Recruiting email subject"
      />
      <textarea
        className="min-h-52 w-full resize-y rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm leading-6 text-[var(--text)]"
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      {loading && (
        <p className="agent-output mt-3 text-xs uppercase tracking-[0.18em] text-blue-300">
          RecruitBot drafting...
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-400/15 px-4 py-3 text-sm font-bold text-emerald-100 hover:shadow-glow"
          onClick={() => generateDraft(mode)}
        >
          <RefreshCw size={16} />
          Generate fresh AI draft
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 text-sm font-extrabold text-slate-950 shadow-glow transition hover:bg-emerald-300"
          onClick={sendEmail}
        >
          <Send size={16} />
          Send email
        </button>
      </div>
      {sendStatus && (
        <p className="agent-output mt-3 text-xs uppercase tracking-[0.16em] text-emerald-300">
          {sendStatus}
        </p>
      )}
      <div className="mt-4">
        <StreamingOutput text={`Subject: ${subject}. ${content.replace(/\n/g, " ")}`} speed={18} />
        <div className="mt-3 space-y-1">
          {reasoning.map((step) => (
            <p key={step} className="agent-output text-xs text-muted">
              {step}
            </p>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default EmailDrafter;

