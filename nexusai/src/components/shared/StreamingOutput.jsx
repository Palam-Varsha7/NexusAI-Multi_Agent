import React from 'react'
import { useEffect, useMemo, useState } from "react";

function StreamingOutput({ text = "", speed = 36 }) {
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    if (!words.length) return undefined;

    const interval = window.setInterval(() => {
      setVisibleCount((count) => {
        if (count >= words.length) {
          window.clearInterval(interval);
          return count;
        }

        return count + 1;
      });
    }, speed);

    return () => window.clearInterval(interval);
  }, [speed, words]);

  return (
    <div className="agent-output min-h-28 rounded-lg border border-[var(--border)] bg-[#0D1117] p-4 text-sm leading-7 text-blue-100 shadow-inner">
      {words.length ? words.slice(0, visibleCount).join(" ") : "Awaiting agent output..."}
      {visibleCount < words.length && (
        <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 bg-blue-300" />
      )}
    </div>
  );
}

export default StreamingOutput;

