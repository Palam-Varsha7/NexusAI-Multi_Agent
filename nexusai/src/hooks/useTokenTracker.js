import { useEffect, useState } from "react";

export const TOKEN_EVENT = "nexusai:token-usage";

let fetchInstrumented = false;

export function recordTokenUsage(tokens = 0, requests = 1) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(TOKEN_EVENT, {
      detail: {
        tokens: Number(tokens) || 0,
        requests: Number(requests) || 1
      }
    })
  );
}

function estimateTokens(url, options) {
  const body = options?.body;
  const bodySize =
    typeof body === "string"
      ? body.length
      : body instanceof FormData
        ? 900
        : 420;

  if (String(url).includes("/rag/")) return 1200;
  if (String(url).includes("/report/")) return 1800;
  if (String(url).includes("/orchestrator/")) return 1600;
  return Math.max(350, Math.round(bodySize / 3));
}

function instrumentFetch() {
  if (typeof window === "undefined" || fetchInstrumented || !window.fetch) return;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, options) => {
    const response = await nativeFetch(input, options);
    const url = typeof input === "string" ? input : input?.url || "";

    if (url.includes("/api/")) {
      let tokens = estimateTokens(url, options);
      try {
        const clone = response.clone();
        const contentType = clone.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await clone.json();
          tokens = Number(data.tokens_used) || tokens;
        }
      } catch {
        tokens = estimateTokens(url, options);
      }
      recordTokenUsage(tokens, 1);
    }

    return response;
  };

  fetchInstrumented = true;
}

export function useTokenTracker(initialUsage = { tokens: 128400, requests: 24 }) {
  const [usage, setUsage] = useState(initialUsage);

  useEffect(() => {
    instrumentFetch();

    const onUsage = (event) => {
      setUsage((current) => ({
        tokens: current.tokens + event.detail.tokens,
        requests: current.requests + event.detail.requests
      }));
    };

    window.addEventListener(TOKEN_EVENT, onUsage);
    return () => window.removeEventListener(TOKEN_EVENT, onUsage);
  }, []);

  return usage;
}

export default useTokenTracker;
