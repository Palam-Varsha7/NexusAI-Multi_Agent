import React from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const NexusAIContext = createContext(null);

export const ROLE_MODULES = {
  HR: ["recruit"],
  Sales: ["sales"],
  PM: ["project"],
  Finance: ["finance"],
  Admin: ["command", "orchestrator", "recruit", "sales", "project", "finance"]
};

export const defaultModuleForRole = (role) => {
  const id = typeof role === "string" ? role : role?.id;
  return ROLE_MODULES[id]?.[0] || "command";
};

function normalizeAlert(alert) {
  const createdAt = alert.createdAt || new Date().toISOString();

  return {
    id: alert.id || `${alert.agent || "NexusAI"}-${alert.title || createdAt}`,
    title: alert.title || "Proactive alert",
    message: alert.message || "NexusAI found a workflow signal that needs attention.",
    agent: alert.agent || "NexusAI",
    confidence: alert.confidence || 82,
    module: alert.module || "command",
    read: false,
    createdAt,
    ...alert
  };
}

export function NexusAIProvider({ children }) {
  const [role, setRole] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((alert) => {
    const normalized = normalizeAlert(alert);
    setAlerts((current) => {
      if (current.some((item) => item.id === normalized.id)) return current;
      return [normalized, ...current];
    });
  }, []);

  const markAlertRead = useCallback((id) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id ? { ...alert, read: true } : alert
      )
    );
  }, []);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  const value = useMemo(
    () => ({
      role,
      setRole,
      alerts,
      unreadAlertCount: alerts.filter((alert) => !alert.read).length,
      addAlert,
      markAlertRead,
      clearAlerts
    }),
    [alerts, role]
  );

  return (
    <NexusAIContext.Provider value={value}>
      {children}
    </NexusAIContext.Provider>
  );
}

export function useNexusAI() {
  const context = useContext(NexusAIContext);
  if (!context) {
    throw new Error("useNexusAI must be used inside NexusAIProvider");
  }
  return context;
}
