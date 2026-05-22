import React from 'react'
import { useState } from "react";
import { motion } from "framer-motion";
import { FileUp, Search } from "lucide-react";
import CitedResponse from "./CitedResponse.jsx";
import { recordTokenUsage } from "../shared/TokenTracker.jsx";

function DocUpload({ onLog }) {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("What are the key risks in this document?");
  const [response, setResponse] = useState(null);
  const [status, setStatus] = useState("Drop a PDF to build document memory.");

  const uploadFile = async (selectedFile = file) => {
    if (!selectedFile) return;
    const body = new FormData();
    body.append("file", selectedFile);
    setStatus("Uploading and ingesting PDF...");

    try {
      const result = await fetch("/api/rag/upload", {
        method: "POST",
        body
      });
      if (!result.ok) throw new Error("RAG upload unavailable");
      const data = await result.json();
      setStatus(`Indexed ${data.chunks || 0} chunks from ${data.filename}.`);
      onLog?.("Orchestrator", `Indexed RAG document ${data.filename}.`);
      recordTokenUsage(450);
    } catch {
      setStatus(`Stored local placeholder for ${selectedFile.name}. Backend upload unavailable.`);
      onLog?.("Orchestrator", `Queued RAG upload placeholder for ${selectedFile.name}.`);
    }
  };

  const askDocument = async () => {
    try {
      const result = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      if (!result.ok) throw new Error("RAG query unavailable");
      const data = await result.json();
      setResponse(data);
      onLog?.("Orchestrator", "Answered RAG query with citations.");
      recordTokenUsage(data.tokens_used || 1200);
    } catch {
      setResponse({
        answer:
          "The uploaded document memory is not available yet, but NexusAI would normally retrieve relevant chunks, answer from those passages, and attach source citations.",
        citations: [{ filename: file?.name || "sample.pdf", page: 1 }],
        confidence: 72
      });
      recordTokenUsage(500);
    }
  };

  return (
    <motion.section
      className="glass-card rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.24, ease: "easeOut" }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const dropped = event.dataTransfer.files?.[0];
        if (dropped) {
          setFile(dropped);
          uploadFile(dropped);
        }
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-200">
          <FileUp size={18} />
        </span>
        <div>
          <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
            Document memory
          </h3>
          <p className="text-sm text-muted">{status}</p>
        </div>
      </div>

      <label className="mb-4 block rounded-lg border border-dashed border-blue-400/30 bg-blue-500/10 p-4 text-sm text-blue-100">
        <span className="mb-2 block font-bold">PDF upload</span>
        <input
          type="file"
          accept="application/pdf"
          className="w-full text-sm text-muted"
          onChange={(event) => {
            const selected = event.target.files?.[0] || null;
            setFile(selected);
            if (selected) uploadFile(selected);
          }}
        />
      </label>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3 text-sm text-[var(--text)]"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-400"
          onClick={askDocument}
        >
          <Search size={17} />
          Query
        </button>
      </div>

      <div className="mt-4">
        <CitedResponse
          answer={response?.answer}
          citations={response?.citations || []}
          confidence={response?.confidence}
        />
      </div>
    </motion.section>
  );
}

export default DocUpload;

