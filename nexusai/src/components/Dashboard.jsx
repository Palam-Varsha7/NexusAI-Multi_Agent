import React from 'react';
import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import {
  BadgeDollarSign, Bot, BriefcaseBusiness, CheckCircle2,
  FileText, TrendingUp, UsersRound, Zap
} from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";
import FinanceBot from "./finance/FinanceBot.jsx";
import OrchestratorBot from "./orchestrator/OrchestratorBot.jsx";
import ProjectBot from "./project/ProjectBot.jsx";
import RecruitBot from "./recruit/RecruitBot.jsx";
import SalesBot from "./sales/SalesBot.jsx";
import ProjectHeart from "./shared/ProjectHeart.jsx";
import ROICalculator from "./shared/ROICalculator.jsx";
import LiveStatOrbs from "./shared/LiveStatOrbs.jsx";
import { defaultModuleForRole, ROLE_MODULES } from "../context/NexusAIContext.jsx";

/* ─── Design tokens ─────────────────────── */
const T = {
  bg:        "#020307",
  surface:   "#071013",
  surf2:     "#0b171a",
  border:    "rgba(211,255,245,0.09)",
  accent:    "#FF7A18",
  accentDim: "rgba(255,122,24,0.12)",
  white:     "#FFFFFF",
  grey:      "rgba(226,255,249,0.58)",
  greyDim:   "rgba(226,255,249,0.26)",
  green:     "#3CFFB5",
  cyan:      "#00E5FF",
  magenta:   "#FF4FD8",
  amber:     "#FFD166",
  mono:      "'JetBrains Mono', 'Courier New', monospace",
  display:   "'Syne', 'Helvetica Neue', Arial, sans-serif",
  body:      "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
};

const counters = [
  { label: "Applicants",  value: 1842, change: "+14.8%", icon: UsersRound,    note: "HR PIPELINE"  },
  { label: "Leads",       value: 936,  change: "+9.2%",  icon: TrendingUp,    note: "SALES OPS"    },
  { label: "Tasks",       value: 428,  change: "91% done",icon: CheckCircle2, note: "PROJECT MGMT" },
  { label: "Invoices",    value: 127,  change: "$284K",   icon: FileText,      note: "FINANCE OPS"  }
];

const throughput = [
  { name: "Mon", hr: 42, sales: 30 },
  { name: "Tue", hr: 58, sales: 44 },
  { name: "Wed", hr: 63, sales: 51 },
  { name: "Thu", hr: 72, sales: 66 },
  { name: "Fri", hr: 85, sales: 73 },
  { name: "Sat", hr: 74, sales: 62 },
];

const pipeline = [
  { name: "New",      value: 118 },
  { name: "Qualified", value: 86 },
  { name: "Proposal", value: 52 },
  { name: "Closed",   value: 31 },
];

const workload = [
  { name: "HR",      value: 32, fill: "#3CFFB5" },
  { name: "Sales",   value: 28, fill: "#00E5FF" },
  { name: "PM",      value: 24, fill: "#FF4FD8" },
  { name: "Finance", value: 16, fill: "#FFD166" },
];

const invoices = [
  { name: "W1", paid: 34, pending: 18 },
  { name: "W2", paid: 42, pending: 16 },
  { name: "W3", paid: 38, pending: 12 },
  { name: "W4", paid: 51, pending: 9  },
];

const feed = [
  { time: "09:42:18", agent: "HR Screener",    type: "HR",      message: "Ranked 42 applicants and flagged 7 senior matches." },
  { time: "09:44:03", agent: "Sales Closer",   type: "Sales",   message: "Moved 12 warm leads into proposal sequence." },
  { time: "09:46:27", agent: "PM Sentinel",    type: "PM",      message: "Resolved dependency drift on 3 launch tasks." },
  { time: "09:49:55", agent: "Finance Ledger", type: "Finance", message: "Matched 18 invoices and queued 4 approval exceptions." },
  { time: "09:52:11", agent: "Admin Guard",    type: "Admin",   message: "Rotated workspace policy tokens for privileged automations." },
];

const tooltipStyle = {
  border: `1px solid rgba(60,255,181,0.18)`,
  borderRadius: "2px",
  background: "#071013",
  color: "#fff",
  fontSize: "11px",
  fontFamily: "'JetBrains Mono', monospace",
};

function AnimatedNumber({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString("en-US"));
  useEffect(() => {
    const c = animate(count, value, { duration: 1.4, ease: "easeOut" });
    return c.stop;
  }, [count, value]);
  return <motion.span>{rounded}</motion.span>;
}

