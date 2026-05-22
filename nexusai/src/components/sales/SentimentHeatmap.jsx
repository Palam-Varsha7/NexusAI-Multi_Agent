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

function getColor(value) {
  if (value >= 70) return "#10B981";
  if (value >= 45) return "#F97316";
  return "#EF4444";
}

function SentimentHeatmap({ sentiment }) {
  const data = sentiment?.weekly_data || [];
  const label = sentiment?.label || "Neutral";
  const score = sentiment?.sentiment_score || 58;

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
            Sentiment timeline
          </p>
          <h3 className="font-heading text-2xl font-bold tracking-normal text-[var(--text)]">
            {label} · {score}
          </h3>
        </div>
        <ConfidenceBadge value={sentiment?.confidence || 82} />
      </div>

      <div className="mb-4 grid grid-cols-7 gap-2">
        {data.map((point) => (
          <div
            key={point.day}
            className="h-8 rounded-md border border-[var(--border)]"
            style={{ backgroundColor: `${getColor(point.score)}AA` }}
            title={`${point.day}: ${point.score}`}
          />
        ))}
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} />
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
              dataKey="score"
              stroke={getColor(score)}
              fill={getColor(score)}
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

export default SentimentHeatmap;

