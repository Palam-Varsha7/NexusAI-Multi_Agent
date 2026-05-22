import React from 'react'
import { useEffect, useMemo, useRef, useState } from "react";
import { BrainCircuit, Mic, Send } from "lucide-react";

const agentKeywords = {
  Recruit: ["resume", "candidate", "hire", "hiring", "interview", "hr", "recruit", "employee"],
  Sales: ["lead", "sales", "deal", "pipeline", "proposal", "customer", "revenue", "follow up"],
  Project: ["task", "deadline", "project", "risk", "blocker", "delivery", "timeline", "owner"],
  Finance: ["invoice", "expense", "budget", "finance", "cash", "anomaly", "payment", "spend"],
  Admin: ["access", "policy", "user", "role", "audit", "admin", "permission", "control"]
};

function analyzeCommand(text) {
  const normalized = text.toLowerCase();
  const scores = Object.entries(agentKeywords).map(([agent, keywords]) => ({
    agent,
    score: keywords.reduce((total, keyword) => total + (normalized.includes(keyword) ? 1 : 0), 0)
  }));
  const matched = scores.filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
  const agents = matched.length ? matched.map((item) => item.agent) : ["Orchestrator"];
  const totalScore = matched.reduce((sum, item) => sum + item.score, 0);
  const confidence = Math.min(96, Math.max(text.trim() ? 58 : 0, 62 + totalScore * 9));
  const intent =
    agents.length > 1
      ? "Cross-agent workflow"
      : agents[0] === "Orchestrator"
        ? "General command"
        : `${agents[0]} workflow`;

  return { agents, confidence, intent };
}

function CommandBar({ onSubmit, loading = false }) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const recognitionRef = useRef(null);
  const nlp = useMemo(() => analyzeCommand(value), [value]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return undefined;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      setValue(event.results[0][0].transcript);
      setListening(false);
      setVoiceStatus("voice captured");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, []);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
    setVoiceStatus("");
  };

  const startVoice = () => {
    if (!recognitionRef.current) {
      setVoiceStatus("voice unavailable");
      return;
    }

    try {
      setListening(true);
      setVoiceStatus("listening");
      recognitionRef.current.start();
    } catch {
      setListening(false);
      setVoiceStatus("voice unavailable");
    }
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[#071013] px-4 py-3 transition focus-within:border-emerald-300/60 focus-within:shadow-glow">
      <div className="flex w-full items-center gap-3">
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-muted"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder="Ask NexusAI to route work across recruit, sales, project, and finance"
          aria-label="NexusAI command"
        />
        <button
          type="button"
          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
            listening
              ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-200"
              : "border-[var(--border)] bg-white/5 text-muted hover:text-[var(--text)]"
          }`}
          onClick={startVoice}
          aria-label="Use voice input"
          title="Voice input"
        >
          <Mic size={17} />
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400 text-slate-950 shadow-glow transition hover:bg-emerald-300"
          onClick={submit}
          aria-label="Submit command"
          title="Submit"
        >
          <Send size={16} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
        <span className="agent-output inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-emerald-300">
          <BrainCircuit size={14} />
          NLP {value.trim() ? `${nlp.confidence}%` : "ready"}
        </span>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-100">
          {nlp.intent}
        </span>
        {nlp.agents.map((agent) => (
          <span key={agent} className="agent-output rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-[11px] text-blue-100">
            {agent}
          </span>
        ))}
        {(loading || voiceStatus) && (
          <span className="agent-output ml-auto text-xs text-emerald-300">
            {loading ? "routing" : voiceStatus}
          </span>
        )}
      </div>
    </div>
  );
}

export default CommandBar;

