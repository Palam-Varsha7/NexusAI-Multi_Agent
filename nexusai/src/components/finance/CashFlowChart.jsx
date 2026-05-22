import React from 'react'
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";

function CashFlowChart({ data = [], confidence = 86 }) {
  return (
    <motion.section
      className="glass-card hover-lift rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.18, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="agent-output mb-2 text-[11px] uppercase tracking-[0.18em] text-blue-300">
            Cash position
          </p>
          <h3 className="font-heading text-2xl font-bold tracking-normal text-[var(--text)]">
            Predicted vs actual
          </h3>
        </div>
        <ConfidenceBadge value={confidence} />
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" stroke="var(--muted)" fontSize={12} />
            <YAxis stroke="var(--muted)" fontSize={12} />
            <Tooltip
              contentStyle={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                background: "var(--elevated)",
                color: "var(--text)"
              }}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.18}
              animationDuration={900}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.14}
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <ReasoningTrace
          steps={[
            "Compared expected inflows with posted cash receipts.",
            "Highlighted variance across the current month trend.",
            "Projected near-term runway from actual cash movement."
          ]}
        />
      </div>
    </motion.section>
  );
}

export default CashFlowChart;

