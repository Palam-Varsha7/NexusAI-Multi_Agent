import React from 'react'
import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Calculator } from "lucide-react";

function AnimatedCurrency({ value }) {
  const count = useMotionValue(value);
  const formatted = useTransform(count, (latest) =>
    Math.round(latest).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    })
  );

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.55, ease: "easeOut" });
    return () => controls.stop();
  }, [count, value]);

  return <motion.span>{formatted}</motion.span>;
}

function ROICalculator() {
  const [teamSize, setTeamSize] = useState(14);
  const [hoursSaved, setHoursSaved] = useState(6);
  const hourlyValue = 72;
  const yearlySavings = teamSize * hoursSaved * 52 * hourlyValue;

  return (
    <motion.section
      className="glass-card rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/15 text-green-200">
          <Calculator size={18} />
        </span>
        <div>
          <p className="agent-output mb-1 text-[11px] uppercase tracking-[0.18em] text-blue-300">
            Automation ROI
          </p>
          <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
            Yearly savings
          </h3>
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-[var(--border)] bg-white/5 p-4">
        <p className="font-orbitron text-4xl font-extrabold tracking-normal text-green-200">
          <AnimatedCurrency value={yearlySavings} />
        </p>
        <p className="mt-2 text-sm text-muted">
          Based on ${hourlyValue}/hour loaded team cost.
        </p>
      </div>

      <label className="mb-5 block">
        <span className="mb-2 flex items-center justify-between text-sm font-bold text-[var(--text)]">
          Team size
          <span className="agent-output text-blue-300">{teamSize}</span>
        </span>
        <input
          type="range"
          min="1"
          max="80"
          value={teamSize}
          onChange={(event) => setTeamSize(Number(event.target.value))}
          className="w-full accent-blue-500"
        />
      </label>

      <label className="block">
        <span className="mb-2 flex items-center justify-between text-sm font-bold text-[var(--text)]">
          Hours saved per week
          <span className="agent-output text-blue-300">{hoursSaved}</span>
        </span>
        <input
          type="range"
          min="1"
          max="30"
          value={hoursSaved}
          onChange={(event) => setHoursSaved(Number(event.target.value))}
          className="w-full accent-blue-500"
        />
      </label>
    </motion.section>
  );
}

export default ROICalculator;

