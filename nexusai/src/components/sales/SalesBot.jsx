import React from 'react'
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, BarChart3, Sparkles } from "lucide-react";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";
import SkeletonCard from "../shared/SkeletonCard.jsx";
import StreamingOutput from "../shared/StreamingOutput.jsx";
import { useNexusAI } from "../../context/NexusAIContext.jsx";
import FollowUpDrafter from "./FollowUpDrafter.jsx";
import LeadCard from "./LeadCard.jsx";
import SentimentHeatmap from "./SentimentHeatmap.jsx";

const fallbackLead = {
  company: "Northstar Systems",
  tier: "Hot",
  score: 88,
  reasoning: "High urgency, clear operations pain, budget alignment, and recent engagement from a senior buyer.",
  confidence: 86
};

const fallbackSentiment = {
  sentiment_score: 72,
  label: "Positive",
  confidence: 82,
  weekly_data: [
    { day: "Mon", score: 42 },
    { day: "Tue", score: 55 },
    { day: "Wed", score: 64 },
    { day: "Thu", score: 72 },
    { day: "Fri", score: 78 },
    { day: "Sat", score: 69 },
    { day: "Sun", score: 74 }
  ]
};

function SalesBot({ role }) {
  const { addAlert } = useNexusAI();
  const [leadInfo, setLeadInfo] = useState(
    "Company: Northstar Systems\nIndustry: B2B SaaS\nBudget: $80K\nPain: Manual lead handoff and slow invoice follow-up\nEngagement: VP Sales opened pricing twice"
  );
  const [emailText, setEmailText] = useState(
    "Thanks for the proposal. The automation plan looks useful, but we need clarity on rollout time and whether finance approvals can be handled without extra admin work."
  );
  const [lead, setLead] = useState(null);
  const [leads, setLeads] = useState([]);
  const [sentiment, setSentiment] = useState(fallbackSentiment);
  const [summary, setSummary] = useState(
    "Weekly pipeline summary: 18 hot accounts, 31 warm accounts, and 3 cold deals need intervention. Highest leverage action is a finance automation proof for mid-market SaaS leads."
  );
  const [handledDeals, setHandledDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadLeads = async () => {
      setLoading(true);
      try {
        const response = await fetch("/sample-data/leads.json");
        const data = await response.json();
        if (!active) return;
        setLeads(data);
        const hotLead = data.find((item) => item.sentiment === "Hot") || data[0];
        if (hotLead) {
          setLead({
            company: hotLead.company,
            tier: hotLead.sentiment,
            score: hotLead.sentiment === "Hot" ? 88 : 62,
            reasoning: `${hotLead.contact} owns a ${hotLead.deal_size.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} opportunity.`,
            confidence: 84
          });
        }
        data
          .filter((item) => item.sentiment === "Cold")
          .forEach((item) =>
            addAlert({
              id: `sales-cold-${item.company}`,
              title: "Cold deal detected",
              message: `${item.company} is cooling; SalesBot recommends an automated executive follow-up.`,
              agent: "Sales",
              module: "sales",
              confidence: 83
            })
          );
      } catch {
        if (active) setLead(fallbackLead);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLeads();
    return () => {
      active = false;
    };
  }, [addAlert]);

  const coldDeals = useMemo(
    () =>
      leads
        .filter((item) => item.sentiment === "Cold")
        .map((item) => `${item.company} shows cold sentiment on a ${item.deal_size.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} opportunity.`),
    [leads]
  );

  const scoreLead = async () => {
    setApiLoading(true);
    try {
      const response = await fetch("/api/sales/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_info: leadInfo })
      });

      if (!response.ok) throw new Error("Sales API unavailable");
      const data = await response.json();
      setLead({
        company: data.company || "Scored Lead",
        tier: data.tier,
        score: data.score,
        reasoning: data.reasoning,
        confidence: data.confidence
      });
    } catch {
      setLead(fallbackLead);
    } finally {
      setApiLoading(false);
    }
  };

  const analyzeSentiment = async () => {
    try {
      const response = await fetch("/api/sales/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_text: emailText })
      });

      if (!response.ok) throw new Error("Sentiment API unavailable");
      setSentiment(await response.json());
    } catch {
      setSentiment(fallbackSentiment);
    }
  };

  const generateSummary = async () => {
    const pipelineContext = [
      `Selected lead: ${JSON.stringify(lead || fallbackLead)}`,
      `Email sentiment: ${JSON.stringify(sentiment)}`,
      `Cold deals: ${coldDeals.join(" | ")}`
    ].join("\n");
    try {
      const response = await fetch("/api/sales/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipeline_context: pipelineContext })
      });
      if (!response.ok) throw new Error("Sales summary API unavailable");
      const data = await response.json();
      const pieces = [
        data.summary,
        ...(data.opportunities || []).map((item) => `Opportunity: ${item}`),
        ...(data.risks || []).map((item) => `Risk: ${item}`),
        ...(data.actions || []).map((item) => `Action: ${item}`)
      ].filter(Boolean);
      setSummary(pieces.join(" "));
    } catch {
      setSummary(
        `${lead?.company || "The selected lead"} is currently ${(lead?.tier || "Warm").toLowerCase()} with a score of ${lead?.score || 62}. Agent recommendation: prioritize proof of value, address rollout concerns, and automate next-step follow-up for cold deals showing pricing activity.`
      );
    }
  };

  const handleColdDeal = (deal) => {
    setHandledDeals((current) =>
      current.includes(deal) ? current : [...current, deal]
    );
    setSummary(
      `SalesBot queued an executive follow-up, value recap, and 24-hour reminder for: ${deal}`
    );
    addAlert({
      id: `sales-handled-${deal}`,
      title: "Cold deal follow-up queued",
      message: `SalesBot created a recovery sequence for ${deal}`,
      agent: "Sales",
      module: "sales",
      confidence: 86
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col justify-between gap-4 md:flex-row md:items-end"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
      >
        <div>
          <p className="agent-output mb-3 text-xs uppercase tracking-[0.24em] text-blue-300">
            Sales agent
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-normal text-[var(--text)] md:text-5xl">
            Revenue intelligence
          </h1>
        </div>
        <ConfidenceBadge value={lead?.confidence || 82} />
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <motion.section
          className="glass-card hover-lift rounded-lg p-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.06, ease: "easeOut" }}
          whileHover={{ y: -2 }}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-500/15 text-orange-200">
              <BarChart3 size={20} />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-normal text-[var(--text)]">
                Score lead
              </h2>
              <p className="text-sm text-muted">Firmographics, urgency, and engagement</p>
            </div>
          </div>

          <textarea
            className="min-h-56 w-full resize-y rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm leading-6 text-[var(--text)]"
            value={leadInfo}
            onChange={(event) => setLeadInfo(event.target.value)}
          />
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-400"
            onClick={scoreLead}
          >
            <Sparkles size={17} />
            {apiLoading ? "Scoring..." : "Score lead"}
          </button>
        </motion.section>

        {loading && <SkeletonCard lines={5} />}
        {!loading && !lead && (
          <EmptyState icon={BarChart3} text="No lead data loaded yet." />
        )}
        {!loading && lead && <LeadCard lead={lead} index={2} />}
      </div>

      <motion.section
        className="glass-card rounded-lg p-5"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.16, ease: "easeOut" }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
            Sample lead pipeline
          </h3>
          <span className="agent-output text-xs text-muted">
            {role?.title || "Sales"} view
          </span>
        </div>
        {loading && <SkeletonCard lines={3} />}
        {!loading && !leads.length && (
          <EmptyState icon={BarChart3} text="No sample leads available." />
        )}
        {!loading && leads.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {leads.slice(0, 10).map((item) => (
              <button
                key={item.company}
                type="button"
                className="rounded-lg border border-[var(--border)] bg-white/5 p-3 text-left hover:border-blue-400/40"
                onClick={() =>
                  setLead({
                    company: item.company,
                    tier: item.sentiment,
                    score: item.sentiment === "Hot" ? 88 : item.sentiment === "Warm" ? 64 : 34,
                    reasoning: `${item.contact} owns a ${item.deal_size.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} opportunity.`,
                    confidence: 82
                  })
                }
              >
                <p className="font-bold text-[var(--text)]">{item.company}</p>
                <p className="agent-output mt-1 text-xs text-blue-300">
                  {item.sentiment} · {item.deal_size.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                </p>
              </button>
            ))}
          </div>
        )}
      </motion.section>

      <div className="grid gap-4 xl:grid-cols-2">
        <motion.section
          className="glass-card hover-lift rounded-lg p-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.18, ease: "easeOut" }}
          whileHover={{ y: -2 }}
        >
          <h3 className="mb-4 font-heading text-xl font-bold tracking-normal text-[var(--text)]">
            Email sentiment
          </h3>
          <textarea
            className="min-h-40 w-full resize-y rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm leading-6 text-[var(--text)]"
            value={emailText}
            onChange={(event) => setEmailText(event.target.value)}
          />
          <button
            type="button"
            className="mt-4 rounded-lg border border-blue-400/30 bg-blue-500/15 px-4 py-3 text-sm font-bold text-blue-200 hover:shadow-glow"
            onClick={analyzeSentiment}
          >
            Analyze sentiment
          </button>
        </motion.section>

        <SentimentHeatmap sentiment={sentiment} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <FollowUpDrafter lead={lead || fallbackLead} />

        <motion.section
          className="glass-card rounded-lg p-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.3, ease: "easeOut" }}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/15 text-red-200">
              <AlertTriangle size={18} />
            </span>
            <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
              Cold deal alerts
            </h3>
          </div>
          <div className="space-y-3">
            {loading && <SkeletonCard lines={3} />}
            {!loading && !coldDeals.length && (
              <EmptyState icon={AlertTriangle} text="No cold deals detected." />
            )}
            {!loading && coldDeals.map((deal, index) => (
              <motion.div
                key={deal}
                className="rounded-lg border border-[var(--border)] bg-white/5 p-4"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.36,
                  delay: 0.36 + index * 0.06,
                  ease: "easeOut"
                }}
              >
                <p className="mb-3 text-sm leading-6 text-muted">{deal}</p>
                <button
                  type="button"
                  className="rounded-lg border border-orange-400/30 bg-orange-500/15 px-3 py-2 text-sm font-bold text-orange-200 hover:shadow-glow"
                  onClick={() => handleColdDeal(deal)}
                >
                  {handledDeals.includes(deal) ? "Queued" : "Let agent handle it"}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      <motion.section
        className="glass-card rounded-lg p-5"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.42, ease: "easeOut" }}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-2xl font-bold tracking-normal text-[var(--text)]">
            Weekly summary report
          </h3>
          <button
            type="button"
            className="rounded-lg bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-400"
            onClick={generateSummary}
          >
            Generate report
          </button>
        </div>
        <StreamingOutput text={summary} />
        <div className="mt-4">
          <ReasoningTrace
            steps={[
              "Rolled up lead tier distribution and blocked opportunities.",
              "Highlighted accounts with engagement but weak next-step momentum.",
              "Generated recommended agent actions for the coming week."
            ]}
          />
        </div>
      </motion.section>
    </div>
  );
}

export default SalesBot;

