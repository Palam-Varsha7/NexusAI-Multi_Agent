import React from 'react'
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";
import StreamingOutput from "../shared/StreamingOutput.jsx";

function CitedResponse({ answer, citations = [], confidence = 82 }) {
  if (!answer) return null;

  return (
    <section className="glass-card rounded-lg p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
          Cited response
        </h3>
        <ConfidenceBadge value={confidence} />
      </div>
      <StreamingOutput text={answer} />
      <div className="mt-4 flex flex-wrap gap-2">
        {citations.map((citation, index) => (
          <span
            key={`${citation.filename}-${citation.page}-${index}`}
            className="agent-output rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200"
          >
            Source: {citation.filename}, Page {citation.page}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <ReasoningTrace
          steps={[
            "Retrieved the most relevant document chunks.",
            "Grounded the answer in cited source passages.",
            "Returned citations with filename and page metadata."
          ]}
        />
      </div>
    </section>
  );
}

export default CitedResponse;

