import React from 'react'
import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Moon, Search, Sun } from "lucide-react";
import { useNexusAI } from "../context/NexusAIContext.jsx";
import NotificationPanel from "./shared/NotificationPanel.jsx";
import TokenTracker from "./shared/TokenTracker.jsx";

function TopBar({ role, theme, onToggleTheme }) {
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const {
    alerts,
    unreadAlertCount,
    markAlertRead,
    clearAlerts
  } = useNexusAI();

  return (
    <>
      <motion.header
        className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] px-4 py-4 backdrop-blur-xl md:px-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-lg border border-[var(--border)] bg-white/5 px-3 py-2.5">
            <Search size={17} className="text-muted" />
            <input
              className="w-full bg-transparent text-sm text-[var(--text)] placeholder:text-muted"
              placeholder="Search agents, workflows, records"
              aria-label="Search NexusAI"
            />
          </div>

          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white/5 text-[var(--text)] hover:border-blue-400/50 hover:shadow-glow"
            aria-label="Notifications"
            title="Notifications"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell size={18} />
            {unreadAlertCount > 0 && (
              <span className="agent-output absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                {unreadAlertCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white/5 text-[var(--text)] hover:border-blue-400/50 hover:shadow-glow"
            onClick={onToggleTheme}
            aria-label="Toggle dark and light mode"
            title="Toggle theme"
          >
            <ThemeIcon size={18} />
          </button>

          <div className="flex items-center gap-2 rounded-lg border border-blue-400/30 bg-blue-500/15 px-3 py-2.5 text-sm font-bold text-blue-200 shadow-glow">
            <span>{role?.title || "Admin"}</span>
          </div>

          <TokenTracker />
        </div>
      </motion.header>

      <NotificationPanel
        open={notificationsOpen}
        alerts={alerts}
        onClose={() => setNotificationsOpen(false)}
        onMarkRead={markAlertRead}
        onClearAll={clearAlerts}
      />
    </>
  );
}

export default TopBar;

