import React from "react";

const newsItems = [
  "Stats are calculated from the loaded resumes, leads, tasks, and invoice records.",
  "Sales, finance, project, and recruit signals are synced from the bundled dataset.",
  "Each metric is tied to project data so the numbers stay explainable."
];

function LiveStatOrbs({ title = "NexusAI at a glance", eyebrow = "Live stats", stats = [] }) {
  const renderedStats = stats.map((stat) => {
    const value = stat.value;
    return {
      ...stat,
      renderedValue: stat.prefix
        ? `${stat.prefix}${Number(value).toLocaleString("en-US")}`
        : typeof value === "number"
          ? Number(value).toLocaleString("en-US")
          : value
    };
  });

  return (
    <section className="live-orb-panel">
      <div className="live-orb-title">
        <p>{eyebrow}</p>
        <h3>{title}</h3>
      </div>
      <div className="live-orb-grid">
        {renderedStats.map((stat) => (
          <div className="live-stat-orb" key={stat.label} style={{ "--orb-color": stat.color || "#3cffb5" }}>
            <div>
              <strong>{stat.renderedValue}</strong>
              <span>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="live-news-strip">
        <b>LIVE INTEL</b>
        <span>{newsItems[0]}</span>
      </div>
    </section>
  );
}

export default LiveStatOrbs;
