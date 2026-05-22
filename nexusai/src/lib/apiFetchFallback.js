export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function apiUrl(path) {
  if (!path || !path.startsWith("/api")) return path;
  return `${API_BASE_URL}${path}`;
}

function apiPathFrom(input) {
  if (typeof input === "string") return input.startsWith("/api") ? input : null;
  if (input instanceof URL) return input.pathname.startsWith("/api") ? input.pathname + input.search : null;
  if (input instanceof Request) {
    const url = new URL(input.url);
    return url.pathname.startsWith("/api") ? url.pathname + url.search : null;
  }
  return null;
}

export function installApiFetchFallback() {
  if (window.__nexusApiFetchFallbackInstalled) return;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const apiPath = apiPathFrom(input);
    if (!apiPath) return nativeFetch(input, init);

    try {
      const response = await nativeFetch(input, init);
      const contentType = response.headers.get("content-type") || "";
      const isSpaFallback = response.ok && contentType.includes("text/html");
      if (!isSpaFallback && (response.ok || ![404, 405].includes(response.status))) {
        return response;
      }
    } catch {
      // Retry against the local FastAPI server below.
    }

    return nativeFetch(apiUrl(apiPath), init);
  };

  window.__nexusApiFetchFallbackInstalled = true;
}
