import React from 'react'
import { motion } from "framer-motion";

function ScoreRing({ score = 0, size = 104 }) {
  const normalized = Math.max(0, Math.min(100, Number(score) || 0));
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={normalized >= 75 ? "#10B981" : normalized >= 50 ? "#F97316" : "#EF4444"}
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute font-heading text-2xl font-extrabold text-[var(--text)]">
        {Math.round(normalized)}
      </span>
    </div>
  );
}

export default ScoreRing;

