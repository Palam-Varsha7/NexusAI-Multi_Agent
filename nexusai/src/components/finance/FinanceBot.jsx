import React from 'react'
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BadgeDollarSign, ReceiptText, Sparkles, WalletCards } from "lucide-react";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";
import SkeletonCard from "../shared/SkeletonCard.jsx";
import StreamingOutput from "../shared/StreamingOutput.jsx";
import { useNexusAI } from "../../context/NexusAIContext.jsx";
import AnomalyCard from "./AnomalyCard.jsx";
import BudgetChart from "./BudgetChart.jsx";
import CashFlowChart from "./CashFlowChart.jsx";
import InvoiceDrafter from "./InvoiceDrafter.jsx";

const seedExpenses = [
  { vendor: "CloudGrid", category: "Infra", amount: 12400 },
  { vendor: "Launchly Ads", category: "Marketing", amount: 18900 },
  { vendor: "Northstar Travel", category: "Travel", amount: 7400 },
  { vendor: "LegalWorks", category: "Legal", amount: 5200 }
];

const cashFlow = [
  { month: "Jan", predicted: 82, actual: 78 },
  { month: "Feb", predicted: 88, actual: 86 },
  { month: "Mar", predicted: 95, actual: 91 },
  { month: "Apr", predicted: 104, actual: 98 },
  { month: "May", predicted: 116, actual: 109 },
  { month: "Jun", predicted: 124, actual: 118 }
];

const budgetData = [
  { category: "Infra", budget: 18, actual: 21 },
  { category: "Sales", budget: 26, actual: 24 },
  { category: "Legal", budget: 9, actual: 12 },
  { category: "Travel", budget: 8, actual: 14 }
];

