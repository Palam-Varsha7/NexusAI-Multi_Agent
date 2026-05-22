import React from 'react'
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  Bot,
  BriefcaseBusiness,
  Home,
  ShieldCheck,
  UsersRound
} from "lucide-react";
import { ROLE_MODULES } from "../context/NexusAIContext.jsx";

const modules = [
  { id: "command", label: "Command", icon: Home },
  { id: "orchestrator", label: "Orchestrator", icon: Bot },
  { id: "recruit", label: "Recruit", icon: UsersRound },
  { id: "sales", label: "Sales", icon: BriefcaseBusiness },
  { id: "project", label: "Project", icon: ShieldCheck },
  { id: "finance", label: "Finance", icon: BadgeDollarSign }
];

const moduleLookup = Object.fromEntries(modules.map((module) => [module.id, module]));

function visibleModules(role) {
  const allowed = ROLE_MODULES[role?.id || "Admin"] || ROLE_MODULES.Admin;
  return allowed.map((id) => moduleLookup[id]).filter(Boolean);
}

function NavButton({ module, active, index, onModuleChange, compact = false }) {
  const Icon = module.icon;

  return (
    <motion.button
      key={module.label}
      type="button"
      className={`flex items-center rounded-lg border text-sm font-semibold transition ${
        compact
          ? "h-12 flex-1 justify-center px-2"
          : "w-full gap-3 px-3 py-3 text-left"
      } ${
        active
          ? "border-blue-400/30 bg-blue-500/15 text-blue-200 shadow-glow"
          : "border-transparent text-muted hover:border-white/10 hover:bg-white/5 hover:text-[var(--text)]"
      }`}
      initial={{ opacity: 0, x: compact ? 0 : -12, y: compact ? 12 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.36,
        delay: index * 0.04,
        ease: "easeOut"
      }}
      whileHover={{ y: -2 }}
      onClick={() => onModuleChange?.(module.id)}
      aria-label={module.label}
      title={module.label}
    >
      <Icon size={18} />
      {!compact && <span>{module.label}</span>}
    </motion.button>
  );
}

function Sidebar({ activeModule = "command", onModuleChange, onSwitchRole, role }) {
  const items = visibleModules(role);
  const mobileItems = items;

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] px-4 py-5 backdrop-blur-xl md:block">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-blue-400/30 bg-blue-500/15 text-blue-300 shadow-glow">
            <Bot size={22} />
          </div>
          <div>
            <p className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
              NexusAI
            </p>
            <p className="agent-output text-[11px] uppercase tracking-[0.18em] text-muted">
              Ops console
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {items.map((module, index) => (
            <NavButton
              key={module.id}
              module={module}
              active={activeModule === module.id}
              index={index}
              onModuleChange={onModuleChange}
            />
          ))}
        </nav>

        <div className="absolute bottom-5 left-4 right-4">
          <button
            type="button"
            className="hover-lift w-full rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3 text-left text-sm font-semibold text-[var(--text)]"
            onClick={onSwitchRole}
          >
            Switch role
          </button>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] p-2 backdrop-blur-xl md:hidden">
        {mobileItems.map((module, index) => (
          <NavButton
            key={module.id}
            module={module}
            active={activeModule === module.id}
            index={index}
            onModuleChange={onModuleChange}
            compact
          />
        ))}
        <button
          type="button"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white/5 text-xs font-bold text-muted hover:border-blue-400/40 hover:text-[var(--text)]"
          onClick={onSwitchRole}
          aria-label="Switch role"
          title="Switch role"
        >
          Role
        </button>
      </nav>
    </>
  );
}

export default Sidebar;

