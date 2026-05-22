import React from 'react'
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";
import StreamingOutput from "../shared/StreamingOutput.jsx";

function BudgetChart({ data = [], commentary, confidence = 83 }) {
  return (
    <motion.section
      className="glass-card hover-lift rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.24, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="agent-output mb-2 text-[11px] uppercase tracking-[0.18em] text-blue-300">
            Budget control
          </p>
          <h3 className="font-heading text-2xl font-bold tracking-normal text-[var(--text)]">
            Budget vs actual
          </h3>
        </div>
        <ConfidenceBadge value={confidence} />
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="category" stroke="var(--muted)" fontSize={12} />
            <YAxis stroke="var(--muted)" fontSize={12} />
            <Tooltip
              contentStyle={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                background: "var(--elevated)",
                color: "var(--text)"
              }}
            />
            <Bar dataKey="budget" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="actual" fill="#F97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <StreamingOutput text={commentary} speed={22} />
      </div>
      <div className="mt-4">
        <ReasoningTrace
          steps={[
            "Grouped spend by finance category.",
            "Compared actuals against monthly budget ceilings.",
            "Generated commentary for categories with the largest variance."
          ]}
        />
      </div>
    </motion.section>
  );
}

export default BudgetChart;