function FinanceBot({ role }) {
  const { addAlert } = useNexusAI();
  const [expensesText, setExpensesText] = useState(
    JSON.stringify(seedExpenses, null, 2)
  );
  const [anomalies, setAnomalies] = useState([]);
  const [normalCount, setNormalCount] = useState(2);
  const [summary, setSummary] = useState(
    "Monthly summary: revenue collections are healthy, but marketing and travel require review. Cash flow remains positive with a 7% gap between predicted and actual receipts."
  );
  const [confidence, setConfidence] = useState(84);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadInvoices = async () => {
      setLoading(true);
      try {
        const response = await fetch("/sample-data/invoices.json");
        const invoices = await response.json();
        if (!active) return;
        const expenses = invoices.map((invoice) => ({
          vendor: invoice.vendor,
          category: invoice.category,
          amount: invoice.amount
        }));
        const flagged = invoices
          .filter((invoice) => invoice.anomaly)
          .map((invoice) => ({
            vendor: invoice.vendor,
            category: invoice.category,
            amount: invoice.amount,
            reason: `${invoice.category} spend on ${invoice.date} is outside the normal approval band.`,
            confidence: 82
          }));
        setExpensesText(JSON.stringify(expenses.slice(0, 8), null, 2));
        setAnomalies(flagged);
        setNormalCount(invoices.length - flagged.length);
        flagged.forEach((invoice) =>
          addAlert({
            id: `finance-anomaly-${invoice.vendor}-${invoice.amount}`,
            title: "Finance anomaly detected",
            message: `${invoice.vendor} posted ${Number(invoice.amount).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}; FinanceBot recommends review.`,
            agent: "Finance",
            module: "finance",
            confidence: invoice.confidence
          })
        );
      } catch {
        if (active) setAnomalies([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadInvoices();
    return () => {
      active = false;
    };
  }, [addAlert]);

  const scanExpenses = async () => {
    setApiLoading(true);
    let expenses = seedExpenses;
    try {
      expenses = JSON.parse(expensesText);
    } catch {
      expenses = seedExpenses;
    }

    try {
      const response = await fetch("/api/finance/anomaly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenses })
      });

      if (!response.ok) throw new Error("Finance anomaly API unavailable");
      const data = await response.json();
      setAnomalies(data.anomalies || []);
      setNormalCount(data.normal?.length || 0);
      setConfidence(data.confidence || 82);
      (data.anomalies || []).forEach((anomaly) =>
        addAlert({
          id: `finance-api-anomaly-${anomaly.vendor}-${anomaly.amount}`,
          title: "Finance anomaly detected",
          message: `${anomaly.vendor} needs finance review after the latest anomaly scan.`,
          agent: "Finance",
          module: "finance",
          confidence: anomaly.confidence || 82
        })
      );
    } catch {
      setAnomalies([
        {
          vendor: "Launchly Ads",
          amount: 18900,
          reason: "Marketing spend is materially above the expected category range.",
          confidence: 82
        }
      ]);
      setNormalCount(Math.max(0, expenses.length - 1));
      setConfidence(82);
    } finally {
      setApiLoading(false);
    }
  };

  const generateSummary = async () => {
    try {
      const response = await fetch("/api/finance/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finance_context: [
            `Expenses: ${expensesText}`,
            `Anomalies: ${JSON.stringify(anomalies)}`,
            `Normal count: ${normalCount}`,
            `Cash flow: ${JSON.stringify(cashFlow)}`,
            `Budget: ${JSON.stringify(budgetData)}`
          ].join("\n")
        })
      });
      if (!response.ok) throw new Error("Finance summary API unavailable");
      const data = await response.json();
      setSummary(
        [
          data.summary,
          ...(data.metrics || []).map((item) => `Metric: ${item}`),
          ...(data.actions || []).map((item) => `Action: ${item}`)
        ].filter(Boolean).join(" ")
      );
      setConfidence(data.confidence || 84);
    } catch {
      setSummary(
        "Monthly summary: cash receipts are tracking below forecast, two expense anomalies need review, and budget pressure is concentrated in travel and legal. Recommended action: pause non-critical spend until collections close."
      );
      setConfidence(81);
    }
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
            Finance agent
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-normal text-[var(--text)] md:text-5xl">
            Financial intelligence
          </h1>
        </div>
        <ConfidenceBadge value={confidence} />
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
              <ReceiptText size={20} />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-normal text-[var(--text)]">
                Expense anomaly scan
              </h2>
              <p className="text-sm text-muted">
                Paste expense JSON table input · {role?.title || "Finance"} view
              </p>
            </div>
          </div>
          <textarea
            className="min-h-60 w-full resize-y rounded-lg border border-[var(--border)] bg-white/5 p-4 font-mono text-sm leading-6 text-[var(--text)]"
            value={expensesText}
            onChange={(event) => setExpensesText(event.target.value)}
          />
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-400"
            onClick={scanExpenses}
          >
            <Sparkles size={17} />
            {apiLoading ? "Scanning..." : "Scan expenses"}
          </button>
        </motion.section>

        <motion.section
          className="glass-card rounded-lg p-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.12, ease: "easeOut" }}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="agent-output mb-2 text-[11px] uppercase tracking-[0.18em] text-blue-300">
                Anomaly queue
              </p>
              <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
                {anomalies.length} flagged · {normalCount} normal
              </h3>
            </div>
            <ConfidenceBadge value={confidence} />
          </div>
          <div className="space-y-3">
            {loading && <SkeletonCard lines={4} />}
            {!loading && !anomalies.length && (
              <EmptyState icon={WalletCards} text="No finance anomalies detected." />
            )}
            {!loading && anomalies.map((anomaly, index) => (
              <AnomalyCard
                key={`${anomaly.vendor}-${index}`}
                anomaly={anomaly}
                index={index}
              />
            ))}
          </div>
        </motion.section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CashFlowChart data={cashFlow} confidence={confidence} />
        <BudgetChart
          data={budgetData}
          confidence={confidence}
          commentary="AI commentary: travel and legal are running above plan, while sales is under budget. Rebalance discretionary spend toward collections and protect infrastructure capacity."
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <InvoiceDrafter />

        <motion.section
          className="glass-card hover-lift rounded-lg p-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.36, ease: "easeOut" }}
          whileHover={{ y: -2 }}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/15 text-green-200">
                <BadgeDollarSign size={18} />
              </span>
              <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
                Monthly summary
              </h3>
            </div>
            <button
              type="button"
              className="rounded-lg border border-blue-400/30 bg-blue-500/15 px-3 py-2 text-sm font-bold text-blue-200 hover:shadow-glow"
              onClick={generateSummary}
            >
              Generate
            </button>
          </div>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {[
              ["Runway", "14.2 mo"],
              ["AR open", "$184K"],
              ["Burn", "$72K"]
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--border)] bg-white/5 p-3"
              >
                <p className="text-xs font-semibold text-muted">{label}</p>
                <p className="agent-output mt-1 text-lg font-bold text-[var(--text)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <StreamingOutput text={summary} />
          <div className="mt-4">
            <ReasoningTrace
              steps={[
                "Combined cash flow, anomaly, and budget variance signals.",
                "Prioritized metrics with direct operating impact.",
                "Generated a short summary for monthly finance review."
              ]}
            />
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default FinanceBot;

