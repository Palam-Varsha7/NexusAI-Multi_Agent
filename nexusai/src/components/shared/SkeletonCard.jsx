import React from 'react'
function SkeletonCard({ lines = 4, className = "" }) {
  return (
    <div
      className={`skeleton-card rounded-lg border border-[var(--border)] bg-white/5 p-5 ${className}`}
      aria-label="Loading content"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="skeleton-shimmer h-11 w-11 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton-shimmer h-3 w-24 rounded-full" />
          <div className="skeleton-shimmer h-5 w-44 max-w-full rounded-full" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="skeleton-shimmer h-3 rounded-full"
            style={{ width: `${92 - index * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default SkeletonCard;