function CounterCard({ item, index }) {
  const Icon = item.icon;
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: "0px",
        padding: "28px 24px",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        transition: "border-color 0.2s ease",
      }}
      whileHover={{ borderColor: "rgba(60,255,181,0.3)" }}
    >
      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: T.accent, opacity: 0.7 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "2px",
          background: T.accentDim,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.accent
        }}>
          <Icon size={18} />
        </div>
        <span style={{
          fontFamily: T.mono, fontSize: "0.6rem",
          color: T.green,
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: "2px", padding: "3px 8px", letterSpacing: "0.05em"
        }}>{item.change}</span>
      </div>

      <p style={{ fontFamily: T.mono, fontSize: "0.6rem", color: T.greyDim, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px" }}>{item.note}</p>
      <p style={{ fontFamily: T.display, fontSize: "2.4rem", fontWeight: 700, color: T.white, margin: 0, letterSpacing: "-0.02em" }}>
        <AnimatedNumber value={item.value} />
      </p>
      <p style={{ fontFamily: T.body, fontSize: "0.78rem", color: T.grey, marginTop: "4px" }}>{item.label}</p>
    </motion.article>
  );
}

function ChartCard({ title, eyebrow, delay, children }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: "0px",
        padding: "24px",
        minHeight: "260px",
      }}
    >
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontFamily: T.mono, fontSize: "0.58rem", letterSpacing: "0.22em", color: T.accent, textTransform: "uppercase", marginBottom: "6px" }}>{eyebrow}</p>
          <h3 style={{ fontFamily: T.display, fontSize: "1rem", fontWeight: 700, color: T.white, margin: 0 }}>{title}</h3>
        </div>
        <Bot size={14} style={{ color: T.greyDim, marginTop: "2px" }} />
      </div>
      {children}
    </motion.article>
  );
}

function Dashboard({ role, theme, onToggleTheme, onSwitchRole }) {
  const [activeModule, setActiveModule] = useState(defaultModuleForRole(role));
  const [liveStats, setLiveStats] = useState({
    automations: 24,
    aiCalls: 128,
    latency: 1.8,
    savedHours: 46
  });
  const [orbStats, setOrbStats] = useState([
    { value: 20, label: "candidate records", color: "#3cffb5" },
    { value: "$1,635K", label: "pipeline value", color: "#00e5ff" },
    { value: "16%", label: "tasks complete", color: "#ffd166" },
    { value: 15, label: "finance anomalies", color: "#ff4fd8" }
  ]);
  const allowedModules = ROLE_MODULES[role?.id || "Admin"] || ROLE_MODULES.Admin;

  useEffect(() => {
    const next = defaultModuleForRole(role);
    setActiveModule((cur) => allowedModules.includes(cur) ? cur : next);
  }, [allowedModules, role]);

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const [resumes, leads, tasks, invoices] = await Promise.all([
          fetch("/sample-data/resumes.json").then((response) => response.json()),
          fetch("/sample-data/leads.json").then((response) => response.json()),
          fetch("/sample-data/tasks.json").then((response) => response.json()),
          fetch("/sample-data/invoices.json").then((response) => response.json())
        ]);
        if (!active) return;

        const pipelineValue = leads.reduce((sum, lead) => sum + Number(lead.deal_size || 0), 0);
        const completeTasks = tasks.filter((task) => task.status === "Done").length;
        const completionRate = Math.round((completeTasks / Math.max(tasks.length, 1)) * 100);
        const anomalies = invoices.filter((invoice) => invoice.anomaly).length;
        const aiCalls = resumes.length + leads.length + tasks.length + invoices.length;

        setLiveStats({
          automations: 5,
          aiCalls,
          latency: 1.8,
          savedHours: completeTasks * 4 + anomalies * 2
        });
        setOrbStats([
          { value: resumes.length, label: "candidate records", color: "#3cffb5" },
          { value: `$${Math.round(pipelineValue / 1000).toLocaleString("en-US")}K`, label: "pipeline value", color: "#00e5ff" },
          { value: `${completionRate}%`, label: "tasks complete", color: "#ffd166" },
          { value: anomalies, label: "finance anomalies", color: "#ff4fd8" }
        ]);
      } catch {
        // Keep the bundled fallback values if sample data cannot be loaded.
      }
    };

    loadStats();
    return () => {
      active = false;
    };
  }, []);

  const changeModule = (mod) => {
    if (!allowedModules.includes(mod)) return;
    setActiveModule(mod);
  };

  const isOverview = !["orchestrator", "recruit", "sales", "project", "finance"].includes(activeModule);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, fontFamily: T.body, position: "relative", overflow: "hidden" }}>
      <div className="quantum-field" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes blink-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>
        <Sidebar activeModule={activeModule} onModuleChange={changeModule} onSwitchRole={onSwitchRole} role={role} />

        <section style={{ flex: 1, minWidth: 0, paddingBottom: "80px" }}>
          <TopBar role={role} theme={theme} onToggleTheme={onToggleTheme} />

          <div style={{ padding: "32px 28px 0", maxWidth: "1400px" }}>

            {activeModule === "orchestrator" && <OrchestratorBot role={role} />}
            {activeModule === "recruit"      && <RecruitBot role={role} />}
            {activeModule === "sales"        && <SalesBot role={role} />}
            {activeModule === "project"      && <ProjectBot role={role} />}
            {activeModule === "finance"      && <FinanceBot role={role} />}

            {isOverview && (
              <>
                {/* Hero header */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}
                >
                  <div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "8px",
                      marginBottom: "14px", padding: "4px 12px",
                      border: "1px solid rgba(34,197,94,0.2)",
                      borderRadius: "2px", background: "rgba(34,197,94,0.05)"
                    }}>
                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: T.green, animation: "blink-dot 2s ease-in-out infinite" }} />
                      <span style={{ fontFamily: T.mono, fontSize: "0.58rem", letterSpacing: "0.2em", color: T.green, textTransform: "uppercase" }}>BUSINESS AUTOMATION PLATFORM</span>
                    </div>
                    <h1 style={{
                      fontFamily: T.display,
                      fontSize: "clamp(1.8rem, 3vw, 3.2rem)",
                      fontWeight: 800,
                      color: T.white,
                      margin: 0,
                      letterSpacing: "-0.02em",
                      lineHeight: 1
                    }}>
                      {(role?.title || "Admin").toUpperCase()} COMMAND CENTER
                    </h1>
                  </div>

                  <div style={{
                    background: T.surface,
                    border: `1px solid rgba(60,255,181,0.24)`,
                    borderRadius: "2px", padding: "16px 24px",
                    borderTop: `2px solid ${T.accent}`,
                  }}>
                    <p style={{ fontFamily: T.mono, fontSize: "0.58rem", letterSpacing: "0.2em", color: T.greyDim, textTransform: "uppercase", marginBottom: "6px" }}>ACTIVE AUTOMATIONS</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Zap size={14} style={{ color: T.accent }} />
                      <p style={{ fontFamily: T.display, fontSize: "1.5rem", fontWeight: 700, color: T.accent, margin: 0 }}>{liveStats.automations} ONLINE</p>
                    </div>
                  </div>
                </motion.div>

                {/* Counter cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1px", background: T.border, marginBottom: "1px" }}>
                  {counters.map((item, i) => <CounterCard key={item.label} item={item} index={i} />)}
                </div>

                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.18, ease: "easeOut" }}
                  className="holo-panel"
                  style={{
                    marginBottom: "1px",
                    padding: "18px 24px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "1px"
                  }}
                >
                  {[
                    ["LIVE AI CALLS", liveStats.aiCalls],
                    ["AVG AGENT LATENCY", `${liveStats.latency}s`],
                    ["HOURS SAVED", liveStats.savedHours],
                    ["ACTIVE MEMORY", "RAG READY"]
                  ].map(([label, value]) => (
                    <div key={label} style={{ padding: "12px 14px", borderLeft: `1px solid ${T.border}` }}>
                      <p style={{ fontFamily: T.mono, fontSize: "0.56rem", letterSpacing: "0.2em", color: T.greyDim, textTransform: "uppercase", marginBottom: "6px" }}>{label}</p>
                      <p style={{ fontFamily: T.display, fontSize: "1.28rem", color: T.white, fontWeight: 800, margin: 0 }}>{value}</p>
                    </div>
                  ))}
                </motion.section>

                <ProjectHeart />

                <div style={{ margin: "1px 0 24px" }}>
                  <LiveStatOrbs
                    eyebrow="Live dataset stats"
                    title="NexusAI at a glance"
                    stats={orbStats}
                  />
                </div>

                {/* Charts row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1px", background: T.border, marginBottom: "24px", marginTop: "1px" }}>
                  <ChartCard title="Agent Throughput" eyebrow="Automation" delay={0.22}>
                    <div style={{ height: "175px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={throughput}>
                          <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="name" stroke={T.greyDim} fontSize={10} fontFamily={T.mono} />
                          <YAxis stroke={T.greyDim} fontSize={10} fontFamily={T.mono} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Area type="monotone" dataKey="hr" stroke="#3CFFB5" fill="#3CFFB5" fillOpacity={0.08} strokeWidth={2} />
                          <Area type="monotone" dataKey="sales" stroke="rgba(0,229,255,0.58)" fill="rgba(0,229,255,0.05)" strokeWidth={1.5} strokeDasharray="4 3" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>

                  <ChartCard title="Sales Pipeline" eyebrow="Revenue" delay={0.28}>
                    <div style={{ height: "175px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pipeline}>
                          <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="name" stroke={T.greyDim} fontSize={10} fontFamily={T.mono} />
                          <YAxis stroke={T.greyDim} fontSize={10} fontFamily={T.mono} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                            {pipeline.map((_, i) => (
                              <Cell key={i} fill={["#3CFFB5", "#00E5FF", "#FF4FD8", "#FFD166"][i % 4]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>

                  <ChartCard title="Workload Split" eyebrow="Capacity" delay={0.34}>
                    <div style={{ height: "175px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip contentStyle={tooltipStyle} />
                          <Pie data={workload} dataKey="value" nameKey="name" innerRadius={48} outerRadius={76} paddingAngle={2}>
                            {workload.map((e) => <Cell key={e.name} fill={e.fill} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>

                  <ChartCard title="Invoice Velocity" eyebrow="Finance" delay={0.40}>
                    <div style={{ height: "175px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={invoices}>
                          <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="name" stroke={T.greyDim} fontSize={10} fontFamily={T.mono} />
                          <YAxis stroke={T.greyDim} fontSize={10} fontFamily={T.mono} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Line type="monotone" dataKey="paid"    stroke="#3CFFB5" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="pending" stroke="rgba(255,209,102,0.7)" strokeWidth={2} dot={false} strokeDasharray="4 3" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                </div>

                {/* Live agent feed */}
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.46, ease: "easeOut" }}
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderTop: `2px solid ${T.accent}`,
                    padding: "24px",
                    marginBottom: "24px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div>
                      <p style={{ fontFamily: T.mono, fontSize: "0.58rem", letterSpacing: "0.22em", color: T.accent, textTransform: "uppercase", marginBottom: "6px" }}>REAL-TIME</p>
                      <h2 style={{ fontFamily: T.display, fontSize: "1.1rem", fontWeight: 700, color: T.white, margin: 0 }}>LIVE AGENT EXECUTION LOG</h2>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: T.green, animation: "blink-dot 1.5s ease-in-out infinite" }} />
                      <span style={{ fontFamily: T.mono, fontSize: "0.58rem", color: T.green, letterSpacing: "0.15em" }}>5 AGENTS RUNNING</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: T.border }}>
                    {feed.map((item, i) => (
                      <motion.div
                        key={item.time}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.52 + i * 0.06 }}
                        style={{
                          background: T.bg,
                          borderLeft: `2px solid ${T.accent}`,
                          padding: "14px 16px",
                          transition: "background 0.15s ease",
                          cursor: "default"
                        }}
                        whileHover={{ backgroundColor: T.surf2 }}
                      >
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                          <span style={{ fontFamily: T.mono, fontSize: "0.62rem", color: T.greyDim }}>{item.time}</span>
                          <span style={{ fontFamily: T.display, fontSize: "0.85rem", fontWeight: 700, color: T.white }}>{item.agent}</span>
                          <span style={{
                            fontFamily: T.mono, fontSize: "0.55rem", letterSpacing: "0.15em",
                            textTransform: "uppercase", color: T.accent,
                            background: T.accentDim,
                            border: `1px solid rgba(60,255,181,0.24)`,
                            borderRadius: "2px", padding: "2px 7px"
                          }}>{item.type}</span>
                        </div>
                        <p style={{ fontSize: "0.82rem", color: T.grey, margin: 0, lineHeight: 1.6 }}>{item.message}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* ROI + status */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1px", background: T.border, marginBottom: "32px" }}>
                  <ROICalculator />
                  <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    style={{
                      background: T.surface,
                      borderTop: `2px solid ${T.accent}`,
                      padding: "24px",
                    }}
                  >
                    <p style={{ fontFamily: T.mono, fontSize: "0.58rem", letterSpacing: "0.22em", color: T.accent, textTransform: "uppercase", marginBottom: "10px" }}>DEPLOYMENT STATUS</p>
                    <h3 style={{ fontFamily: T.display, fontSize: "1rem", fontWeight: 700, color: T.white, marginBottom: "14px" }}>DEMO DATA PRELOADED</h3>
                    <p style={{ fontSize: "0.82rem", color: T.grey, lineHeight: 1.7, marginBottom: "20px" }}>
                      All 5 agent modules — Recruit, Sales, Project, Finance, and Admin — are loaded with sample data and ready to explore.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {["HR Screener", "Sales Closer", "PM Sentinel", "Finance Ledger", "Admin Guard"].map((agent) => (
                        <div key={agent} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: T.green, flexShrink: 0 }} />
                          <span style={{ fontFamily: T.mono, fontSize: "0.68rem", color: T.grey }}>{agent}</span>
                          <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: "0.58rem", color: T.green, letterSpacing: "0.1em" }}>ONLINE</span>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
